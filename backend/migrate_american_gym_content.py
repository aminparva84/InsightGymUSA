"""
Migration: Add American gym content fields to site_settings.
- operating_hours_json, map_url, class_schedule_json, testimonials_json, pricing_tiers_json, faq_json
Run once: python migrate_american_gym_content.py
"""

from app import app, db
from sqlalchemy import text, inspect


def migrate():
    with app.app_context():
        insp = inspect(db.engine)
        cols = [c['name'] for c in insp.get_columns('site_settings')]
        
        new_cols = [
            ('operating_hours_json', 'TEXT'),
            ('map_url', 'TEXT'),
            ('class_schedule_json', 'TEXT'),
            ('testimonials_json', 'TEXT'),
            ('pricing_tiers_json', 'TEXT'),
            ('faq_json', 'TEXT'),
        ]
        for col_name, col_type in new_cols:
            if col_name not in cols:
                print(f"Adding {col_name}...")
                db.session.execute(text(f"ALTER TABLE site_settings ADD COLUMN {col_name} {col_type}"))
                db.session.commit()
                print(f"[OK] {col_name} added")
            else:
                print(f"[OK] {col_name} already exists")
        print("Migration complete: American gym content fields ready.")


if __name__ == "__main__":
    migrate()
