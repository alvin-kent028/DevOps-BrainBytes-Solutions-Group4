# How We Built BrainBytes - Complete Architecture Guide

## Overview

**BrainBytes** is an **AI-powered educational tutor app** that lets students ask questions about various subjects (Math, Science, Programming, History, English) and receive AI-assisted responses with conversation history tracking.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Port 3000)                 │
│                  Next.js Frontend + React                   │
│  - Chat interface (Chat.jsx, ChatInput.jsx)                 │
│  - User authentication (Login.jsx, Register.jsx)            │
│  - Subject filtering & dashboard pages                      │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP Requests (Axios)
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                   API LAYER (Port 5000)                     │
│            Express.js Backend + Node.js                     │
│  - Chat routes (/api/chat)                                  │
│  - User routes (profiles, activity logs)                    │
│  - Learning material routes                                 │
│  - Auth middleware (JWT tokens)                             │
│  - AI Service (HuggingFace integration)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┼──────────────┐
         ↓           ↓              ↓
    ┌─────────┐ ┌──────────┐ ┌──────────────┐
    │ MongoDB │ │Prometheus│ │  Grafana     │
    │Database │ │Monitoring│ │  Dashboards  │
    │(Port    │ │(Port     │ │  (Port 3001) │
    │27017)   │ │9090)     │ └──────────────┘
    └─────────┘ └──────────┘
```

---

## 1. Frontend Layer (Next.js + React)

### Technology Stack
- **Framework**: Next.js 16 with React 18
- **HTTP Client**: Axios
- **Markdown Rendering**: React-Markdown with remark-gfm
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint

### Location
`/frontend`

### Key Components

#### Chat Interface
- **Chat.jsx** – Main chat display component that shows conversation history
- **ChatInput.jsx** – Input form where students type their questions
- **SubjectFilter.jsx** – Allows filtering questions by subject (Math, Science, etc.)

#### Authentication Pages
- **Login.jsx** – User login interface
- **Register.jsx** – New user registration

#### Dashboard Pages
- **DashboardPage.jsx** – Main dashboard showing learning progress
- **ProfilePage.jsx** – User profile and settings

### How It Works
1. Student types a question in `ChatInput.jsx`
2. Component uses Axios to POST request to backend (`http://localhost:5000/api/chat`)
3. Response is displayed in `Chat.jsx` with markdown formatting
4. Conversation history is stored in MongoDB and displayed on page load

### Testing
- **Location**: `frontend/__tests__/`
- **Test Files**: `Chat.test.js`, `ChatInput.test.js`, `setup.test.js`
- **Run Tests**: `npm test`

---

## 2. Backend Layer (Express + Node.js)

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Monitoring**: Prometheus client
- **Testing**: Jest + Supertest
- **Linting**: ESLint

### Location
`/backend`

### Core Files

#### Server Entry Point
- **server.js** – Starts Express server on port 5000, connects to MongoDB
- **app.js** – Main application setup (routes, middleware, database configuration)

#### AI & Utilities
- **aiService.js** – Integrates with HuggingFace API
  - Processes user questions
  - Generates AI responses
  - Enhances vocabulary in responses
  
- **metrics.js** – Prometheus metrics collection for monitoring

- **utils/aiHelpers.js** – Helper functions:
  - `detectQuestionType()` – Classifies question as definition/explanation/example
  - `analyzeSentiment()` – Analyzes student emotion
  - `getFrustrationResponse()` – Provides supportive responses for frustrated students
  
- **utils/trainingData.js** – 100+ Q&A pairs across all subjects

#### Database Models
Located in `/backend/models/`:

- **UserProfile.js** – Stores:
  - Username, email, password
  - Learning preferences
  - Account creation date

- **LearningMaterial.js** – Stores:
  - Subject content
  - Learning resources
  - Difficulty levels

- **ActivityLog.js** – Tracks:
  - Questions asked per subject
  - Time spent learning
  - Performance metrics

### API Routes
Located in `/backend/routes/`:

#### Authentication Routes (`authRoutes.js`)
- `POST /auth/register` – Create new user account
- `POST /auth/login` – User login (returns JWT token)
- `GET /auth/verify` – Verify JWT token

