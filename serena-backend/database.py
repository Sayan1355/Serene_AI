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
    
    # Mood tracking table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS mood_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            mood_level INTEGER NOT NULL,
            mood_emoji TEXT NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    
    # Journal entries table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS journal_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            title TEXT,
            content TEXT NOT NULL,
            mood_level INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    
    # Create indexes for better performance
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON mood_entries(created_at)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id)")
    
    # Goals table for progress tracking
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            target_value INTEGER,
            current_value INTEGER DEFAULT 0,
            unit TEXT,
            start_date DATE,
            target_date DATE,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status)")
    
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
            SELECT m.id, m.content, m.role, m.created_at, c.title, c.id as conversation_id
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
                "content": row[1],
                "role": row[2],
                "created_at": row[3],
                "conversation_title": row[4],
                "conversation_id": row[5]
            }
            for row in rows
        ]

# Initialize database on module import
init_db()


# Mood Tracking Methods
class MoodDatabase:
    @staticmethod
    def add_mood_entry(user_id: str, mood_level: int, mood_emoji: str, notes: Optional[str] = None):
        conn = Database.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO mood_entries (user_id, mood_level, mood_emoji, notes) VALUES (?, ?, ?, ?)",
            (user_id, mood_level, mood_emoji, notes)
        )
        mood_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return mood_id
    
    @staticmethod
    def get_user_moods(user_id: str, days: int = 30) -> List[Dict]:
        conn = Database.get_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT id, mood_level, mood_emoji, notes, created_at
            FROM mood_entries
            WHERE user_id = ? AND created_at >= datetime('now', '-' || ? || ' days')
            ORDER BY created_at DESC
        """
        
        cursor.execute(query, (user_id, days))
        rows = cursor.fetchall()
        conn.close()
        
        return [
            {
                "id": row[0],
                "mood_level": row[1],
                "mood_emoji": row[2],
                "notes": row[3],
                "created_at": row[4]
            }
            for row in rows
        ]
    
    @staticmethod
    def get_mood_analytics(user_id: str, days: int = 30) -> Dict:
        conn = Database.get_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT AVG(mood_level) as avg_mood, COUNT(*) as total_entries
            FROM mood_entries
            WHERE user_id = ? AND created_at >= datetime('now', '-' || ? || ' days')
        """
        
        cursor.execute(query, (user_id, days))
        row = cursor.fetchone()
        conn.close()
        
        return {
            "average_mood": round(row[0], 1) if row[0] else 0,
            "total_entries": row[1] if row[1] else 0,
            "period_days": days
        }


