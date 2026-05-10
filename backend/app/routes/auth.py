from flask import Blueprint, request, jsonify, make_response
from app.services.auth_service import login_user
import bcrypt
from app.extensions import db
from app.models.user import User
from app.services.auth_middleware import token_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    result, error = login_user(email, password)

    if error:
        return jsonify({"error": error}), 401

    token = result["token"]

    response = make_response(jsonify({"message": "Login successful"}))

    response.set_cookie(
        "token",
        token,
        httponly=True,
        secure=True,  # required for HTTPS/production
        samesite="None",  # required for cross-origin requests
        path="/",  # ensure global access
    )

    return response


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    user = User(email=email, password=hashed)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User created"}), 201


@auth_bp.route("/profile", methods=["GET"])
@token_required
def profile(current_user):
    return jsonify({"email": current_user}), 200

@auth_bp.route("/logout", methods=["POST"])
def logout():
    response = make_response(jsonify({"message": "Logged out"}))
    response.delete_cookie("token")
    return response