#### Chat Routes (`chatRoutes.js`)
- `POST /api/chat` – Submit a question and get AI response
- `GET /api/chat/history/:sessionId` – Retrieve chat history

#### User Profile Routes (`userProfileRoutes.js`)
- `GET /api/profile` – Get user profile
- `PUT /api/profile` – Update user preferences
- `DELETE /api/profile` – Delete account

#### Learning Material Routes (`learningMaterialRoutes.js`)
- `GET /api/materials` – Fetch learning resources
- `POST /api/materials` – Add new learning content
- `GET /api/materials/:subject` – Get materials by subject

#### Activity Log Routes (`activityLogRoutes.js`)
- `POST /api/activity` – Log user action
- `GET /api/activity/:userId` – Get user activity history

#### Health Check (`app.js`)
- `GET /health` – Returns server status and database connection state
  - Used by Docker healthcheck, Railway deployment verification
  - Returns `200 OK` if DB connected, `503` if not

### How the Chat Flow Works

1. **User submits question** → Frontend sends POST to `/api/chat` with question text
2. **Backend receives request** → `chatRoutes.js` handler processes it
3. **Question analysis** → `aiService.js` analyzes:
   - Question type (definition/explanation/example)
   - Sentiment (frustrated, confused, interested)
   - Subject classification
4. **AI generation** → Options:
   - Search training data first (fastest response)
   - Fall back to HuggingFace API if no exact match
5. **Response enhancement** → `aiService.enhanceVocabulary()` improves language
6. **Store in MongoDB** → Both question and answer saved for history
7. **Return to frontend** → JSON response sent back
8. **Frontend displays** → Chat component renders with markdown formatting

### Testing
- **Location**: `backend/__tests__/`
- **Test Files**: 
  - `aiHelpers.test.js` – Tests AI helper functions
  - `chatApi.test.js` – Tests chat API routes
- **Run Tests**: `npm test`

---

## 3. Database Layer (MongoDB)

### Technology Stack
- **Database**: MongoDB 6.0
- **ODM**: Mongoose 9.7.3
- **Port**: 27017 (default MongoDB port)

### Collections & Schemas

#### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  passwordHash: String,
  createdAt: Date,
  preferences: {
    favoriteSubjects: [String],
    theme: String
  }
}
```

#### Messages Collection
```javascript
{
  _id: ObjectId,
  sessionId: String,
  text: String,
  isUser: Boolean,
  createdAt: Date,
  sentiment: String,
  subject: String
}
```

#### Learning Materials Collection
```javascript
{
  _id: ObjectId,
  subject: String,
  title: String,
  content: String,
  difficulty: String,
  tags: [String]
}
```

#### Activity Logs Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  action: String,
  subject: String,
  timestamp: Date,
  duration: Number
}
```

### Connection
```javascript
// In app.js
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/brainbytes_dev')
```

---

## 4. AI Service Integration

### HuggingFace API Integration

**Location**: `/backend/aiService.js`

**Process**:
1. User question arrives at backend
2. AI Service analyzes question type using regex patterns
3. If exact match found in training data → Return immediately
4. Otherwise → Call HuggingFace API with question
5. HuggingFace returns AI-generated response
6. Response is enhanced with vocabulary improvements
7. Response saved to MongoDB

### Training Data

**Location**: `/backend/utils/trainingData.js`

Contains 100+ Q&A pairs organized by subject:

#### Math (17 pairs)
- Fractions, algebra, geometry, Pythagorean theorem
- Percentages, prime numbers, operations, statistics
- Functions, graphs, probability

#### Science (21 pairs)
- Photosynthesis, gravity, atoms, chemical reactions
- States of matter, water cycle, DNA
- Newton's laws, ecosystems, periodic table
- Energy, volcanoes, weather vs climate

#### Programming (17 pairs)
- Variables, loops, functions, arrays
- Debugging, objects, classes, operators
- Conditional statements, recursion, APIs
- JSON, scope (let/const/var), callbacks
- Git, databases

#### English (13 pairs)
- Parts of speech (noun, verb, adjective, adverb, pronoun)
- Affect vs effect, similes, metaphors
- Thesis statements, active/passive voice
- Alliteration, paragraph structure, sentence types

