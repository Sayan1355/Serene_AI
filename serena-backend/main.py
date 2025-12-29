from fastapi import FastAPI, status, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
import numpy as np
import tensorflow as tf
import json
import os
import re
import random
import string
from datetime import datetime, timedelta
from tensorflow.keras.layers import TextVectorization
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
import jwt
from passlib.context import CryptContext
from database import Database, MoodDatabase, JournalDatabase, GoalsDatabase

load_dotenv()

# Auth Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OTP storage (in production, use Redis)
otp_store = {}

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password meets security requirements"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one number"
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character"
    return True, "Password is strong"

def generate_otp() -> str:
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

def send_email_otp(email: str, otp: str) -> bool:
    """Send OTP via email (placeholder - implement with your email service)"""
    # TODO: Implement actual email sending using SMTP or email service API
    print(f"Email OTP for {email}: {otp}")
    return True

def send_sms_otp(phone: str, otp: str) -> bool:
    """Send OTP via SMS (placeholder - implement with Twilio or similar)"""
    # TODO: Implement actual SMS sending using Twilio or similar service
    print(f"SMS OTP for {phone}: {otp}")
    return True

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
    provider: Optional[str] = None  # 'email', 'google', 'facebook'
    provider_id: Optional[str] = None  # ID from OAuth provider

