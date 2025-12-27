# Chat History & Database Integration

## 🗄️ Database System

Serene now includes a complete SQLite database system for secure chat history management.

### Database Schema

**Users Table:**
- User profiles with authentication
- Email and phone support
- Password hashing with bcrypt
- Last active tracking

**Conversations Table:**
- Multiple conversations per user
- Auto-generated titles
- Archive functionality
- Timestamp tracking

**Messages Table:**
- All chat messages stored securely
- Role-based (user/assistant)
- Intent classification
- Full conversation history

### Features Implemented

✅ **Chat History Sidebar**
- View all past conversations
- Search through conversations
- Quick access to recent chats
- Message count display

✅ **Conversation Management**
- Create new conversations
- Rename conversations
- Archive conversations
- Delete conversations permanently
- Auto-generated titles from first message

✅ **Message Persistence**
- All messages saved automatically
- Load previous conversations
- Context-aware AI responses (uses last 5 messages)
- Secure user-specific storage

✅ **Search Functionality**
- Search through all messages
- Find past conversations quickly
- Filter by keywords

### API Endpoints

#### Conversation Endpoints:
```
GET    /conversations                   # List all conversations
POST   /conversations                   # Create new conversation
GET    /conversations/{id}              # Get conversation messages
PATCH  /conversations/{id}              # Update conversation title
POST   /conversations/{id}/archive      # Archive/unarchive conversation
DELETE /conversations/{id}              # Delete conversation
GET    /search?q={query}                # Search messages
```

#### Chat Endpoint (Updated):
```
POST   /predict
Body: {
  "text": "user message",
  "conversation_id": 123  # Optional, creates new if null
}
```

### Security

- **User Isolation**: Each user can only access their own data
- **JWT Authentication**: All endpoints require valid tokens
- **Password Hashing**: Bcrypt with automatic salting
- **SQL Injection Protection**: Parameterized queries
- **Foreign Key Constraints**: Data integrity maintained

### UI Features

**Desktop:**
- Persistent sidebar with chat history
- Easy conversation switching
- Context menu for actions (rename, archive, delete)
- Real-time updates

**Mobile:**
- Slide-out menu for chat history
- Touch-friendly interface
- Same functionality as desktop

### Database Location

```
serena-backend/serene.db
```

The database is automatically created on first run and persists all data locally.

### Backup & Migration

To backup your data:
```bash
cp serena-backend/serene.db serena-backend/serene_backup.db
```

To export data:
```bash
sqlite3 serena-backend/serene.db .dump > backup.sql
```

### Future Enhancements

- Cloud database integration (PostgreSQL/MongoDB)
- Conversation sharing
- Export conversations to PDF/TXT
- Advanced search with filters
- Message reactions and favorites
- Conversation tags and categories
- Analytics dashboard

## 🚀 Quick Start

1. Backend automatically creates the database
2. Sign up or log in
3. Start chatting - history is automatically saved
4. Click on past conversations to reload them
5. Use search to find specific messages

All data is stored securely and privately per user!
