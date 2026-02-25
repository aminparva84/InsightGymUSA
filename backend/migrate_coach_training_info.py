"""
Create coach_training_info table for per-coach training levels and injuries.
Run from project root: python backend/migrate_coach_training_info.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.chdir(os.path.dirname(os.path.abspath(__file__)))

from app import app, db

with app.app_context():
    from models import CoachTrainingInfo  # noqa: F401
    db.create_all()
    print("[OK] coach_training_info table created (if not exists)")
