# Insight GYM USA - American Gym Management Platform

A comprehensive gym management platform for American fitness facilities. Features AI-powered workout plans, coach management, member tracking, and professional coach registration with certifications and licenses.

## Features

- **Roles**: Admin, Coach, Member
- **Coach Self-Registration**: Coaches can apply directly with professional info (certifications, licenses, experience)
- **AI-Powered**: Personalized workout plans, nutrition guidance, progress tracking
- **Member Management**: Assign members to coaches, track progress, break requests
- **English Only**: Designed for American gym culture
- **Training Programs**: Beginner to advanced, EMS options
- **Progress Tracking**: Workout logs, measurements, AI feedback

### American Gym Website Features
- **Class Schedule** – Public page with weekly group class schedule
- **Trainer/Team Page** – Public page listing approved coaches with bios and certifications
- **Pricing Page** – Membership tiers and pricing
- **Free Trial CTA** – Prominent "Start Free Trial" on landing page
- **Testimonials** – Member success stories (editable via Admin Site Settings)
- **FAQ** – Common questions (editable via Admin Site Settings)
- **Location & Hours** – Address, operating hours, optional map embed
- **Coach Approval Flow** – Admin UI to approve/reject pending coaches

## Tech Stack

### Backend
- Flask, SQLAlchemy, Flask-JWT-Extended, Flask-CORS

### Frontend
- React, React Router, React i18next, Axios

## Quick Start (Windows)

```bash
# First-time setup (creates venv, installs deps, creates .env)
setup.bat

# Launch backend + frontend
launch.bat
```

If `launch.bat` is run without prior setup, it will auto-run setup when venv or node_modules are missing.

**Ports** (to avoid conflicts with other projects): Backend `5001`, Frontend `3001`. Override backend with `PORT` in backend `.env`.

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
DATABASE_URL=postgresql://user:password@localhost:5432/insight_gym_usa
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
