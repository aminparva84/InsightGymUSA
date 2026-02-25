"""
Clear all chat history for all users.
Run from backend directory: python clear_chat_history.py
"""

from app import app, db, ChatHistory, ChatSession


def clear_all_chat_history():
    with app.app_context():
        chat_count = ChatHistory.query.count()
        session_count = ChatSession.query.count()

        ChatHistory.query.delete()
        ChatSession.query.delete()
        db.session.commit()

        print(f"Cleared {chat_count} chat history entries and {session_count} chat sessions for all users.")
        print("All chat history has been removed.")


if __name__ == "__main__":
    clear_all_chat_history()
