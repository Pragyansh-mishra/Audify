import yt_dlp


def extract_playlist(url):

    options = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": "in_playlist",
        "skip_download": True,
        "ignoreerrors": True,
    }

    with yt_dlp.YoutubeDL(options) as ydl:

        info = ydl.extract_info(url, download=False)

    if not info:
        raise ValueError("Unable to extract playlist information.")

    tracks = []

    entries = info.get("entries") or []

    for entry in entries:

        if not entry:
            continue

        tracks.append({
            "id": entry.get("id"),
            "title": entry.get("title"),
            "artist": entry.get("artist") or entry.get("uploader"),
            "duration": entry.get("duration"),
            "thumbnail": entry.get("thumbnail"),
            "url": entry.get("webpage_url") or entry.get("url"),
        })

    return {
        "playlist_name": info.get("title"),
        "track_count": len(tracks),
        "tracks": tracks,
    }