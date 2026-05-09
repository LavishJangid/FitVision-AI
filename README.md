# FitVision AI - MVP (Phase 1 + 2)

FitVision AI is a real-time posture and exercise form correction MVP using React + FastAPI + OpenCV + MediaPipe Pose.

## Architecture

- `frontend/` - React + Vite dark-mode dashboard with Home, Workout, Dashboard pages
- `backend/` - FastAPI API + WebSocket stream + pose + exercise analysis
- `models/` - placeholder for trained/optimized CV models
- `pose_detection/` - top-level area for future shared pose modules
- `exercise_logic/` - top-level area for future shared exercise business logic
- `database/` - migrations and persistence layer placeholder
- `utils/` - shared scripts/utilities placeholder

## Implemented MVP Features

- Real-time webcam capture in browser
- WebSocket streaming to backend for low-latency updates
- MediaPipe full-body pose landmarks detection
- Skeleton overlay rendering on backend frames
- Joint angles: knee, elbow, hip
- Exercise support: squat, pushup, plank
- Form feedback examples:
  - Keep your back straight
  - Lower your squat deeper
  - Align your elbows under shoulders
- Rep counting for squats and pushups
- Live form accuracy score (0-100)
- Neon dark SaaS UI with status panel + controls
- Session tracking with calories, duration, average/best score
- Goal progress input (rep target)
- Dashboard achievements + recent sessions feed
- Persistent workout history (`database/sessions.json`)
- Progress API endpoints for stats and session history
- Account system (register/login/profile)
- Voice AI coach (browser text-to-speech corrective cues)
- PDF report export (`fitvision-report.pdf`)
- Leaderboard + challenge quests
- Dockerized deployment with `docker-compose`

## Backend Structure

```text
backend/
  app/
    api/routes/
      health.py
      workout.py
    core/config.py
    schemas/analysis.py
    pose_detection/mediapipe_pose.py
    exercise_logic/detector.py
    services/workout_service.py
    utils/angles.py
    main.py
  requirements.txt
  .env.example
```

## Frontend Structure

```text
frontend/src/
  components/
    Layout.jsx
    StatusPanel.jsx
  hooks/
    useWorkoutSocket.js
  pages/
    HomePage.jsx
    WorkoutPage.jsx
    DashboardPage.jsx
  services/api.js
  App.jsx
  main.jsx
  index.css
```

## Environment Variables

### Frontend (`frontend/.env`)

Copy from `frontend/.env.example`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_WS_BASE_URL=ws://127.0.0.1:8000
```

### Backend (`backend/.env`)

Copy from `backend/.env.example`:

```env
APP_NAME=FitVision AI API
DEBUG=true
ALLOWED_ORIGINS=http://localhost:5173
```

## Installation

### 1) Backend setup

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
```

### 2) Frontend setup

```bash
cd frontend
npm install
```

## Run Commands

### Run backend

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Run frontend

```bash
cd frontend
npm run dev
```

Frontend URL: `http://localhost:5173`

## API Endpoints

- `GET /` - basic service message
- `GET /health` - health check
- `WS /workout/stream` - realtime workout analysis stream
- `POST /progress/sessions` - save completed workout session
- `GET /progress/sessions` - fetch recent sessions
- `GET /progress/stats` - fetch dashboard aggregate metrics
- `POST /auth/register` - create account
- `POST /auth/login` - login and get token
- `GET /auth/me` - fetch profile
- `GET /progress/challenges` - personalized challenge progress
- `GET /progress/leaderboard` - global leaderboard

Authenticated endpoints require:

```http
Authorization: Bearer <token>
```

## One-Command Docker Run

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

WebSocket payload expected from frontend:

```json
{
  "exercise": "squat",
  "frame": "data:image/jpeg;base64,..."
}
```

## Next Steps (Phase 3+)

- add database persistence (sessions/history)
- add authentication and user profiles
- add personalized plans and adaptive thresholds
- add GPU inference mode and frame batching
- add test suite + CI
