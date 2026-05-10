# Notty

Notty is a modern personal note-taking app with secure authentication, live dashboard stats, and fast note management. It combines a Next.js frontend with a Flask backend and stores data in SQLite so you can create, update, delete, and search notes in a polished full-stack interface.

## Features

- Email/password auth with secure session cookies
- Create, edit, and delete notes
- Search notes by title or content
- Lightweight note formatting with markdown-like rendering
- Live dashboard metrics: total notes, notes created this week, and last update
- Full-stack architecture with Next.js frontend and Flask API backend

## Project structure

- `frontend/` — Next.js app, UI pages, note editor, authentication flow
- `backend/` — Flask API, SQLite database, auth and notes routes

## Local development

### Backend

1. Create and activate a Python environment.
2. Install dependencies:

```bash
pip install flask flask-cors flask-sqlalchemy bcrypt
```

3. Run the backend server from the project root:

```bash
python backend/run.py
```

The backend listens on `http://127.0.0.1:5000` and automatically creates the SQLite database.

### Frontend

From `frontend/`:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

### Environment variable

Create a `.env.local` file in `frontend/` and set:

```bash
NEXT_PUBLIC_API_BASE_URL=https://notepulse-1.onrender.com
```

For local development, keep the backend running on `http://localhost:5000`, and the app will automatically fall back to that when the env variable is not set.

## API endpoints

- `POST /api/auth/login` — login with email and password
- `POST /api/auth/register` — create a new user
- `GET /api/auth/profile` — user profile info
- `POST /api/auth/logout` — logout
- `GET /api/notes/` — list notes
- `POST /api/notes/` — create a note
- `PUT /api/notes/<id>` — update a note
- `DELETE /api/notes/<id>` — delete a note
- `GET /api/stats/` — note statistics

## Notes

- The backend uses SQLite at `backend/app.db`.
- CORS is configured for `http://localhost:3000`.
- Authentication relies on a cookie named `token`.

## Future improvements

- Add password reset and profile settings
- Add richer markdown support and note tagging
- Add deployment configuration for production
