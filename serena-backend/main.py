from fastapi import FastAPI, status, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import numpy as np
import tensorflow as tf
import json
import os
import hashlib
from datetime import datetime, timedelta
from tensorflow.keras.layers import TextVectorization
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
import jwt
from database import Database

load_dotenv()

# Auth Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

def hash_password(password: str) -> str:
    """Simple password hashing for demo purposes"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return hash_password(plain_password) == hashed_password

security = HTTPBearer()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

# Authentication Models
class UserSignup(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = None

class UserLogin(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    otp: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class User(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None

# Chat Models
class PredictRequest(BaseModel):
    text: str
    conversation_id: Optional[int] = None

class PredictResponse(BaseModel):
    intent: str
    response: str
    conversation_id: int

# Conversation Models
class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"

class ConversationUpdate(BaseModel):
    title: str

class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    intent: Optional[str]
    created_at: str

class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: str
    updated_at: str
    is_archived: bool
    message_count: int
    last_message: Optional[str]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gemini_client = None
if GEMINI_API_KEY:
    gemini_client = client
@app.on_event("startup")
async def load_model():
    global model, class_names, responses
    model = tf.keras.models.load_model(
        "./models/chatbot.keras",
        custom_objects={"TextVectorization": TextVectorization},
        compile=False
    )
    class_names = np.load("./models/classes.npy", allow_pickle=True)
    with open("./models/dataset.json", "r") as f:
        data = json.load(f)
    responses = {
        intent["tag"]: intent.get("responses", [])
        for intent in data.get("intents", [])
    }
@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest, credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Verify user authentication
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    
    # Get or create conversation
    conversation_id = req.conversation_id
    if not conversation_id:
        # Create new conversation with auto-generated title
        conversation_id = Database.create_conversation(user_id, "New Chat")
    else:
        # Verify user owns this conversation
        conv = Database.get_conversation(conversation_id, user_id)
        if not conv:
            raise HTTPException(status_code=403, detail="Access denied to this conversation")
    
    # Save user message
    Database.add_message(conversation_id, "user", req.text)
    
    # Generate AI response
    texts = np.array([req.text], dtype=object)
    preds = model.predict(texts)
    idx = int(np.argmax(preds, axis=1)[0])
    intent = class_names[idx]
    
    if gemini_client:
        try:
            # Get conversation history for context (last 10 messages)
            history = Database.get_conversation_messages(conversation_id, user_id, limit=10)
            context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history[-5:]])  # Last 5 messages
            
            prompt = f"""You are a mental wellness support chatbot.

Your purpose is to provide empathetic, supportive, and calming responses to users who may be experiencing stress, anxiety, sadness, or emotional overwhelm.

IMPORTANT RULES:
- You are NOT a doctor, therapist, or medical professional.
- Do NOT diagnose mental health conditions.
- Do NOT provide medical or clinical advice.
- Always respond with empathy, kindness, and respect.
- Use simple, non-judgmental, and reassuring language.
- Avoid absolute statements like "everything will be okay".
- Offer gentle coping strategies or grounding exercises when appropriate.
- Encourage healthy self-reflection.

SAFETY INSTRUCTIONS:
If the user expresses thoughts of self-harm, suicide, or extreme emotional distress:
- Respond with extra care and compassion.
- Acknowledge their feelings.
- Encourage them to reach out to a trusted person or a mental health professional.
- Suggest contacting local emergency services or a suicide prevention helpline.
- Do NOT provide any instructions related to self-harm.

Always prioritize the user's emotional safety and well-being.

Recent conversation context:
{context}

Current user message:
"{req.text}"

