# Mentra Bounty: AI-Orchestrated Group Therapy Matching & Coordination

A complete end-to-end demo web platform that uses AI for conversational intake, structured insights extraction, group therapy recommendations, and therapist handoff generation.

## 🎯 Platform Overview

Mentra is a mental wellness platform that:
- Uses AI for conversational intake & organization
- Extracts structured insights (themes, goals, challenges)
- Recommends suitable group therapy sessions
- Allows individual seat booking with capacity management
- Coordinates scheduling overlap
- Generates therapist handoff briefings
- Keeps all clinical decisions human-led

**This is a prototype/demo, not a production medical system.**

---

## 🔑 Core Principles

### User Freedom (Mandatory)
Users always have control:
- Talk to AI chatbot
- Skip AI and manually browse & book groups
- Do both in any order
- AI recommendations are optional and advisory only
- Manual booking is never hidden or blocked

### AI Safety Boundaries
AI MUST:
- Start every conversation with 1-2 empathetic lines
- Ask 2-5 short questions total
- Ask only ONE question per message
- Collect: main concern, context/duration, goals, challenges, preferences
- Show visible intake progress
- Output structured insights in JSON
- Recommend ONE group with explainable reasoning
- Assist with scheduling logic
- Generate therapist handoff summary

AI MUST NOT:
- Diagnose mental health conditions
- Provide medical advice
- Replace therapists
- Force users into any flow

---

## 🎨 Design System

### Color Palette (Strict)
- White: `#FFFFFF`
- Soft green background: `#F4FBF6`
- Primary green: `#176B3A`
- Accent green: `#2E7D32`
- Light green: `#E7F6EC`
- Text: `#102015`
- Border: `rgba(23, 107, 58, 0.15)`

### Design Style
- Premium health-tech look (Calm / Headspace vibe)
- Layered cards, rounded corners
- Soft shadows & subtle gradients
- Large readable text, generous spacing
- Micro-interactions (hover, focus, transitions)
- No flat or empty white screens

---

## 📁 Project Structure

```
chatbott/
├── server/
│   ├── server.js              # Express server entry point
│   ├── package.json           # Backend dependencies
│   ├── .env.example           # Environment variables template
│   ├── routes/
│   │   ├── chat.js           # Chat API endpoint
│   │   ├── insights.js       # Insights extraction endpoint
│   │   ├── groups.js         # Groups & sessions endpoints
│   │   ├── booking.js        # Booking management endpoint
│   │   └── handoff.js        # Therapist handoff endpoint
│   ├── services/
│   │   └── aiService.js      # Gemini 2.5 AI integration
│   └── data/
│       ├── groups.json       # Available therapy groups
│       └── bookings.json     # Booking records
└── client/
    ├── index.html            # All 9 screens in single file
    ├── styles.css            # Premium green design system
    └── app.js                # Frontend logic & interactions
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd chatbott
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your Gemini API key
   # GEMINI_API_KEY=your_actual_api_key_here
   # PORT=3000
   ```

4. **Start the server**
   ```bash
   npm start
   # or
   npm run dev
   ```

5. **Access the application**
   ```
   Open your browser to: http://localhost:3000
   ```

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styling with CSS variables
- **Vanilla JavaScript** - No frameworks, lightweight
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### AI Integration
- **Gemini 2.5** - Google's generative AI model
- **@google/generative-ai** - Official Gemini SDK

### Data Storage
- **JSON files** - Local file-based storage (demo purposes)
- **In-memory** - Runtime session management

---

## 📱 Required Screens (All Implemented)

### 1. Landing Page
- Clear value proposition
- Two equal CTAs: "Talk to AI" and "Browse Groups"
- Trust indicators: Human-led care, Private & secure, AI does not diagnose

### 2. Consent & Safety
- Mandatory consent checkbox
- Clear safety disclaimer
- Required before AI interaction (NOT required for browsing groups)

### 3. AI Intake Chatbot (Optional Path)
- Clean chat UI in card layout
- Bot messages: light green bubbles
- User messages: solid green bubbles
- Visible intake progress checklist (5 steps)
- Always shows: Book recommended group, Browse all groups

### 4. AI-Generated User Profile
- Themes (pill tags)
- Goals
- Challenges
- Safety note (non-clinical)
- Recommended group + explanation

### 5. Groups Catalog (Always Accessible)
- 3 therapy groups:
  - Anxiety & Overthinking
  - Workplace Stress & Burnout
  - Grief & Life Transitions