class UserLogin(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    otp: Optional[str] = None
    provider: Optional[str] = None
    provider_token: Optional[str] = None

class OTPRequest(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class OTPVerify(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    otp: str

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

# Mood Models
class MoodEntry(BaseModel):
    mood_level: int  # 1-5 scale
    mood_emoji: str
    notes: Optional[str] = None

class MoodResponse(BaseModel):
    id: int
    mood_level: int
    mood_emoji: str
    notes: Optional[str]
    created_at: str

# Journal Models
class JournalCreate(BaseModel):
    title: Optional[str] = None
    content: str
    mood_level: Optional[int] = None

class JournalUpdate(BaseModel):
    title: Optional[str]
    content: str
    mood_level: Optional[int]

class JournalResponse(BaseModel):
    id: int
    user_id: str
    title: Optional[str]
    content: str
    mood_level: Optional[int]
    created_at: str
    updated_at: str

class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    target_value: int
    unit: str
    target_date: str

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_value: Optional[int] = None
    target_date: Optional[str] = None

class GoalProgressUpdate(BaseModel):
    current_value: int

class GoalResponse(BaseModel):
    id: int
    user_id: str
    title: str
    description: Optional[str]
    category: str
    target_value: int
    current_value: int
    unit: str
    start_date: str
    target_date: str
    status: str
    progress_percentage: float
    created_at: str
    updated_at: str
    completed_at: Optional[str]

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
@app.post("/auth/send-otp")
async def send_otp(request: OTPRequest):
    """Send OTP to email or phone"""
    if not request.email and not request.phone:
        raise HTTPException(status_code=400, detail="Email or phone is required")
    
    # Generate OTP
    otp = generate_otp()
    identifier = request.email or request.phone
    
    # Store OTP with expiration (5 minutes)
    otp_store[identifier] = {
        "otp": otp,
        "expires_at": datetime.now() + timedelta(minutes=5)
    }
    
    # Send OTP
    if request.email:
        send_email_otp(request.email, otp)
    elif request.phone:
        send_sms_otp(request.phone, otp)
    
    return {"message": "OTP sent successfully", "expires_in": 300}

@app.post("/auth/verify-otp")
async def verify_otp(request: OTPVerify):
    """Verify OTP"""
    identifier = request.email or request.phone
    
    if identifier not in otp_store:
        raise HTTPException(status_code=400, detail="No OTP found. Please request a new one.")
    
    stored_data = otp_store[identifier]
    
    # Check expiration
    if datetime.now() > stored_data["expires_at"]:
        del otp_store[identifier]
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")
    
    # Verify OTP
    if stored_data["otp"] != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Clear OTP after successful verification
    del otp_store[identifier]
    
    return {"message": "OTP verified successfully", "verified": True}

@app.post("/auth/signup", response_model=Token)
async def signup(user: UserSignup):
    # Validation
    if not user.email and not user.phone:
        raise HTTPException(status_code=400, detail="Email or phone is required")
    
    user_id = user.email or user.phone
    
    # Check if user already exists
    existing_user = Database.get_user(user_id)
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email/phone already exists")
    
    # OTP verification disabled for now - direct signup allowed
    
    # Validate password strength for email/password signup
    if user.password and not user.provider:
        # Simplified validation - at least 6 characters
        if len(user.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
    
    # Hash password if provided
    hashed_password = None
    if user.password:
        hashed_password = hash_password(user.password)
    
    try:
        # Store user in database
        Database.create_user(user_id, user.name, user.email, user.phone, hashed_password)
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to create user: {str(e)}")
    
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
    return {"results": results}

# Mood Tracking Endpoints
@app.post("/mood", response_model=MoodResponse)
async def create_mood_entry(
    mood: MoodEntry,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new mood entry"""
    mood_id = MoodDatabase.add_mood_entry(
        user_id=user_id,
        mood_level=mood.mood_level,
        mood_emoji=mood.mood_emoji,
        notes=mood.notes
    )
    return MoodResponse(
        id=mood_id,
        user_id=user_id,
        mood_level=mood.mood_level,
        mood_emoji=mood.mood_emoji,
        notes=mood.notes,
        created_at=datetime.now().isoformat()
    )

@app.get("/mood/history")
async def get_mood_history(
    days: int = 30,
    user_id: str = Depends(get_current_user_id)
):
    """Get user's mood history for the specified number of days"""
    moods = MoodDatabase.get_user_moods(user_id, days)
    return {"moods": moods, "period_days": days}

@app.get("/mood/analytics")
async def get_mood_analytics(
    days: int = 30,
    user_id: str = Depends(get_current_user_id)
):
    """Get mood analytics and trends"""
    analytics = MoodDatabase.get_mood_analytics(user_id, days)
    return analytics

# Journal Endpoints
@app.post("/journal", response_model=JournalResponse)
async def create_journal_entry(
    journal: JournalCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new journal entry"""
    entry_id = JournalDatabase.create_journal_entry(
        user_id=user_id,
        title=journal.title,
        content=journal.content,
        mood_level=journal.mood_level
    )
    return JournalResponse(
        id=entry_id,
        user_id=user_id,
        title=journal.title,
        content=journal.content,
        mood_level=journal.mood_level,
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat()
    )

@app.get("/journal")
async def get_journal_entries(
    limit: int = 50,
    user_id: str = Depends(get_current_user_id)
):
    """Get user's journal entries"""
    entries = JournalDatabase.get_user_journals(user_id, limit)
    return {"entries": entries, "total": len(entries)}

@app.put("/journal/{entry_id}")
async def update_journal_entry(
    entry_id: int,
    journal: JournalUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update a journal entry"""
    JournalDatabase.update_journal_entry(
        entry_id=entry_id,
        user_id=user_id,
        title=journal.title,
        content=journal.content,
        mood_level=journal.mood_level
    )
    return {"message": "Journal entry updated successfully"}

@app.delete("/journal/{entry_id}")
async def delete_journal_entry(
    entry_id: int,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a journal entry"""
    JournalDatabase.delete_journal_entry(entry_id, user_id)
    return {"message": "Journal entry deleted successfully"}

# User Account Management
@app.delete("/auth/delete-account")
async def delete_account(user_id: str = Depends(get_current_user_id)):
    """Permanently delete user account and all associated data"""
    try:
        # Delete all user data from all tables
        conn = sqlite3.connect('serene.db')
        cursor = conn.cursor()
        
        # Delete mood entries
        cursor.execute("DELETE FROM mood_entries WHERE user_id = ?", (user_id,))
        
        # Delete journal entries
        cursor.execute("DELETE FROM journal_entries WHERE user_id = ?", (user_id,))
        
        # Delete goals
        cursor.execute("DELETE FROM goals WHERE user_id = ?", (user_id,))
        
        # Delete messages (cascade through conversations)
        cursor.execute("""
            DELETE FROM messages 
            WHERE conversation_id IN (
                SELECT id FROM conversations WHERE user_id = ?
            )
        """, (user_id,))
        
        # Delete conversations
        cursor.execute("DELETE FROM conversations WHERE user_id = ?", (user_id,))
        
        # Delete user account
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        
        conn.commit()
        conn.close()
        
        return {"message": "Account and all data deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")

# Goals & Progress Tracking Endpoints
@app.post("/goals", response_model=GoalResponse)
async def create_goal(
    goal: GoalCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new mental health goal"""
    goal_id = GoalsDatabase.create_goal(
        user_id=user_id,
        title=goal.title,
        description=goal.description or "",
        category=goal.category,
        target_value=goal.target_value,
        unit=goal.unit,
        target_date=goal.target_date
    )
    
    return GoalResponse(
        id=goal_id,
        user_id=user_id,
        title=goal.title,
        description=goal.description,
        category=goal.category,
        target_value=goal.target_value,
        current_value=0,
        unit=goal.unit,
        start_date=datetime.now().date().isoformat(),
        target_date=goal.target_date,
        status="active",
        progress_percentage=0.0,
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat(),
        completed_at=None
    )

@app.get("/goals")
async def get_goals(
    status: Optional[str] = None,
    user_id: str = Depends(get_current_user_id)
):
    """Get user's goals, optionally filtered by status"""
    goals = GoalsDatabase.get_user_goals(user_id, status)
    return {"goals": goals, "total": len(goals)}

@app.get("/goals/statistics")
async def get_goal_statistics(user_id: str = Depends(get_current_user_id)):
    """Get goal completion statistics"""
    stats = GoalsDatabase.get_goal_statistics(user_id)
    return stats

@app.put("/goals/{goal_id}/progress")
async def update_goal_progress(
    goal_id: int,
    progress: GoalProgressUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update progress on a goal"""
    GoalsDatabase.update_goal_progress(goal_id, user_id, progress.current_value)
    return {"message": "Goal progress updated successfully"}

@app.put("/goals/{goal_id}")
async def update_goal(
    goal_id: int,
    goal: GoalUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update goal details"""
    GoalsDatabase.update_goal(
        goal_id=goal_id,
        user_id=user_id,
        title=goal.title,
        description=goal.description,
        target_value=goal.target_value,
        target_date=goal.target_date
    )
    return {"message": "Goal updated successfully"}

@app.delete("/goals/{goal_id}")
async def delete_goal(
    goal_id: int,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a goal"""
    GoalsDatabase.delete_goal(goal_id, user_id)
    return {"message": "Goal deleted successfully"}
    results = Database.search_messages(user_id, q)
    return results