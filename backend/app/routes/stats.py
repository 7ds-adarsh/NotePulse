from flask import Blueprint, jsonify
from app.services.notes_services import get_notes
from app.services.auth_middleware import token_required
from datetime import datetime, timedelta

stats_bp = Blueprint("stats", __name__)


@stats_bp.route("/", methods=["GET"])
@token_required
def get_stats(current_user):
    notes = get_notes(current_user)

    # Calculate stats
    total_notes = len(notes)

    # Notes created this week
    week_ago = datetime.utcnow() - timedelta(days=7)
    notes_this_week = len([n for n in notes if n.created_at >= week_ago])

    # Last updated note
    if notes:
        last_updated = max(n.created_at for n in notes)
        last_updated_str = last_updated.strftime("%B %d, %Y")
    else:
        last_updated_str = "Never"

    return jsonify({
        "total_notes": total_notes,
        "notes_this_week": notes_this_week,
        "last_updated": last_updated_str
    }), 200