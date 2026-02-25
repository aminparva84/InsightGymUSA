# Insight GYM USA - Admin Credentials

## Admin Account

| Field | Value |
|-------|-------|
| **Username** | `admin` |
| **Password** | `admin123` |
| **Email** | `admin@insightgymusa.com` |

## How to Login

1. Start the app: run `launch.bat` (or `setup.bat` then `launch.bat`)
2. Open browser: **http://localhost:3001**
3. Click **Get Started** or **Start Free Trial**
4. Enter username: `admin` and password: `admin123`
5. Click **Login**

## Admin Dashboard Access

After logging in as admin:
- **Dashboard** – You'll see admin tabs (Members and Assistants Management, Training Info, AI Settings, etc.)
- **Admin** button – Click the **Admin** button in the top bar to open the dedicated Admin page at `/admin` (Coaches, Members, Configuration)

## Reset Admin Password

If you need to reset the admin password:

```bash
cd backend
venv\Scripts\activate
python reset_user_password.py admin admin123
```

Replace `admin123` with your desired password.

## Create New Admin (if needed)

```bash
cd backend
venv\Scripts\activate
python create_admin_user.py
```

This creates a new admin only if one doesn't exist. Default credentials: `admin` / `admin123`.
