from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.note import Note

app = create_app()

with app.app_context():
    print("=== USERS ===")
    users = User.query.all()
    for user in users:
        print(f"ID: {user.id}, Email: {user.email}")

    print("\n=== NOTES ===")
    notes = Note.query.all()
    for note in notes:
        print(f"ID: {note.id}, Content: {note.content[:50]}..., User ID: {note.user_id}, Created: {note.created_at}")