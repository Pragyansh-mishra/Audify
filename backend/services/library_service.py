import os
import yt_dlp

from pathlib import Path


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

    with yt_dlp.YoutubeDL(options) as ydl:

        info = ydl.extract_info(url, download=True)

        filename = ydl.prepare_filename(info)

        filename = str(Path(filename).with_suffix(".mp3"))

    return {
        "title": info.get("title"),
        "artist": info.get("artist") or info.get("uploader"),
        "filename": os.path.basename(filename),
        "filepath": filename,
        "success": True
    }