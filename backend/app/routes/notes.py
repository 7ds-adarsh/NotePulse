from flask import Blueprint, request, jsonify
from app.services.notes_services import create_note, get_notes, update_note_by_id, delete_note_by_id
from app.services.auth_middleware import token_required

notes_bp = Blueprint("notes", __name__)


@notes_bp.route("/", methods=["GET"])
@token_required
def fetch_notes(current_user):
    notes = get_notes(current_user)

    return (
        jsonify(
            [
                {
                    "id": n.id,
                    "title": n.title,
                    "content": n.content,
                    "formatting": n.formatting,
                    "created_at": n.created_at.isoformat(),
                }
                for n in notes
            ]
        ),
        200,
    )


@notes_bp.route("/", methods=["POST"])
@token_required
def add_note(current_user):
    data = request.get_json()
    content = data.get("content")
    title = data.get("title")
    formatting = data.get("formatting")

    if not content:
        return jsonify({"error": "Content required"}), 400

    create_note(current_user, content, title, formatting)

    return jsonify({"message": "Note created"}), 201


@notes_bp.route("/<int:note_id>", methods=["PUT"])
@token_required
def update_note(current_user, note_id):
    data = request.get_json()
    content = data.get("content")
    title = data.get("title")
    formatting = data.get("formatting")

    if not content:
        return jsonify({"error": "Content required"}), 400

    success, error = update_note_by_id(note_id, current_user, content, title, formatting)

    if error:
        return jsonify({"error": error}), 400

    return jsonify({"message": "Note updated"}), 200


@notes_bp.route("/<int:note_id>", methods=["DELETE"])
@token_required
def delete_note(current_user, note_id):
    success, error = delete_note_by_id(note_id, current_user)

    if error:
        return jsonify({"error": error}), 400

    return jsonify({"message": "Deleted"}), 200