#### History/Geography (13 pairs)
- World Wars, Industrial Revolution, Cold War
- French Revolution, colonialism, Renaissance
- Philippine history (Rizal, Bonifacio, Katipunan)
- American Revolution, continents, oceans
- Latitude/longitude

---

## 5. Monitoring & Observability

### Prometheus (Port 9090)

**Location**: `/prometheus`

**Configuration**: `prometheus.yml`

**Features**:
- Collects metrics from backend every 15 seconds
- Stores time-series data
- Tracks:
  - Request count by endpoint
  - Response time (latency)
  - Error rates
  - Database connection status

**Alert Rules** (`alert_rules.yml`):
- High error rate (>5% failed requests)
- High latency (>1000ms average response)
- Database disconnected

**Recording Rules** (`recording_rules.yml`):
- Aggregates metrics by subject
- Calculates moving averages

### Grafana (Port 3001)

**Location**: `/grafana`

**Features**:
- Visualizes Prometheus metrics
- Pre-built dashboards:
  - `brainbytes-error-analysis.json` – Error tracking
  - `brainbytes-resource-optimization.json` – Performance metrics

**Dashboards Include**:
- Request rate per second
- API response times by endpoint
- Error rate trends
- Questions asked per subject
- Database query performance

**Access**: 
```
http://localhost:3001
Username: admin
Password: admin (set in docker-compose.yml)
```

### AlertManager (Port 9093)

**Configuration**: `/prometheus/alertmanager.yml`

**Features**:
- Receives alerts from Prometheus
- Routes alerts based on severity
- Can send notifications (email, Slack, etc.)

---

## 6. Containerization & Deployment

### Docker Compose

**Location**: `docker-compose.yml`

**Services**:

#### Backend Service
```yaml
backend:
  - Image: Built from ./backend/Dockerfile
  - Port: 5000
  - Depends on: MongoDB
  - Environment:
    - PORT=5000
    - MONGO_URI=mongodb://mongo:27017/brainbytes_dev
    - HUGGINGFACE_TOKEN=your_token_here
```

#### Frontend Service
```yaml
frontend:
  - Image: Built from ./frontend/Dockerfile
  - Port: 3000
  - Depends on: Backend
  - Environment:
    - NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

#### MongoDB Service
```yaml
mongo:
  - Image: mongo:6.0
  - Port: 27017
  - Volume: mongo-data (persistent storage)
```

#### Monitoring Stack
```yaml
prometheus:  # Port 9090
alertmanager: # Port 9093
grafana:     # Port 3001
```

### Dockerfiles

#### Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY . .
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s CMD node -e "require('http').get('http://localhost:5000/health', (r)=>process.exit(r.statusCode===200?0:1))"
CMD ["npm", "start"]
```

#### Frontend Dockerfile (`frontend/Dockerfile`)
```dockerfile
FROM node:20-alpine as builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]
```

### How to Run

#### Option 1: Using PowerShell Script (Recommended)
```powershell
# From workspace root
.\scripts\start-docker.ps1
```

#### Option 2: Using Docker Compose Directly
```bash
docker-compose up --build
```

#### Option 3: Running Locally Without Docker

**Backend**:
```bash
cd backend
npm install
# Create .env file with MONGO_URI pointing to local/remote MongoDB
npm start
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

---

## 7. Data Flow: A User Asking a Question

### Step-by-Step Process

```
1. FRONTEND → User types "What is photosynthesis?" in ChatInput.jsx
   ↓
2. FRONTEND → onClick handler triggers Axios POST
   ↓
3. HTTP REQUEST → POST http://localhost:5000/api/chat
   Body: { message: "What is photosynthesis?", subject: "science" }
   ↓
4. BACKEND → chatRoutes.js receives request
   ↓
5. BACKEND → aiService.js processes question:
   - Detects it's a "definition" type question
   - Searches trainingData for matching question
   - Finds exact match in science section
   ↓
6. BACKEND → Message saved to MongoDB:
   {
     text: "What is photosynthesis?",
     isUser: true,
     subject: "science",
     createdAt: Date.now()
   }
   ↓
7. BACKEND → Response object created and saved:
   {
     text: "[Pre-trained answer from trainingData]",
     isUser: false,
     subject: "science",
     createdAt: Date.now()
   }
   ↓
