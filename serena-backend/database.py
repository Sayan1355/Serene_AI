import sqlite3
from datetime import datetime
from typing import List, Optional, Dict
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "serene.db")

def init_db():
    """Initialize the database with required tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users table (enhanced)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT UNIQUE,
            hashed_password TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Conversations table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            title TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_archived BOOLEAN DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    
    # Messages table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            intent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        )
    """)
    
    # Create indexes for better performance
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at)")
    
    conn.commit()
    conn.close()

class Database:
    @staticmethod
    def get_connection():
        return sqlite3.connect(DB_PATH)
    
    # User operations
    @staticmethod
    def create_user(user_id: str, name: str, email: Optional[str], phone: Optional[str], hashed_password: Optional[str]):
        conn = Database.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (id, name, email, phone, hashed_password) VALUES (?, ?, ?, ?, ?)",
            (user_id, name, email, phone, hashed_password)
        )
        conn.commit()
        conn.close()
    
    @staticmethod
    def get_user(user_id: str) -> Optional[Dict]:
        conn = Database.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, phone, hashed_password, created_at FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "phone": row[3],
                "hashed_password": row[4],
                "created_at": row[5]
            }
        return None
    
    @staticmethod
    def update_last_active(user_id: str):
        conn = Database.get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET last_active = ? WHERE id = ?", (datetime.utcnow(), user_id))
        conn.commit()
        conn.close()
    
    # Conversation operations
    @staticmethod
    def create_conversation(user_id: str, title: str = "New Conversation") -> int:
        conn = Database.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO conversations (user_id, title) VALUES (?, ?)",
            (user_id, title)
        )
        conversation_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return conversation_id
    
    @staticmethod
    def get_user_conversations(user_id: str, include_archived: bool = False) -> List[Dict]:
        conn = Database.get_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT c.id, c.title, c.created_at, c.updated_at, c.is_archived,
                   COUNT(m.id) as message_count,
                   (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
            FROM conversations c
            LEFT JOIN messages m ON c.id = m.conversation_id
            WHERE c.user_id = ?
        """
        
        if not include_archived:
            query += " AND c.is_archived = 0"
        
        query += " GROUP BY c.id ORDER BY c.updated_at DESC"
        
        cursor.execute(query, (user_id,))
        rows = cursor.fetchall()
        conn.close()
        
        return [
            {
                "id": row[0],
                "title": row[1],
                "created_at": row[2],
                "updated_at": row[3],
                "is_archived": bool(row[4]),
                "message_count": row[5],
                "last_message": row[6]
            }
            for row in rows
        ]
    
    @staticmethod
    def get_conversation(conversation_id: int, user_id: str) -> Optional[Dict]:
        conn = Database.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, user_id, title, created_at, updated_at, is_archived FROM conversations WHERE id = ? AND user_id = ?",
            (conversation_id, user_id)
        )
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "id": row[0],
                "user_id": row[1],
                "title": row[2],
                "created_at": row[3],
                "updated_at": row[4],
                "is_archived": bool(row[5])
            }
        return None
    
    @staticmethod
    def update_conversation_title(conversation_id: int, user_id: str, title: str):
        conn = Database.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE conversations SET title = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            (title, datetime.utcnow(), conversation_id, user_id)
        )
        conn.commit()
        conn.close()
    
    @staticmethod
    def archive_conversation(conversation_id: int, user_id: str, archive: bool = True):
        conn = Database.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE conversations SET is_archived = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            (1 if archive else 0, datetime.utcnow(), conversation_id, user_id)
        )
        conn.commit()
        conn.close()
    
    @staticmethod
    def delete_conversation(conversation_id: int, user_id: str):
        conn = Database.get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM conversations WHERE id = ? AND user_id = ?", (conversation_id, user_id))
        conn.commit()
        conn.close()
    
    # Message operations
    @staticmethod
    def add_message(conversation_id: int, role: str, content: str, intent: Optional[str] = None):
        conn = Database.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO messages (conversation_id, role, content, intent) VALUES (?, ?, ?, ?)",
            (conversation_id, role, content, intent)
        )
        message_id = cursor.lastrowid
        
        # Update conversation's updated_at timestamp
        cursor.execute(
            "UPDATE conversations SET updated_at = ? WHERE id = ?",
            (datetime.utcnow(), conversation_id)
        )
        
        conn.commit()
        conn.close()
        return message_id
    
    @staticmethod
    def get_conversation_messages(conversation_id: int, user_id: str, limit: Optional[int] = None) -> List[Dict]:
        conn = Database.get_connection()
        cursor = conn.cursor()
        
        # Verify user owns this conversation
        cursor.execute("SELECT user_id FROM conversations WHERE id = ?", (conversation_id,))
        row = cursor.fetchone()
        if not row or row[0] != user_id:
            conn.close()
            return []
        
        query = """
            SELECT id, role, content, intent, created_at 
            FROM messages 
            WHERE conversation_id = ? 
            ORDER BY created_at ASC
        """
        
        if limit:
            query += f" LIMIT {limit}"
        
        cursor.execute(query, (conversation_id,))
        rows = cursor.fetchall()
        conn.close()
        
        return [
            {
                "id": row[0],
                "role": row[1],
                "content": row[2],
                "intent": row[3],
                "created_at": row[4]
            }
            for row in rows
        ]
    
    @staticmethod
    def delete_message(message_id: int, conversation_id: int, user_id: str):
        conn = Database.get_connection()
        cursor = conn.cursor()
        
        # Verify user owns this conversation
        cursor.execute("SELECT user_id FROM conversations WHERE id = ?", (conversation_id,))
        row = cursor.fetchone()
        if row and row[0] == user_id:
            cursor.execute("DELETE FROM messages WHERE id = ? AND conversation_id = ?", (message_id, conversation_id))
            conn.commit()
        
        conn.close()
    
    @staticmethod
    def search_messages(user_id: str, search_query: str) -> List[Dict]:
        conn = Database.get_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT m.id, m.conversation_id, m.role, m.content, m.created_at, c.title
            FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            WHERE c.user_id = ? AND m.content LIKE ?
            ORDER BY m.created_at DESC
            LIMIT 50
        """
        
        cursor.execute(query, (user_id, f"%{search_query}%"))
        rows = cursor.fetchall()
        conn.close()
        
        return [
            {
                "id": row[0],
                "conversation_id": row[1],
                "role": row[2],
                "content": row[3],
                "created_at": row[4],
                "conversation_title": row[5]
            }
            for row in rows
        ]

# Initialize database on import
init_db()
