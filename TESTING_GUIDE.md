# Testing Guide - New Features

## 🧪 How to Test All 4 New Features

### 1. Goal Tracking System

**Test Create Goal:**
```
1. Login to SERENE
2. Click "Goals" in navigation
3. Click "Add New Goal" button
4. Fill form:
   - Title: "Meditate Daily"
   - Description: "Practice mindfulness"
   - Category: "Meditation"
   - Target: 30
   - Unit: "days"
   - Start Date: Today
   - Target Date: 30 days from now
5. Click "Save Goal"
6. Verify toast: "Goal created successfully!"
```

**Test Progress Update:**
```
1. Find created goal in list
2. Enter value in progress input (e.g., "5")
3. Click "Update" button
4. Watch progress bar increase
5. Verify percentage updates
6. Try entering target value - status changes to "Completed"
```

**Test Statistics:**
```
1. Create multiple goals (some completed, some active)
2. View statistics cards at top:
   - Total Goals count
   - Completed count
   - Active count
   - Average Progress percentage
```

**Test Filter:**
```
1. Click "Active" button - see only active goals
2. Click "Completed" - see only completed
3. Click "All" - see everything
```

**Test Delete:**
```
1. Click delete icon on any goal
2. Confirm deletion in dialog
3. Verify goal removed
4. Toast: "Goal deleted successfully!"
```

---

### 2. Enhanced Crisis Detection

**Test Crisis Keywords:**
Send these messages in chat to trigger modal:
```
"I feel suicidal"
"I want to kill myself"
"I'm thinking about self-harm"
"Everything is hopeless"
"I can't go on anymore"
```

**Expected Behavior:**
```
1. Modal appears immediately (red theme)
2. Title: "We're Here For You"
3. Emergency resources displayed:
   - 988 Suicide & Crisis Lifeline (clickable)
   - Crisis Text Line
   - Emergency room info
4. Buttons work:
   - "Call 988" opens phone dialer
   - "Text 741741" opens SMS
   - "Emergency Resources" navigates to page
   - "Try Breathing Exercise" navigates to breathing
5. Close modal - can continue chat
```

**Test Non-Crisis Messages:**
```
Send: "I'm feeling a bit sad today"
Expected: No modal (normal chat continues)
```

---

### 3. Multilingual Support (i18n)

**Test Language Switching:**
```
1. Login to app
2. Look for Globe icon in navigation bar
3. Click language dropdown
4. Select "Español" (Spanish)
5. Verify UI changes:
   - Navigation: "Chat", "Objetivos", "Diario"
   - Buttons translate
   - All text in Spanish
6. Try Hindi (हिन्दी):
   - Script changes to Devanagari
   - Navigation in Hindi
7. Try French (Français)
8. Back to English
```

**Test Language Persistence:**
```
1. Switch to Spanish
2. Refresh page
3. Verify language stays Spanish
4. Check localStorage: key "i18nextLng"
```

**Test Translated Components:**
- Landing page hero text
- Chat greeting message
- Goal creation form
- Navigation labels
- Button text
- Error messages
- Toast notifications

---

### 4. Offline Mode & PWA

**Test Offline Detection:**
```
1. Open app (while online)
2. Open browser DevTools
3. Network tab > Throttling > Offline
4. Yellow banner appears: "You are offline"
5. Toast notification shown
```

**Test Offline Messaging:**
```
1. Go offline (as above)
2. Navigate to Chat
3. Send message: "Testing offline mode"
4. Message appears in chat
5. Check browser DevTools > Application > IndexedDB
6. Database: "serene-offline-db"
7. Store: "pending-messages"
8. See your message stored
```

**Test Online Sync:**
```
1. While offline, send 2-3 messages
2. Go back online (Network tab > No throttling)
3. Toast: "Back online - Syncing messages..."
4. Messages automatically sent to backend
5. Responses received
6. Check IndexedDB - messages marked as synced
```

**Test PWA Installation:**
```
Desktop (Chrome/Edge):
1. Visit app
2. Look for install prompt (bottom-right card)
3. Click "Install" button
4. App installs as standalone window
5. Check app drawer/start menu - SERENE icon present
6. Launch - opens without browser chrome

Mobile (Android Chrome):
1. Visit app
2. Banner appears: "Add SERENE to Home screen"
3. Tap "Install"
4. Icon added to home screen
5. Launch - fullscreen app experience

iOS (Safari):
1. Visit app
2. Tap Share button
3. "Add to Home Screen"
4. Name: SERENE
5. Add - icon on home screen
```