8. BACKEND → Metrics recorded:
   - Endpoint: /api/chat
   - Response time: 45ms
   - Status: 200 (success)
   ↓
9. BACKEND → HTTP 200 response sent to frontend with JSON:
   {
     success: true,
     message: "Photosynthesis is the process...",
     conversationId: "abc123"
   }
   ↓
10. FRONTEND → Axios receives response
    ↓
11. FRONTEND → Chat.jsx state updated with new message
    ↓
12. FRONTEND → React re-renders Chat component
    ↓
13. UI → Student sees Q&A pair displayed in chat window
    ↓
14. PROMETHEUS → Records metrics:
    - http_requests_total{endpoint="/api/chat"} +1
    - http_request_duration_seconds{...} 0.045
```

---

## 8. Environment Configuration

### Required Environment Variables

Create `backend/.env`:
```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb://mongo:27017/brainbytes_dev

# AI Service
HUGGINGFACE_TOKEN=your_huggingface_token_here

# JWT Secret (optional, for authentication)
JWT_SECRET=your_secret_key_here
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### Docker Compose Environment
All environment variables are set in `docker-compose.yml` under each service's `environment` section.

---

## 9. Development Workflow

### Local Development Setup

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Start MongoDB locally (or use Docker)
# Option A: Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.0

# Option B: Using MongoDB installed locally
# Just ensure mongod is running on port 27017

# 3. Start backend
cd backend
npm start
# Backend runs on http://localhost:5000

# 4. In another terminal, start frontend
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Linting & Code Quality

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint

# Security audit
npm audit --audit-level=high
```

---

## 10. Deployment

### Railway Deployment

**Configuration Files**:
- `railway.json` – Railway-specific settings
- `.github/workflows/` – GitHub Actions CI/CD pipeline

**Deployment Steps**:
1. Push code to GitHub
2. GitHub Actions runs:
   - Lint checks
   - Tests
   - Build Docker images
3. Railway auto-deploys containers
4. Health check verifies deployment

### Health Check Endpoint

The `/health` endpoint is critical for deployment:

```javascript
GET /health

Response:
{
  status: "ok",           // or "degraded"
  uptime: 1234.56,
  timestamp: "2026-07-18T10:30:00Z",
  db: "connected"         // or "disconnected"
}
```

---

## 11. Tech Stack Summary

### Frontend
- Next.js 16
- React 18
- Axios (HTTP client)
- React-Markdown
- Jest + React Testing Library

### Backend
- Express.js
- Node.js
- Mongoose (MongoDB ODM)
- JWT (Authentication)
- Prom-client (Metrics)
- Jest + Supertest (Testing)

### Database
- MongoDB 6.0
- Mongoose 9.7.3

### Monitoring
- Prometheus (Metrics collection)
- Grafana (Visualization)
- AlertManager (Alerting)

### DevOps
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Railway (Deployment)

---

## 12. Key Features

### ✅ AI-Powered Tutoring
- Ask questions across multiple subjects
- Get instant AI-assisted responses
- Subject filtering and categorization

### ✅ User Authentication
- Secure login/registration with JWT
- User profile management
- Learning preferences storage

### ✅ Conversation History
- Persistent chat history in MongoDB
- Track learning progress
- Activity logs per user

### ✅ Monitoring & Observability
- Real-time metrics with Prometheus
- Beautiful dashboards with Grafana
- Alert system for issues

### ✅ Production-Ready
- Containerized with Docker
- Automated testing (Jest)
- Code quality checks (ESLint)
- Security audits (npm audit)
- Health checks for deployment

### ✅ Scalability
- Microservices architecture
- Separate frontend/backend
- Database connection pooling
- Metric-driven optimization

---

## 13. Troubleshooting

### MongoDB Connection Fails
```bash
# Check if MongoDB is running
docker ps | grep mongo

# Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:6.0
```

### Frontend Can't Connect to Backend
```bash
# Check if backend is running
curl http://localhost:5000/health

# Verify NEXT_PUBLIC_API_BASE_URL is set correctly
echo $NEXT_PUBLIC_API_BASE_URL
```

### Tests Failing
```bash
# Clear Jest cache
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose
```

### HuggingFace API Error
```bash
# Verify token is set
echo $HUGGINGFACE_TOKEN

