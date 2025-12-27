# 🚀 DEPLOYMENT GUIDE - SERENE AI

## Quick Deploy (5 Minutes) - 100% FREE

### Step 1: Deploy Backend on Render

1. **Go to**: https://render.com
2. **Sign up** (free account)
3. Click **"New +"** → **"Web Service"**
4. **Connect GitHub**: Authorize Render to access `Sayan1355/Serene_AI`
5. **Configure**:
   ```
   Name: serene-backend
   Region: Oregon (US West) or closest to you
   Branch: main
   Root Directory: serena-backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
6. **Environment Variables** (click "Add Environment Variable"):
   ```
   GEMINI_API_KEY = your_actual_gemini_api_key
   SECRET_KEY = any_random_32_character_string_here
   ```
7. Click **"Create Web Service"**
8. **Wait 5-10 minutes** for deployment
9. **Copy your URL**: `https://serene-backend-xxxx.onrender.com`

⚠️ **Note**: Free tier sleeps after 15 mins of inactivity (30 sec wake-up time)

---

### Step 2: Deploy Frontend on Vercel

1. **Go to**: https://vercel.com
2. **Sign up** with GitHub (free)
3. Click **"Add New..."** → **"Project"**
4. **Import**: `Sayan1355/Serene_AI`
5. **Configure**:
   ```
   Framework Preset: Vite
   Root Directory: serene-ui-companion-frontend
   Build Command: npm run build
   Output Directory: dist
   ```
6. **Environment Variable** (click "Add"):
   ```
   Key: VITE_API_URL
   Value: https://serene-backend-xxxx.onrender.com
   ```
   *(Use the URL from Step 1)*
7. Click **"Deploy"**
8. **Wait 2-3 minutes**
9. **Your app is live!** `https://serene-ai-xxxx.vercel.app`

---

## ✅ Deployment Complete!

Your app is now live at:
- **Frontend**: `https://serene-ai-xxxx.vercel.app`
- **Backend**: `https://serene-backend-xxxx.onrender.com`

---

## 🔧 Post-Deployment Setup

### Update CORS in Backend

After deployment, you need to allow your frontend URL:

1. Go to your GitHub repo
2. Edit `serena-backend/main.py`
3. Find the CORS section (around line 95):
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "http://localhost:8082",
           "https://serene-ai-xxxx.vercel.app",  # ADD YOUR VERCEL URL
       ],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
4. Commit and push
5. Render will auto-redeploy

---

## 🎯 Alternative Options

### Option 2: Railway (Easier but $5/month after free trial)

**One-click deploy:**
1. Go to https://railway.app
2. Connect GitHub repo
3. Deploy `serena-backend` and `serene-ui-companion-frontend`
4. Add environment variables
5. Done!

---

### Option 3: Netlify (Frontend) + Render (Backend)

Same as Vercel but use Netlify instead.

---

## 🐛 Troubleshooting

### Backend not responding
- Check Render logs
- Verify environment variables are set
- Ensure build succeeded

### Frontend shows "Network Error"
- Check VITE_API_URL is correct
- Verify CORS is configured
- Check browser console for errors

### Database issues
- Render free tier includes persistent disk
- Data persists between deploys

---

## 💡 Tips

1. **Custom Domain**: Both Render and Vercel support custom domains (free)
2. **Monitor**: Check Render dashboard for backend logs
3. **Auto-deploy**: Both platforms auto-deploy on git push
4. **Upgrade**: If you get traffic, upgrade to paid tier for better performance

---

## 📊 Cost Breakdown

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Render | ✅ 750 hours/month | $7/month |
| Vercel | ✅ Unlimited | $20/month (Pro) |
| Railway | ✅ $5 free credit | $5/month |

**Recommendation**: Start free, upgrade when needed!

---

## 🔐 Security Checklist

- [ ] SECRET_KEY is random and secure (not default)
- [ ] GEMINI_API_KEY is valid
- [ ] CORS origins include deployed frontend URL
- [ ] Environment variables are set (not hardcoded)
- [ ] .env files are in .gitignore

---

**Need help?** Open an issue on GitHub!

**Made with 💙 for easy deployment**
