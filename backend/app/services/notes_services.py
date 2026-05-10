from app.models.note import Note
from app.extensions import db


def create_note(user_email, content, title=None, formatting=None):
    note = Note(content=content, user_id=user_email, title=title, formatting=formatting)

    db.session.add(note)
    db.session.commit()

    return note


def get_notes(user_email):
    return (
        Note.query.filter_by(user_id=user_email).order_by(Note.created_at.desc()).all()
    )


def update_note_by_id(note_id, user_email, content, title=None, formatting=None):
    note = Note.query.get(note_id)

    if not note:
        return None, "Note not found"

    if note.user_id != user_email:
        return None, "Unauthorized"

    note.content = content
    note.title = title
    note.formatting = formatting

    db.session.commit()

    return True, None


def delete_note_by_id(note_id, user_email):
    note = Note.query.get(note_id)

    if not note:
        return None, "Note not found"

    if note.user_id != user_email:
        return None, "Unauthorized"

    db.session.delete(note)
    db.session.commit()

    return True, None