- Each group shows: Description, Who it's for, Available session slots, Seats remaining, Book button

### 6. Scheduling & Individual Booking
- Users book one seat per session
- Each slot has capacity (6 seats)
- Prevents overbooking
- Computes availability overlap automatically
- Assigns therapist placeholder

### 7. Mock Payment
- Simple confirmation step
- No real payments processed
- Demo purposes only

### 8. Booking Confirmation
- Group name
- Session time
- Therapist placeholder
- Booking ID
- CTA: Generate Therapist Handoff

### 9. Therapist Handoff (Critical)
- Generates structured report (NO raw chat logs):
  - Group theme
  - Shared goals
  - Individual participant summaries
  - Suggested focus areas
  - Therapist engagement notes
- Includes: Current user + 2-3 synthetic participants
- Export: JSON (required), PDF (optional as .txt)

---

## 🔌 API Endpoints

### POST `/api/chat`
Send a message to the AI chatbot.

**Request:**
```json
{
  "message": "I've been feeling anxious lately",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response:**
```json
{
  "response": "I hear you. Anxiety can be really challenging..."
}
```

### POST `/api/insights`
Extract structured insights from conversation history.

**Request:**
```json
{
  "conversationHistory": [...]
}
```

**Response:**
```json
{
  "themes": ["anxiety", "work-stress"],
  "mainConcern": "Managing work-related anxiety",
  "goals": ["Develop coping strategies", "Connect with others"],
  "challenges": ["Racing thoughts", "Difficulty setting boundaries"],
  "preferences": {
    "format": "group",
    "timing": "evenings"
  },
  "recommendedGroup": {
    "id": "anxiety-overthinking",
    "name": "Anxiety & Overthinking",
    "reasoning": "This group focuses on..."
  }
}
```

### GET `/api/groups`
Get all available therapy groups.

**Response:**
```json
[
  {
    "id": "anxiety-overthinking",
    "name": "Anxiety & Overthinking",
    "description": "...",
    "whoItsFor": "...",
    "capacity": 6,
    "sessions": [...]
  }
]
```

### GET `/api/groups/:id`
Get details for a specific group.

### POST `/api/groups/slots/generate`
Generate available slots for a group.

**Request:**
```json
{
  "groupId": "anxiety-overthinking"
}
```

### POST `/api/booking`
Create a new booking.

**Request:**
```json
{
  "groupId": "anxiety-overthinking",
  "sessionId": "s1",
  "userName": "John Doe",
  "userEmail": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": "BK1234567890",
    "groupId": "anxiety-overthinking",
    "sessionId": "s1",
    "groupName": "Anxiety & Overthinking",
    "sessionDate": "2026-02-10",
    "sessionTime": "18:00",
    "therapist": "Dr. Sarah Chen",
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "createdAt": "2026-02-01T..."
  },
  "remainingSeats": 5
}
```

### GET `/api/booking/:id`
Get booking details by ID.

### GET `/api/handoff/:groupId`
Generate therapist handoff report.

**Response:**
```json
{
  "groupId": "anxiety-overthinking",
  "handoff": {
    "groupTheme": "Anxiety management...",
    "sharedGoals": ["Develop coping..."],
    "participantSummaries": [...],
    "suggestedFocusAreas": [...],
    "therapistNotes": "Focus on creating..."
  },
  "participants": [...],
  "generatedAt": "2026-02-01T..."
}
```

---

## 📋 Full User Flow

### Path 1: AI-Guided Journey
1. **Landing Page** → Click "Talk to AI"
2. **Consent & Safety** → Agree to terms
3. **AI Intake Chatbot** → Answer 2-5 questions
   - Progress tracker shows completion
   - AI asks one question at a time
   - Empathetic, supportive conversation
4. **AI-Generated Profile** → Review insights
   - See themes, goals, challenges
   - View recommended group with reasoning
5. **Book Recommended Group** → Select session
6. **Scheduling** → Choose available time slot
7. **Booking Form** → Enter name & email
8. **Mock Payment** → Confirm booking (demo)
9. **Booking Confirmation** → Receive booking ID
10. **Therapist Handoff** → Generate & download report

### Path 2: Manual Browse & Book
1. **Landing Page** → Click "Browse Groups"
2. **Groups Catalog** → Browse 3 therapy groups
3. **View Sessions** → See available slots
4. **Book Seat** → Select time slot
5. **Booking Form** → Enter name & email
6. **Mock Payment** → Confirm booking (demo)
7. **Booking Confirmation** → Receive booking ID
8. **Therapist Handoff** → Generate & download report

### Path 3: Hybrid Approach
- Start with AI chat
- Browse groups anytime
- Switch between AI and manual booking
- Full control at every step

---

## 🧠 AI Safety Boundaries

### What AI Does
- Provides empathetic conversation
- Extracts structured information
- Makes group recommendations
- Generates therapist handoff summaries
- Assists with scheduling logic

### What AI Does NOT Do
- Diagnose mental health conditions
- Provide medical advice
- Replace therapists
- Make clinical decisions
- Force users into any flow
- Store or share chat logs in handoffs

### Important Notes
- All AI recommendations are advisory only
- Therapists make all clinical decisions
- Handoffs contain structured summaries, NOT raw chat logs
- Users can skip AI entirely and book manually
- Platform is for demo/educational purposes

---

## 🎯 Judge Demo Walkthrough

### Complete User Journey Demo

**Step 1: Landing Page**
- Observe premium green design
- Note two equal CTAs (Talk to AI, Browse Groups)
- Verify trust indicators present

**Step 2: AI Path**
- Click "Talk to AI"
- Accept consent (verify checkbox required)
- Chat with AI (observe empathetic style)
- Answer questions (one at a time)
- Watch progress bar advance
- See profile generation
- Review recommended group
- Book session
- Complete mock payment
- View confirmation
- Generate handoff

**Step 3: Manual Path**
- Click "Browse Groups"
- View all 3 groups
- Click "View Sessions"
- See available slots with seat counts
- Select session
- Complete booking flow
- Compare with AI path

**Step 4: Handoff Generation**
- Verify structured report (no chat logs)
- Check JSON download works
- Check PDF download works
- Verify synthetic participants included

**Step 5: Edge Cases**
- Try booking full session (should be disabled)
- Try without consent (button disabled)
- Try empty form submission (validation)
- Check responsive design on mobile

---

## 🔐 Security & Privacy

### Data Handling
- All data stored locally in JSON files
- No external databases (demo purposes)
- No real payment processing
- No email sending (demo purposes)

### API Key Management
- Never hardcode API keys
- Use `.env` file for sensitive values
- Add `.env` to `.gitignore`
- Provide `.env.example` template

### User Data
- Chat conversations processed for matching only
- Handoffs contain structured summaries only
- No raw chat logs exported
- Booking data minimal (name, email)

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Or change PORT in .env
PORT=3001
```