# Check HuggingFace API status
curl -H "Authorization: Bearer YOUR_TOKEN" https://api-inference.huggingface.co/status
```

---

## 14. Project Structure

```
DevOps-BrainBytes-Solutions-Group4/
├── backend/
│   ├── __tests__/              # Jest tests
│   ├── middleware/             # Auth middleware
│   ├── models/                 # MongoDB schemas
│   ├── routes/                 # API routes
│   ├── utils/                  # Helper functions & training data
│   ├── Dockerfile              # Backend container config
│   ├── app.js                  # Express app setup
│   ├── server.js               # Server entry point
│   ├── aiService.js            # AI integration
│   ├── metrics.js              # Prometheus metrics
│   ├── package.json            # Dependencies
│   └── eslint.config.js        # Linting rules
│
├── frontend/
│   ├── __tests__/              # Jest tests
│   ├── components/             # React components
│   ├── pages/                  # Next.js pages
│   ├── src/                    # Additional source files
│   ├── Dockerfile              # Frontend container config
│   ├── next.config.js          # Next.js configuration
│   ├── package.json            # Dependencies
│   ├── jest.setup.js           # Jest configuration
│   └── eslint.config.js        # Linting rules
│
├── prometheus/                 # Metrics & alerts
│   ├── prometheus.yml          # Prometheus config
│   ├── alert_rules.yml         # Alert definitions
│   ├── alertmanager.yml        # Alert routing
│   └── recording_rules.yml     # Metric aggregation
│
├── grafana/                    # Dashboard config
│   ├── dashboards/             # Dashboard definitions
│   └── provisioning/           # Data source setup
│
├── monitoring/                 # Monitoring utilities
│   ├── traffic_simulator.js    # Load testing tool
│   └── README.md               # Monitoring guide
│
├── docs/                       # Documentation
│   ├── testing.md              # Testing guide
│   ├── operations.md           # Deployment guide
│   └── monitoring-guide.md     # Monitoring guide
│
├── scripts/                    # Automation
│   ├── start-docker.ps1        # PowerShell startup script
│   └── start-docker.sh         # Bash startup script
│
├── docker-compose.yml          # Container orchestration
├── package.json                # Root dependencies
├── railway.json                # Railway deployment config
├── README.md                   # Quick start guide
├── README_START.md             # Getting started guide
└── start-local.js              # Local development script
```

---

## 15. Contributing

### Adding a New Question to Training Data

1. Open `/backend/utils/trainingData.js`
2. Add entry to appropriate subject section:

```javascript
{ 
  input: "Your question here?", 
  output: "Your detailed answer here.", 
  type: "definition",  // or "explanation", "example"
  subject: "math"      // or "science", "programming", "english", "history"
}
```

3. Restart backend: `npm start`

### Adding a New API Route

1. Create file in `/backend/routes/`
2. Define route handlers with Express:

```javascript
const express = require('express');
const router = express.Router();

router.get('/endpoint', (req, res) => {
  // Handler logic
  res.json({ message: 'Success' });
});

module.exports = router;
```

3. Register in `/backend/app.js`:

```javascript
const myRoutes = require('./routes/myRoutes');
app.use('/api', myRoutes);
```

### Adding a New Component (Frontend)

1. Create `.jsx` file in `/frontend/components/`
2. Use React hooks and Axios for API calls
3. Add Jest test in `/frontend/__tests__/`

---

## 16. Additional Resources

- **Express Documentation**: https://expressjs.com/
- **Next.js Documentation**: https://nextjs.org/docs
- **MongoDB Documentation**: https://docs.mongodb.com/
- **Prometheus Documentation**: https://prometheus.io/docs/
- **Grafana Documentation**: https://grafana.com/docs/grafana/latest/
- **Docker Documentation**: https://docs.docker.com/

---

## Summary

BrainBytes is a **full-stack AI tutoring application** built with modern technologies:

- **Frontend**: Next.js + React for responsive UI
- **Backend**: Express.js + Node.js for API
- **Database**: MongoDB for data persistence
- **AI**: HuggingFace API + local training data
- **Monitoring**: Prometheus + Grafana for observability
- **DevOps**: Docker + GitHub Actions for deployment

The architecture emphasizes **scalability**, **reliability**, and **observability**, making it production-ready for educational use.
