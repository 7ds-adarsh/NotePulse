import bcrypt
import jwt
import datetime
from flask import current_app
from app.models.user import User

def login_user(email, password):
    user = User.query.filter_by(email=email).first()
    
    if not user:
        return None, "User not found"

    if not bcrypt.checkpw(password.encode(), user.password.encode()):
        return None, "Invalid credentials"

    payload = {
        "email": user.email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1),
    }

    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")

    return {"token": token}, None