### AI responses failing
- Verify GEMINI_API_KEY is set correctly
- Check internet connection
- Verify Gemini API quota
- Check server logs for errors

### Booking not working
- Verify groups.json exists
- Check file permissions on data folder
- Ensure server is running
- Check browser console for errors

### Styles not loading
- Clear browser cache
- Verify styles.css exists in client folder
- Check file path in index.html

---

## 📝 Environment Variables

Create `.env` file in `/server` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### Getting Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with Google account
3. Create a new API key
4. Copy the key
5. Paste into `.env` file

---

## 🚧 Known Limitations

- **Demo Platform**: Not production-ready
- **Local Storage**: Uses JSON files instead of database
- **No Authentication**: No user accounts or login
- **Mock Payment**: No real payment processing
- **Single Session**: Data resets on server restart
- **No Email**: No confirmation emails sent
- **PDF Export**: Downloads as .txt file (simplified)

---

## 📄 License

This is a demo/educational project for the Mentra Bounty challenge.

---

## 🤝 Contributing

This is a demo platform. For production use, consider:
- Add user authentication
- Implement database (PostgreSQL/MongoDB)
- Add real payment processing (Stripe)
- Implement email notifications
- Add admin dashboard
- Implement proper logging & monitoring
- Add comprehensive testing
- Deploy to cloud (AWS/GCP/Azure)

---

## 📞 Support

For issues or questions:
1. Check this README
2. Review code comments
3. Check browser console for errors
4. Check server logs for errors

---

## ⚠️ Disclaimer

**This platform is a demo/prototype for educational purposes only.**

- Not a medical system
- AI recommendations are advisory only
- Does not provide medical advice
- Does not diagnose conditions
- Always consult licensed professionals
- In crisis, contact emergency services

---

**Built with ❤️ for the Mentra Bounty Challenge**
