from flask import Blueprint, request, jsonify
from backend.services.library_service import download_song

library_bp = Blueprint("library", __name__)


@library_bp.route("/api/download", methods=["POST"])
def download():
    data = request.get_json(silent=True) or {}
    url = data.get("url", "").strip()

    if not url:
        return jsonify({
            "success": False,
            "error": "Please provide a song URL."
        }), 400

    try:
        result = download_song(url)
        return jsonify({
            "success": True,
            "message": "Download completed!",
            "song": result
        })
    except Exception as error:
        return jsonify({
            "success": False,
            "error": str(error)
        }), 500