# Journal Methods
class JournalDatabase:
    @staticmethod
    def create_journal_entry(user_id: str, title: Optional[str], content: str, mood_level: Optional[int] = None):
        conn = Database.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO journal_entries (user_id, title, content, mood_level) VALUES (?, ?, ?, ?)",
            (user_id, title, content, mood_level)
        )
        entry_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return entry_id
    
    @staticmethod
    def get_user_journals(user_id: str, limit: int = 50) -> List[Dict]:
        conn = Database.get_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT id, title, content, mood_level, created_at, updated_at
            FROM journal_entries
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        """
        
        cursor.execute(query, (user_id, limit))
        rows = cursor.fetchall()
        conn.close()
        
        return [
            {
                "id": row[0],
                "title": row[1],
                "content": row[2],
                "mood_level": row[3],
                "created_at": row[4],
                "updated_at": row[5]
            }
            for row in rows
        ]
    
    @staticmethod
    def update_journal_entry(entry_id: int, user_id: str, title: Optional[str], content: str, mood_level: Optional[int]):
        conn = Database.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """UPDATE journal_entries 
               SET title = ?, content = ?, mood_level = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ? AND user_id = ?""",
            (title, content, mood_level, entry_id, user_id)
        )
        conn.commit()
        conn.close()
    
    @staticmethod
    def delete_journal_entry(entry_id: int, user_id: str):
        conn = Database.get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM journal_entries WHERE id = ? AND user_id = ?", (entry_id, user_id))
        conn.commit()
        conn.close()
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

class GoalsDatabase:
    """Database operations for mental health goals"""
    
    @staticmethod
    def create_goal(user_id: str, title: str, description: str, category: str, 
                   target_value: int, unit: str, target_date: str) -> int:
        """Create a new goal"""
        conn = Database.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO goals (user_id, title, description, category, target_value, unit, start_date, target_date, status)
            VALUES (?, ?, ?, ?, ?, ?, DATE('now'), ?, 'active')
        """, (user_id, title, description, category, target_value, unit, target_date))
        
        goal_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return goal_id
    
    @staticmethod
    def get_user_goals(user_id: str, status: str = None) -> List[Dict]:
        """Get all goals for a user, optionally filtered by status"""
        conn = Database.get_connection()
        cursor = conn.cursor()
        
        if status:
            cursor.execute("""
                SELECT id, title, description, category, target_value, current_value, unit, 
                       start_date, target_date, status, created_at, updated_at, completed_at
                FROM goals
                WHERE user_id = ? AND status = ?
                ORDER BY created_at DESC
            """, (user_id, status))
        else:
            cursor.execute("""
                SELECT id, title, description, category, target_value, current_value, unit, 
                       start_date, target_date, status, created_at, updated_at, completed_at
                FROM goals
                WHERE user_id = ?
                ORDER BY created_at DESC
            """, (user_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [
            {
                "id": row[0],
                "title": row[1],
                "description": row[2],
                "category": row[3],
                "target_value": row[4],
                "current_value": row[5],
                "unit": row[6],
                "start_date": row[7],
                "target_date": row[8],
                "status": row[9],
                "created_at": row[10],
                "updated_at": row[11],
                "completed_at": row[12],
                "progress_percentage": round((row[5] / row[4] * 100) if row[4] > 0 else 0, 1)
            }
            for row in rows
        ]
    
    @staticmethod
    def update_goal_progress(goal_id: int, user_id: str, current_value: int):
        """Update the progress of a goal"""
        conn = Database.get_connection()
        cursor = conn.cursor()
        
        # Get target value to check if goal is completed
        cursor.execute("SELECT target_value FROM goals WHERE id = ? AND user_id = ?", (goal_id, user_id))
        result = cursor.fetchone()
        
        if not result:
            conn.close()
            return
        
        target_value = result[0]
        status = 'completed' if current_value >= target_value else 'active'
        completed_at = datetime.now().isoformat() if status == 'completed' else None
        
        cursor.execute("""
            UPDATE goals 
            SET current_value = ?, status = ?, updated_at = CURRENT_TIMESTAMP, completed_at = ?
            WHERE id = ? AND user_id = ?
        """, (current_value, status, completed_at, goal_id, user_id))
        
        conn.commit()
        conn.close()
    
    @staticmethod
    def update_goal(goal_id: int, user_id: str, title: str = None, description: str = None,
                   target_value: int = None, target_date: str = None):
        """Update goal details"""
        conn = Database.get_connection()
        cursor = conn.cursor()
        
        updates = []
        params = []
        
        if title:
            updates.append("title = ?")
            params.append(title)
        if description is not None:
            updates.append("description = ?")
            params.append(description)
        if target_value:
            updates.append("target_value = ?")
            params.append(target_value)
        if target_date:
            updates.append("target_date = ?")
            params.append(target_date)
        
        if updates:
            updates.append("updated_at = CURRENT_TIMESTAMP")
            params.extend([goal_id, user_id])
            
            query = f"UPDATE goals SET {', '.join(updates)} WHERE id = ? AND user_id = ?"
            cursor.execute(query, params)
            conn.commit()
        
        conn.close()
    
    @staticmethod
    def delete_goal(goal_id: int, user_id: str):
        """Delete a goal"""
        conn = Database.get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM goals WHERE id = ? AND user_id = ?", (goal_id, user_id))
        conn.commit()
        conn.close()
    
    @staticmethod
    def get_goal_statistics(user_id: str) -> Dict:
        """Get goal completion statistics"""
        conn = Database.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                COUNT(*) as total_goals,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_goals,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_goals,
                AVG(CASE WHEN status = 'active' THEN (current_value * 1.0 / target_value * 100) ELSE NULL END) as avg_progress
            FROM goals
            WHERE user_id = ?
        """, (user_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        return {
            "total_goals": row[0] or 0,
            "completed_goals": row[1] or 0,
            "active_goals": row[2] or 0,
            "avg_progress": round(row[3], 1) if row[3] else 0
        }

# Initialize database on import
init_db()
