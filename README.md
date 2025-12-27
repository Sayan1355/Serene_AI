# SERENE - Mental Wellness AI Companion

![SERENE Logo](https://img.shields.io/badge/SERENE-Mental%20Wellness-blue)
![Python](https://img.shields.io/badge/Python-3.9+-green)
![React](https://img.shields.io/badge/React-18.3-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-teal)

**24/7 AI-powered mental health companion providing empathetic support and guidance.**

🔗 **Live Demo**: Coming soon!
📖 **Documentation**: [Features](./FEATURES.md) | [Chat History](./CHAT_HISTORY.md)

---

## 🌟 Features

- ✅ **AI-Powered Conversations** - Google Gemini 2.0 Flash for intelligent responses
- ✅ **Intent Classification** - TensorFlow model understands mental health needs
- ✅ **User Authentication** - Secure JWT-based auth
- ✅ **Conversation History** - All chats saved & searchable
- ✅ **Crisis Support** - Built-in safety protocols
- ✅ **Dark/Light Theme** - Eye-friendly interface
- ✅ **Responsive Design** - Mobile & desktop ready

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- npm or pnpm

### Backend Setup

```bash
cd serena-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your GEMINI_API_KEY

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend: `http://localhost:8000`

### Frontend Setup

```bash
cd serene-ui-companion-frontend
npm install
npm run dev
```

Frontend: `http://localhost:8082`

---

## 🛠️ Tech Stack

### Frontend
- React 18.3 + TypeScript
- Vite, Tailwind CSS
- Shadcn/ui Components
- React Router, TanStack Query

### Backend
- FastAPI + Uvicorn
- TensorFlow/Keras ML Models
- Google Gemini AI
- SQLite Database
- JWT Authentication

---

## 🌐 Easy Deployment

### Render (Backend) + Vercel (Frontend) - **100% FREE**

**Backend:**
1. Go to [render.com](https://render.com)
2. New Web Service → Connect `https://github.com/Sayan1355/Serene_AI`
3. Root: `serena-backend`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add env vars: `GEMINI_API_KEY`, `SECRET_KEY`

**Frontend:**
1. Go to [vercel.com](https://vercel.com)
2. Import `https://github.com/Sayan1355/Serene_AI`
3. Root: `serene-ui-companion-frontend`
4. Add env: `VITE_API_URL=https://your-backend.onrender.com`

---

## 📊 API Endpoints

### Authentication
```
POST /auth/signup - Register
POST /auth/login  - Login
GET  /auth/me     - Current user
```

### Chat
```
POST /predict - Send message
```

### Conversations
```
GET    /conversations          - List all
POST   /conversations          - Create new
GET    /conversations/{id}     - Get messages
PATCH  /conversations/{id}     - Update
DELETE /conversations/{id}     - Delete
GET    /search?q={query}       - Search
```

---

## 🎯 Why SERENE Over ChatGPT?

| Feature | SERENE | ChatGPT |
|---------|--------|---------|
| **Mental Health Focus** | ✅ Specialized | ❌ General purpose |
| **Privacy** | ✅ Local storage | ❌ Cloud training data |
| **Crisis Protocols** | ✅ Built-in | ❌ Generic |
| **Conversation Memory** | ✅ Full history | ❌ Limited context |
| **Ethical Boundaries** | ✅ Clear limits | ⚠️ Blurred |

---

## ⚠️ Important Disclaimer

**SERENE is NOT a replacement for professional care.**
- Not a licensed therapist
- Does not diagnose conditions
- Does not provide medical advice

**Crisis Resources:**
- Emergency: 911
- Suicide Prevention: 988
- Crisis Text Line: Text HOME to 741741

---

## 📝 License

MIT License

---

## 🤝 Contributing

Pull requests welcome! Check [FEATURES.md](./FEATURES.md) for roadmap.

---

**Made with 💙 for mental wellness**
