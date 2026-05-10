from app.extensions import db
from datetime import datetime

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=True)  # Optional title for notes
    content = db.Column(db.Text, nullable=False)
    formatting = db.Column(db.Text, nullable=True)  # JSON string for text formatting options
    user_id = db.Column(db.String, nullable=False)  # 🔥 FIXED (was Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Note {self.id}>"