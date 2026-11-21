from pathlib import Path

from flask import Blueprint, request, jsonify, send_file

from backend.services.library_service import download_song
from backend.database.db import get_db_connection


library_bp = Blueprint("library", __name__)


# 1. DOWNLOAD SONG
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
        }), 200

    except Exception as error:
        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


# 2. GET ALL SONGS
@library_bp.route("/api/library", methods=["GET"])
def get_library():

    connection = get_db_connection()

    try:
        songs = connection.execute(
            "SELECT * FROM songs ORDER BY downloaded_at DESC"
        ).fetchall()

        return jsonify({
            "success": True,
            "total_songs": len(songs),
            "songs": [dict(song) for song in songs]
        })

    finally:
        connection.close()


# 3. LIBRARY STATISTICS
@library_bp.route("/api/library/stats", methods=["GET"])
def get_library_stats():

    connection = get_db_connection()

    try:
        stats = connection.execute("""
            SELECT
                COUNT(*) AS total_songs,
                COALESCE(SUM(file_size), 0) AS total_storage
            FROM songs
        """).fetchone()

        return jsonify({
            "success": True,
            "total_songs": stats["total_songs"],
            "total_storage_bytes": stats["total_storage"],
            "total_storage_mb": round(
                stats["total_storage"] / (1024 * 1024), 2
            )
        })

    finally:
        connection.close()


# 4. GET INDIVIDUAL SONG
@library_bp.route("/api/library/<int:song_id>", methods=["GET"])
def get_song(song_id):

    connection = get_db_connection()

    try:
        song = connection.execute(
            "SELECT * FROM songs WHERE id = ?",
            (song_id,)
        ).fetchone()

        if song is None:
            return jsonify({
                "success": False,
                "error": "Song not found."
            }), 404

        return jsonify({
            "success": True,
            "song": dict(song)
        })

    finally:
        connection.close()


# 5. DOWNLOAD EXISTING SONG TO BROWSER
@library_bp.route("/api/library/<int:song_id>/file", methods=["GET"])
def download_existing_song(song_id):

    connection = get_db_connection()

    try:
        song = connection.execute(
            "SELECT * FROM songs WHERE id = ?",
            (song_id,)
        ).fetchone()

        if song is None:
            return jsonify({
                "success": False,
                "error": "Song not found."
            }), 404

        filepath = Path(song["filepath"])

        if not filepath.is_file():
            return jsonify({
                "success": False,
                "error": "Audio file not found on this device."
            }), 404

        return send_file(
            filepath,
            as_attachment=True,
            download_name=song["filename"],
            mimetype="audio/mpeg"
        )

    finally:
        connection.close()


# 6. DELETE SONG
@library_bp.route("/api/library/<int:song_id>", methods=["DELETE"])
def delete_song(song_id):

    connection = get_db_connection()

    try:
        song = connection.execute(
            "SELECT filepath FROM songs WHERE id = ?",
            (song_id,)
        ).fetchone()

        if song is None:
            return jsonify({
                "success": False,
                "error": "Song not found."
            }), 404

        filepath = Path(song["filepath"])

        # Delete the actual audio file
        if filepath.is_file():
            filepath.unlink()

        # Delete database record
        connection.execute(
            "DELETE FROM songs WHERE id = ?",
            (song_id,)
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Song deleted successfully."
        })

    finally:
        connection.close()