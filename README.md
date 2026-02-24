# Insight GYM - American Gym Management Platform

A comprehensive gym management platform for American fitness facilities. Features AI-powered workout plans, coach management, member tracking, and professional coach registration with certifications and licenses.

## Features

- **Roles**: Admin, Coach, Member
- **Coach Self-Registration**: Coaches can apply directly with professional info (certifications, licenses, experience)
- **AI-Powered**: Personalized workout plans, nutrition guidance, progress tracking
- **Member Management**: Assign members to coaches, track progress, break requests
- **English Only**: Designed for American gym culture
- **Training Programs**: Beginner to advanced, EMS options
- **Progress Tracking**: Workout logs, measurements, AI feedback

## Tech Stack

### Backend
- Flask, SQLAlchemy, Flask-JWT-Extended, Flask-CORS

### Frontend
- React, React Router, React i18next, Axios

## Setup

### Backend
```bash
cd backend
python -m venv venv
# Activate: venv\Scripts\activate (Windows) or source venv/bin/activate (Linux/Mac)
pip install -r requirements.txt
```

Create `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/insight_gym
JWT_SECRET_KEY=your-secret-key
```

Run migration for coach support:
```bash
python migrate_assistant_to_coach.py
```

Start backend:
```bash
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Roles

| Role | Registration | Permissions |
|------|--------------|-------------|
| **Admin** | Manual/seed | Full access: coaches, members, settings, AI |
| **Coach** | Self-register (pending approval) | Assigned members, programs, break requests |
| **Member** | Self-register | Training programs, AI chat, progress |

## Coach Registration

Coaches register with:
- Username, email, password
- Certifications (e.g. NASM-CPT, ACE)
- Licenses (e.g. state fitness license)
- Years of experience, specialization, education, bio

Admin approves pending coaches before they can access member features.

## License

For educational purposes.