Respond in a calm, supportive, and understanding tone.
Keep the response concise, helpful, and reassuring."""
            
            response = gemini_client.models.generate_content(
                model='gemini-2.0-flash-exp',
                contents=prompt
            )
            reply = response.text.strip()
        except Exception as e:
            print(f"Gemini API error: {e}")
            reply = "I'm having trouble connecting right now. Please try again."
    else:
        reply = "Gemini API is not configured."
    
    # Save AI response
    Database.add_message(conversation_id, "assistant", reply, intent)
    
    # Auto-generate conversation title if it's a new conversation
    messages = Database.get_conversation_messages(conversation_id, user_id)
    if len(messages) == 2:  # First exchange
        # Use first few words of user's message as title
        title = req.text[:50] + ("..." if len(req.text) > 50 else "")
        Database.update_conversation_title(conversation_id, user_id, title)
    
    return PredictResponse(intent=intent, response=reply, conversation_id=conversation_id)

@app.get("/")
def root():
    return {"msg": "Therapeutic chatbot API up and running!"}

@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    return {"status": "healthy"}

# Authentication Endpoints
@app.post("/auth/signup", response_model=Token)
async def signup(user: UserSignup):
    # Basic validation
    if not user.email and not user.phone:
        raise HTTPException(status_code=400, detail="Email or phone is required")
    
    user_id = user.email or user.phone
    
    # Check if user already exists
    if Database.get_user(user_id):
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Hash password if provided
    hashed_password = None
    if user.password:
        hashed_password = hash_password(user.password)
    
    # Store user in database
    Database.create_user(user_id, user.name, user.email, user.phone, hashed_password)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user={"id": user_id, "name": user.name, "email": user.email, "phone": user.phone}
    )

@app.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user_id = credentials.email or credentials.phone
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = Database.get_user(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password if provided
    if credentials.password:
        if not user["hashed_password"] or not verify_password(credentials.password, user["hashed_password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # For phone login with OTP, we'll accept any OTP in demo mode
    # In production, implement proper OTP verification
    
    # Update last active
    Database.update_last_active(user_id)
    
    access_token = create_access_token(data={"sub": user_id})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user={"id": user["id"], "name": user["name"], "email": user.get("email"), "phone": user.get("phone")}
    )

@app.get("/auth/me", response_model=User)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        
        user = Database.get_user(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        
        return User(
            id=user["id"],
            name=user["name"],
            email=user.get("email"),
            phone=user.get("phone")
        )
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Helper function to get current user from token
async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")

# Conversation Management Endpoints
@app.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    include_archived: bool = False,
    user_id: str = Depends(get_current_user_id)
):
    """Get all conversations for the current user"""
    conversations = Database.get_user_conversations(user_id, include_archived)
    return conversations

@app.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    conv: ConversationCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new conversation"""
    conv_id = Database.create_conversation(user_id, conv.title)
    conversations = Database.get_user_conversations(user_id)
    created_conv = next((c for c in conversations if c["id"] == conv_id), None)
    if not created_conv:
        raise HTTPException(status_code=500, detail="Failed to create conversation")
    return created_conv

@app.get("/conversations/{conversation_id}", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: int,
    user_id: str = Depends(get_current_user_id)
):
    """Get all messages in a conversation"""
    messages = Database.get_conversation_messages(conversation_id, user_id)
    return messages

@app.patch("/conversations/{conversation_id}")
async def update_conversation(
    conversation_id: int,
    update: ConversationUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update conversation title"""
    conv = Database.get_conversation(conversation_id, user_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    Database.update_conversation_title(conversation_id, user_id, update.title)
    return {"message": "Conversation updated successfully"}

@app.post("/conversations/{conversation_id}/archive")
async def archive_conversation(
    conversation_id: int,
    archive: bool = True,
    user_id: str = Depends(get_current_user_id)
):
    """Archive or unarchive a conversation"""
    conv = Database.get_conversation(conversation_id, user_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    Database.archive_conversation(conversation_id, user_id, archive)
    return {"message": f"Conversation {'archived' if archive else 'unarchived'} successfully"}

@app.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a conversation and all its messages"""
    conv = Database.get_conversation(conversation_id, user_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    Database.delete_conversation(conversation_id, user_id)
    return {"message": "Conversation deleted successfully"}

@app.get("/search")
async def search_messages(
    q: str,
    user_id: str = Depends(get_current_user_id)
):
    """Search through user's message history"""
    if len(q) < 2:
        raise HTTPException(status_code=400, detail="Search query must be at least 2 characters")
    
    results = Database.search_messages(user_id, q)
    return results