from flask import Blueprint, request, jsonify
from backend.services.playlist_service import extract_playlist

playlist_bp = Blueprint("playlists", __name__)


@playlist_bp.route("/api/playlists/import", methods=["POST"])
def import_playlist():
    data = request.get_json(silent=True) or {}
    url = data.get("url", "").strip()

    if not url:
        return jsonify({
            "success": False,
            "error": "Please provide a playlist URL."
        }), 400

    try:
        playlist = extract_playlist(url)
        return jsonify({
            "success": True,
            "playlist": playlist
        })
    except Exception as error:
        return jsonify({
            "success": False,
            "error": str(error)
        }), 500