**Test Offline Functionality:**
```
1. Install PWA
2. Use app online first (loads data)
3. Close app
4. Turn off internet/WiFi
5. Open PWA from home screen
6. App loads (from cache)
7. Can browse:
   - View chat history
   - Read journal entries
   - View goals
   - Use breathing exercises
8. Cannot:
   - Send new messages (queued for sync)
   - Fetch new data from API
```

**Test Service Worker Caching:**
```
1. Open DevTools > Application > Service Workers
2. Verify service worker registered
3. Check Cache Storage:
   - workbox-precache (static assets)
   - google-fonts-cache
   - gstatic-fonts-cache
   - api-cache (API responses)
4. Go offline
5. Navigate app - assets load from cache
```

---

## 🔍 Backend Testing (API)

### Goals API

**Create Goal:**
```bash
curl -X POST http://localhost:8000/goals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Exercise Daily",
    "description": "30 min workout",
    "category": "exercise",
    "target_value": 30,
    "unit": "days",
    "target_date": "2025-01-29"
  }'
```

**Get Goals:**
```bash
curl http://localhost:8000/goals \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Statistics:**
```bash
curl http://localhost:8000/goals/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update Progress:**
```bash
curl -X PUT http://localhost:8000/goals/1/progress \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"current_value": 15}'
```

**Delete Goal:**
```bash
curl -X DELETE http://localhost:8000/goals/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Common Issues & Fixes

### Issue: Language not changing
**Fix:**
- Clear browser cache
- Check localStorage for `i18nextLng` key
- Verify translation files loaded in Network tab

### Issue: PWA install prompt not showing
**Fix:**
- Use HTTPS (or localhost)
- Service worker must be registered
- Check DevTools > Application > Manifest
- Try different browser (Chrome works best)

### Issue: Offline sync not working
**Fix:**
- Check IndexedDB in DevTools
- Verify service worker active
- Check Network tab for failed requests
- Ensure `offlineStorage.init()` called

### Issue: Crisis modal not appearing
**Fix:**
- Check console for errors
- Verify keyword matching (case-insensitive)
- Ensure `detectCrisisInMessage` imported
- Check modal state in React DevTools

### Issue: Goals not saving
**Fix:**
- Check backend running (http://localhost:8000)
- Verify auth token in localStorage
- Check Network tab for 401/500 errors
- Verify database.py has goals table

---

## ✅ Test Checklist

### Goal Tracking
- [ ] Create goal with all fields
- [ ] View goals list
- [ ] Update progress (partial)
- [ ] Complete goal (progress = target)
- [ ] Edit goal details
- [ ] Delete goal
- [ ] Filter by status
- [ ] View statistics
- [ ] Try all 8 categories

### Crisis Detection
- [ ] Test all 13 keywords
- [ ] Modal appears correctly
- [ ] Call button works
- [ ] Text button works
- [ ] Navigation buttons work
- [ ] Close modal works
- [ ] Non-crisis messages ignored
- [ ] Modal styling (red theme)

### Multilingual
- [ ] Switch to Spanish - verify UI
- [ ] Switch to Hindi - verify script
- [ ] Switch to French - verify text
- [ ] Language persists on refresh
- [ ] All components translated
- [ ] Chat greeting in selected language
- [ ] Error messages translated
- [ ] Date/time formats localized

### PWA & Offline
- [ ] Install PWA on desktop
- [ ] Install PWA on mobile
- [ ] App icon correct
- [ ] Standalone mode works
- [ ] Offline banner shows
- [ ] Messages queue when offline
- [ ] Auto-sync on reconnect
- [ ] Service worker caching
- [ ] App works offline after first load
- [ ] Update prompt appears on new version

---

## 📊 Expected Results

After testing, you should have:
1. ✅ Goals created, updated, and tracked
2. ✅ Crisis modal triggered on keywords
3. ✅ All 4 languages working
4. ✅ PWA installed on device
5. ✅ Offline mode functional
6. ✅ All features integrated smoothly

---

*Happy Testing! 🧪*
