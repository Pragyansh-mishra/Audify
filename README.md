# Audify

Audify is a local-first audio downloading application with a
vinyl-inspired interface. It lets you import supported song or playlist
links, download audio to your computer, and manage your download
history.

> **Version:** V2\
> **Status:** Local development version. The app runs on your own
> computer; it is not currently hosted as a public web service.

## Features

-   Import a supported song URL or playlist URL.
-   Preview playlist tracks and choose which tracks to download.
-   Download audio as MP3.
-   View downloaded tracks in **Download History**.
-   Download a track again from your history.
-   Delete a history entry and its associated local audio file.
-   Store download records locally using SQLite.
-   Browse the visual album-cover collection.

## Requirements

Before installing Audify, make sure you have:

-   Windows 10 or Windows 11
-   Python 3.10 or newer (Python 3.12 is recommended)
-   FFmpeg
-   Git (optional, if cloning the repository)

Audify uses Flask for the local web server, yt-dlp to retrieve supported
audio sources, and SQLite for its local download-history database.

## Installation

### 1. Download the project

Clone the repository:

``` powershell
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Audify
```

Alternatively, download the repository as a ZIP file from GitHub and
extract it. Open the extracted `Audify` folder in VS Code.

### 2. Create a virtual environment

Open a terminal in the project folder and run:

``` powershell
python -m venv venv
```

Activate it:

``` powershell
.\venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, run this command for the current
terminal session and try activation again:

``` powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

### 3. Install Python dependencies

With the virtual environment activated, run:

``` powershell
python -m pip install --upgrade pip
pip install Flask python-dotenv yt-dlp
```

### 4. Install FFmpeg

Audify uses FFmpeg to convert downloaded audio to MP3.

1.  Download an FFmpeg Windows build from the official FFmpeg website:
    https://ffmpeg.org/download.html
2.  Extract the downloaded archive.
3.  Locate the folder containing `ffmpeg.exe`.
4.  Make sure the FFmpeg path configured in
    `backend/services/library_service.py` points to that folder.

The current V2 code uses this path:

``` python
"ffmpeg_location": r"C:\ffmpeg\ffmpeg-9.1-essentials_build\bin",
```

If FFmpeg is installed somewhere else, replace that value with the path
to your own FFmpeg `bin` folder. The folder should contain `ffmpeg.exe`.

## Run Audify

From the project root, with the virtual environment activated, run:

``` powershell
python app.py
```

When Flask starts successfully, open this address in your browser:

``` text
http://127.0.0.1:5000
```

Keep the terminal running while using Audify. To stop the server, press
`Ctrl + C` in that terminal.

## How to use Audify

### 1. Import a song or playlist

1.  Open Audify in your browser.
2.  Paste a supported song URL or playlist URL into the import field.
3.  Choose the available audio format/quality option.
4.  Click **Import**.
5.  For a playlist, review the track list and select the tracks you
    want.

### 2. Download audio

Start the download for the selected track or tracks using the download
controls. Keep Audify running until the downloads finish.

Downloaded audio files are saved locally in:

``` text
data/downloads/
```

### 3. View Download History

1.  Open **Download History** from the navigation bar.
2.  Your saved download records are displayed there.
3.  Use the search field, if available, to find a track.

The history is stored in the local SQLite database:

``` text
data/audify.db
```

### 4. Download a track again

Find the track in Download History and click its **Download** button.
Your browser will download the existing audio file again.

### 5. Delete a track

Use the **Delete** button on a history item and confirm the action. In
the current V2 implementation, deleting a track removes its database
record and its associated local audio file. Make sure you no longer need
the file before deleting it.

## Project data

Audify creates and uses a local `data` directory:

``` text
data/
├── audify.db       # SQLite download-history database
└── downloads/      # Downloaded audio files
```

Keep this folder if you want to preserve your download history and
downloaded files. Deleting it removes that local data.

## Troubleshooting

**`python` is not recognized**\
Install Python and ensure it is added to your system PATH. Reopen your
terminal after installation.

**The virtual environment does not activate**\
Make sure you are in the Audify project root. In PowerShell, use:

``` powershell
.\venv\Scripts\Activate.ps1
```

**FFmpeg not found / MP3 conversion fails**\
Check that FFmpeg is installed and that `ffmpeg_location` in
`backend/services/library_service.py` points to the correct `bin` folder
containing `ffmpeg.exe`.

**The page does not open**\
Check that `python app.py` is still running and that Flask did not print
an error. Then visit `http://127.0.0.1:5000`.

**A download fails**\
Check your internet connection and confirm that the source URL is
supported and accessible. Source websites may change their systems, so
keeping yt-dlp updated can help:

``` powershell
pip install --upgrade yt-dlp
```

## Important usage note

Only download audio that you own or are legally permitted to save.
Respect copyright, the source platform's terms, and applicable laws.
Audify does not provide DRM circumvention.

## Current limitations

-   V2 is designed to run locally on the computer where it is installed.
-   Downloaded files are stored on that computer, not automatically on
    another device.
-   A hosted/mobile version, cloud storage, and an Android app are not
    part of V2.

## Built with

-   Python
-   Flask
-   yt-dlp
-   SQLite
-   HTML, CSS, and JavaScript
-   FFmpeg

------------------------------------------------------------------------

**Audify V2 --- Built for the love of music.**
