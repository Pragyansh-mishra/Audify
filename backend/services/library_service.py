import os
import yt_dlp

from pathlib import Path

from backend.database.db import get_db_connection


# Project download directory
BASE_DIR = Path(__file__).resolve().parents[2]

DOWNLOAD_DIR = BASE_DIR / "data" / "downloads"

DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)


def download_song(url):

    output_template = str(
        DOWNLOAD_DIR / "%(title)s.%(ext)s"
    )

    options = {

        "format": "bestaudio/best",

        "outtmpl": output_template,

        "noplaylist": True,

        "quiet": True,

        "no_warnings": True,

        "ffmpeg_location": r"C:\ffmpeg\ffmpeg-9.1-essentials_build\bin",

        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "320",
            }
        ],
    }

    # Download audio
    with yt_dlp.YoutubeDL(options) as ydl:

        info = ydl.extract_info(url, download=True)

        filename = ydl.prepare_filename(info)

        filename = str(Path(filename).with_suffix(".mp3"))

    # Verify downloaded file
    if not os.path.isfile(filename):

        raise FileNotFoundError(
            "Downloaded audio file could not be found."
        )

    # Collect song metadata
    song = {

        "title": info.get("title"),

        "artist": info.get("artist") or info.get("uploader"),

        "filename": os.path.basename(filename),

        "filepath": filename,

        "duration": info.get("duration"),

        "thumbnail": info.get("thumbnail"),

        "source_url": url,

        "file_size": os.path.getsize(filename),

        "success": True
    }

    # Save song information in SQLite
    connection = get_db_connection()

    try:

        cursor = connection.execute(
            """
            INSERT INTO songs (
                title,
                artist,
                filename,
                filepath,
                duration,
                thumbnail,
                source_url,
                file_size
            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?)

            ON CONFLICT(filepath) DO UPDATE SET

                title = excluded.title,
                artist = excluded.artist,
                filename = excluded.filename,
                duration = excluded.duration,
                thumbnail = excluded.thumbnail,
                source_url = excluded.source_url,
                file_size = excluded.file_size
            """,

            (
                song["title"],
                song["artist"],
                song["filename"],
                song["filepath"],
                song["duration"],
                song["thumbnail"],
                song["source_url"],
                song["file_size"]
            )
        )

        connection.commit()

        song["id"] = cursor.lastrowid

    finally:

        connection.close()

    return song