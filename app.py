import os
from backend.database.db import initialize_database
from flask import Flask, render_template, jsonify, url_for

from backend.routes.health import health_bp
from backend.routes.playlists import playlist_bp
from backend.routes.library import library_bp


app = Flask(
    __name__,
    template_folder="frontend/templates",
    static_folder="frontend/static"
)
initialize_database()


# Register backend routes (each blueprint exactly once)
app.register_blueprint(health_bp)
app.register_blueprint(playlist_bp)
app.register_blueprint(library_bp)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/covers")
def get_covers():

    cover_folder = os.path.join(
        app.static_folder,
        "images",
        "album-covers"
    )

    allowed_extensions = (".jpg", ".jpeg", ".png", ".webp")

    if not os.path.isdir(cover_folder):
        return jsonify([])

    covers = [
        url_for("static", filename=f"images/album-covers/{filename}")
        for filename in os.listdir(cover_folder)
        if filename.lower().endswith(allowed_extensions)
    ]

    return jsonify(covers)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)