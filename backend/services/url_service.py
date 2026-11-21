from urllib.parse import urlparse


SUPPORTED_DOMAINS = [
    "youtube.com",
    "www.youtube.com",
    "music.youtube.com",
    "youtu.be",
]


def validate_playlist_url(url):

    if not url:
        return False

    try:
        parsed_url = urlparse(url.strip())

        if parsed_url.scheme not in ("http", "https"):
            return False

        if parsed_url.hostname not in SUPPORTED_DOMAINS:
            return False

        return True

    except ValueError:
        return False