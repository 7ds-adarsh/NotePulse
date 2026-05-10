import jwt
from functools import wraps
from flask import request, jsonify, current_app


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get("token")

        if not token:
            return jsonify({"error": "Token missing"}), 401

        try:
            data = jwt.decode(
                token, current_app.config["SECRET_KEY"], algorithms=["HS256"]
            )
            current_user = data["email"]

        except Exception:
            return jsonify({"error": "Invalid or expired token"}), 401

        return f(current_user, *args, **kwargs)

    return decorated
