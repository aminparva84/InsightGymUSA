"""
Migration: Assistant to Coach (American Gym Version)
- Adds coach_approval_status to user table (pending/approved)
- Adds licenses column to user_profiles for coach professional licenses
- Migrates existing assistants to coaches
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('FLASK_APP', 'app')

def run():
    from app import app, db
    from sqlalchemy import text, inspect

    with app.app_context():
        inspector = inspect(db.engine)
        cols = [c['name'] for c in inspector.get_columns('user')] if inspector.has_table('user') else []

        # Add coach_approval_status to user (for coach registration approval)
        if 'coach_approval_status' not in cols:
            print("Adding coach_approval_status to user...")
            db.session.execute(text('ALTER TABLE "user" ADD COLUMN coach_approval_status VARCHAR(20) DEFAULT \'approved\''))
            db.session.commit()
            print("[OK] coach_approval_status added")
        else:
            print("[OK] coach_approval_status already exists")

        # Add licenses to user_profiles (for coach professional licenses)
        if inspector.has_table('user_profiles'):
            cols = [c['name'] for c in inspector.get_columns('user_profiles')]
            if 'licenses' not in cols:
                print("Adding licenses to user_profiles...")
                db.session.execute(text("ALTER TABLE user_profiles ADD COLUMN licenses TEXT"))
                db.session.commit()
                print("[OK] licenses added")
            else:
                print("[OK] licenses already exists")

        # Migrate existing assistants to coaches
        try:
            result = db.session.execute(text('UPDATE "user" SET role=\'coach\', coach_approval_status=\'approved\' WHERE role=\'assistant\''))
            db.session.commit()
            print(f"[OK] Migrated {result.rowcount} assistants to coaches")
        except Exception as e:
            print(f"[INFO] Migration step: {e}")
            db.session.rollback()

        print("Migration complete.")

if __name__ == '__main__':
    run()
