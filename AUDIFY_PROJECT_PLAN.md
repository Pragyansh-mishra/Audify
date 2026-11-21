# AUDIFY --- Project Plan & Development Roadmap

**Project:** Audify\
**Tagline:** Your music. Your library. Your control.\
**Project type:** Open-source, local-first music management application\
**Initial platform:** Windows-first, cross-platform architecture where
practical\
**Interface:** Local web interface opened in a browser\
**Local address:** `http://127.0.0.1:<port>`\
**Distribution:** GitHub source repository initially; optional PyPI
package/installer after the MVP is stable

------------------------------------------------------------------------

## 1. Product Vision

Audify is a self-hosted music management application that runs on the
user's own computer. It aims to help users import supported music
playlists, view and organise track metadata, identify legitimate
downloadable audio sources, download audio when the source and user
permissions allow it, maintain a local music library, and listen to
locally stored music offline.

Audify is not intended to bypass DRM, paid subscriptions, access
controls, or platform restrictions. A playlist link may provide metadata
without providing rights or a permitted way to download the audio. The
application must clearly distinguish metadata import, source discovery,
and authorised downloading.

### Core principles

-   **Local-first:** User library, database, and downloaded files remain
    on the user's machine by default.
-   **Open source:** Source code, setup instructions, and contribution
    guidance are public.
-   **No mandatory account:** The MVP should not require an Audify cloud
    account.
-   **Modular:** Playlist providers, metadata services, download
    providers, and playback should be replaceable modules.
-   **Transparent:** Show where metadata came from and which source is
    selected for a download.
-   **Permission-aware:** Only download media the user is authorised to
    save.
-   **Understandable engineering:** Build incrementally and understand
    the code rather than generating a whole application blindly.

------------------------------------------------------------------------

## 2. MVP Scope

### Included in the first usable version

1.  Start Audify from a terminal command.
2.  Open a local browser interface.
3.  Accept a supported playlist or track URL.
4.  Validate the URL and identify the provider.
5.  Import available playlist/track metadata.
6.  Display tracks with title, artist, album, duration, and artwork when
    available.
7.  Save imported playlists and tracks to a local SQLite database.
8.  Show a local library view.
9.  Provide clear errors when a provider is unsupported, unavailable, or
    returns incomplete metadata.

### Later features --- not required for the first MVP

-   Authorised bulk audio downloading.
-   Source matching and user review of candidate matches.
-   Audio conversion and processing with FFmpeg.
-   Metadata editing and embedded artwork using Mutagen.
-   Folder organisation and duplicate detection.
-   Download queue with pause/retry/cancel.
-   Offline playback.
-   M3U playlist export/import.
-   ZIP export.
-   Windows installer and optional `pip`/PyPI distribution.
-   Linux and macOS support.

### Explicit non-goals

-   Bypassing DRM or subscription-only offline features.
-   Extracting audio from Spotify or other services where their terms or
    technical controls do not permit it.
-   Circumventing authentication, paywalls, rate limits, or access
    controls.
-   Hosting or redistributing copyrighted music.
-   Building a cloud streaming service.

------------------------------------------------------------------------

## 3. Proposed Technology Stack

  -----------------------------------------------------------------------
  Component               Initial choice          Responsibility
  ----------------------- ----------------------- -----------------------
  Language                Python                  Main application and
                                                  backend

  Local web server        Flask                   HTTP routes and API

  Frontend                HTML, CSS, JavaScript   Browser interface

  Database                SQLite                  Local playlists,
                                                  tracks, and library
                                                  records

  Audio metadata          Mutagen                 Read/write supported
                                                  audio tags and artwork

  Media processing        FFmpeg/FFprobe          Permitted audio
                                                  processing and format
                                                  conversion

  Source integration      Provider-specific       Metadata and authorised
                          adapters                source integrations

  Version control         Git and GitHub          Source history and
                                                  collaboration

  Testing                 pytest                  Unit and integration
                                                  tests
  -----------------------------------------------------------------------

**Architecture decision:** Start with Flask and plain
HTML/CSS/JavaScript to keep the first implementation small and
understandable. Introduce React only if the interface complexity
justifies the extra build tooling. Keep backend services independent of
the frontend so this can change later.

**Dependency policy:** Add dependencies only when a feature needs them.
Pin or constrain versions once the application is reproducible.

------------------------------------------------------------------------

## 4. High-Level Architecture

``` text
User
 |
 v
Browser UI (HTML / CSS / JavaScript)
 |
 | HTTP requests to localhost
 v
Flask application
 |
 +--> Routes / API layer
 |      +--> Playlist import routes
 |      +--> Library routes
 |      +--> Download routes (later)
 |
 +--> Services / business logic
 |      +--> URL validation and provider detection
 |      +--> Playlist import service
 |      +--> Metadata normalisation
 |      +--> Library service
 |      +--> Download orchestration (later)
 |
 +--> Provider adapters
 |      +--> Provider metadata adapters
 |      +--> Authorised download adapters (where supported)
 |
 +--> SQLite database
 |
 +--> Local media storage
        +--> downloads/
        +--> artwork/
        +--> playlists/
```

### Architectural boundaries

-   **Routes** receive HTTP requests, validate basic input, call a
    service, and return a response.
-   **Services** implement application rules and coordinate
    providers/database/storage.
-   **Providers** contain provider-specific integration code. One
    provider's behaviour should not leak throughout the application.
-   **Database layer** owns SQL and persistence details.
-   **Media layer** handles local audio files, tags, artwork, and
    processing.
-   **Frontend** displays data and sends requests; it should not contain
    provider or download business logic.

------------------------------------------------------------------------

## 5. Proposed Repository Structure

Create folders as they become necessary; do not create empty
abstractions just to match a diagram.

``` text
audify/
├── app.py
├── config/
│   └── settings.py
├── backend/
│   ├── routes/
│   │   ├── health.py
│   │   ├── playlists.py
│   │   └── library.py
│   ├── services/
│   │   ├── url_service.py
│   │   ├── playlist_service.py
│   │   └── library_service.py
│   ├── providers/
│   │   ├── base.py
│   │   └── ...
│   ├── database/
│   │   ├── db.py
│   │   └── schema.sql
│   └── media/
│       ├── metadata.py
│       └── ...
├── frontend/
│   ├── templates/
│   │   └── index.html
│   └── static/
│       ├── css/
│       │   └── style.css
│       ├── js/
│       │   └── app.js
│       └── images/
├── data/                  # Runtime data; ignored by Git
│   ├── audify.db
│   ├── downloads/
│   ├── artwork/
│   └── playlists/
├── tests/
├── requirements.txt
├── .gitignore
├── README.md
├── LICENSE
└── CONTRIBUTING.md         # Add when contribution workflow is ready
```

The exact structure may change as implementation reveals better
boundaries. Avoid unnecessary files and premature abstraction.

------------------------------------------------------------------------

## 6. Data Model --- Initial Draft

The database schema will be designed and reviewed before implementation.

### `playlists`

-   `id`
-   `provider`
-   `provider_playlist_id` (nullable)
-   `name`
-   `source_url`
-   `artwork_path` (nullable)
-   `created_at`
-   `updated_at`

### `tracks`

-   `id`
-   `provider`
-   `provider_track_id` (nullable)
-   `title`
-   `artist`
-   `album` (nullable)
-   `duration_seconds` (nullable)
-   `artwork_url` (nullable)
-   `source_url` (nullable)
-   `created_at`

### `playlist_tracks`

-   `playlist_id`
-   `track_id`
-   `position`

Use foreign keys and appropriate uniqueness rules. Keep provider IDs
nullable because not every source supplies stable IDs. Do not store
credentials or access tokens in plaintext in the database.

Later tables may include `download_jobs`, `local_files`, `artists`,
`albums`, and `settings`, but only add them when their use cases are
defined.

------------------------------------------------------------------------

## 7. API Plan

Initial local API endpoints:

  -------------------------------------------------------------------------
  Method                  Endpoint                  Purpose
  ----------------------- ------------------------- -----------------------
  `GET`                   `/api/health`             Confirm the local
                                                    server is running

  `POST`                  `/api/playlists/import`   Validate a URL and
                                                    import available
                                                    metadata

  `GET`                   `/api/playlists`          List imported playlists

  `GET`                   `/api/playlists/<id>`     Get one playlist and
                                                    its tracks

  `GET`                   `/api/library/tracks`     List tracks in the
                                                    local library

  `DELETE`                `/api/playlists/<id>`     Remove a playlist
                                                    record
  -------------------------------------------------------------------------

Later endpoints for downloads and playback will be designed separately,
including job status and safe file access.

All API responses should use a consistent JSON shape, for example:

``` json
{
  "success": true,
  "data": {},
  "error": null
}
```

For failures, return a useful error code/message without exposing
secrets, local credentials, or stack traces to the browser.

------------------------------------------------------------------------

## 8. Development Roadmap

### Phase 0 --- Planning and environment

-   Confirm repository is the user's own repository.
-   Check Python and Git versions.
-   Create and activate a virtual environment.
-   Add `.gitignore`.
-   Add the initial requirements file.
-   Agree on formatting, naming, and test conventions.

**Exit criteria:** A clean environment can install dependencies
reproducibly.

### Phase 1 --- Minimal local application

-   Create Flask application.
-   Add a health endpoint.
-   Serve the home page.
-   Bind to `127.0.0.1` by default, not all network interfaces.
-   Add a clear startup message with the local URL.

**Exit criteria:** Running the start command opens the Audify page
locally.

### Phase 2 --- Frontend shell

-   Create the Audify dashboard layout.
-   Add playlist URL input.
-   Add import/loading/error states.
-   Add a track-list component.
-   Keep the UI responsive and accessible.

**Exit criteria:** The page can submit a URL to the backend and display
a test response.

### Phase 3 --- URL detection and metadata import

-   Define supported URL patterns.
-   Detect provider and content type.
-   Implement provider adapter interface.
-   Import metadata for one provider first.
-   Normalise provider responses into Audify's track/playlist model.
-   Handle private, unavailable, empty, and malformed playlists.

**Exit criteria:** A supported public playlist imports and displays its
available metadata. Do not claim every provider or every track is
supported.

### Phase 4 --- SQLite persistence

-   Create database connection and schema.
-   Save playlists and tracks.
-   Preserve playlist track order.
-   Avoid duplicate records where stable IDs exist.
-   Load library data after server restart.

**Exit criteria:** Imported playlists remain available after restarting
Audify.

### Phase 5 --- Local library experience

-   Add library page/view.
-   Add search and basic sorting.
-   Display missing metadata clearly.
-   Add playlist removal.
-   Keep database records separate from local audio files.

**Exit criteria:** Users can browse and manage imported metadata
locally.

### Phase 6 --- Authorised audio acquisition

-   Define the legal and technical requirements for each source.
-   Support only sources and files the user is authorised to download.
-   Require review of ambiguous source matches.
-   Show the source URL and match details before download.
-   Add a download job model and progress/error states.
-   Do not bypass DRM, subscriptions, or platform access restrictions.

**Exit criteria:** A permitted test audio file can be downloaded or
saved and tracked reliably.

### Phase 7 --- Audio library processing

-   Detect FFmpeg/FFprobe availability.
-   Read/write metadata with Mutagen.
-   Embed artwork where supported.
-   Organise files safely.
-   Prevent accidental overwrite.
-   Detect duplicates.
-   Handle unsupported/corrupt files.

**Exit criteria:** A permitted local audio file is correctly tagged and
organised.

### Phase 8 --- Offline player

-   Play local files.
-   Show title, artist, artwork, and duration.
-   Add play/pause, seek, volume, and queue.
-   Support local playlists.
-   Handle missing files gracefully.

**Exit criteria:** Users can play their local library without relying on
a streaming service.

### Phase 9 --- Release and distribution

-   Add automated tests.
-   Test on a clean Windows environment.
-   Document installation and troubleshooting.
-   Add screenshots and a demo.
-   Review licence and third-party licences.
-   Publish a versioned GitHub release.
-   Consider a PyPI package or Windows installer only after setup is
    stable.

------------------------------------------------------------------------

## 9. Four-Hour First-Night Sprint

The first night is a prototype sprint, not a promise to finish the full
product.

  -----------------------------------------------------------------------
  Time                    Work                    Deliverable
  ----------------------- ----------------------- -----------------------
  0:00--0:20              Verify repository,      Clean project setup
                          Python, virtual         
                          environment             

  0:20--0:50              Flask app and health    Local server works
                          endpoint                

  0:50--1:30              Basic dashboard         Audify page in browser

  1:30--2:15              URL input and           Frontend-to-backend
                          validation              request works

  2:15--3:00              First metadata import   Track list displayed
                          path or realistic mock  
                          adapter                 

  3:00--3:35              SQLite persistence      Imported data survives
                                                  restart

  3:35--4:00              Test, document, commit  Demonstrable V0.1
                                                  foundation
  -----------------------------------------------------------------------

If a provider integration takes longer than expected, use a clearly
labelled test fixture to complete the UI/database flow. Do not fake a
successful real import.

### Four-hour sprint definition of done

-   `python app.py` starts Audify.
-   Browser opens the local interface.
-   Health endpoint responds.
-   User can submit a URL.
-   The app validates it and returns a clear result.
-   A test playlist can be saved and shown from SQLite.
-   README explains how to run the current prototype.

------------------------------------------------------------------------

## 10. Working Method --- How We Will Build

For each feature, follow this loop:

1.  **Requirement:** State what the feature must do and what it must not
    do.
2.  **Design:** Identify the files, functions, data, and API involved.
3.  **Explain:** Understand the concepts and design decisions before
    coding.
4.  **Implement:** Write a small amount of code.
5.  **Run:** Execute it locally.
6.  **Test:** Test normal, invalid, missing, and failure cases.
7.  **Review:** Explain the important lines and review the design.
8.  **Commit:** Make a meaningful Git commit.
9.  **Document:** Update this plan or README if behaviour changed.

### Learning rules

-   Do not paste large AI-generated codebases without understanding
    them.
-   Ask what each unfamiliar function, library, and abstraction does.
-   Prefer small functions and explicit names.
-   Do not add a dependency without knowing why it is needed.
-   Do not move to the next milestone while the current one is broken.
-   Keep a short development log of decisions, bugs, and lessons.

------------------------------------------------------------------------

## 11. Quality, Security, and Reliability

-   Bind the local server to `127.0.0.1` by default.
-   Do not expose Audify publicly without authentication and a security
    review.
-   Validate URLs and reject unsupported schemes.
-   Never pass user-provided URLs or filenames into shell commands
    unsafely.
-   Use subprocess argument lists rather than shell string
    concatenation.
-   Restrict file operations to Audify's configured data directory.
-   Set reasonable timeouts and limits for external requests.
-   Do not log access tokens or sensitive information.
-   Treat downloaded media and metadata as untrusted input.
-   Keep secrets out of Git; provide `.env.example` only if needed.
-   Test database migrations and backup behaviour before promising data
    portability.

------------------------------------------------------------------------

## 12. Testing Strategy

At minimum, test:

-   Valid and invalid URLs.
-   Unsupported providers.
-   Empty playlists.
-   Private or unavailable playlists.
-   Duplicate tracks.
-   Missing artist/album/artwork fields.
-   Network timeouts and provider errors.
-   Database persistence after restart.
-   Missing FFmpeg/FFprobe.
-   Invalid or corrupt audio files.
-   Unsafe filenames and path traversal attempts.
-   Download failure and retry behaviour when downloads are implemented.

Use unit tests for services and provider normalisation, and integration
tests for Flask routes and SQLite.

------------------------------------------------------------------------

## 13. Git and Contribution Workflow

Use small, descriptive commits, for example:

``` text
chore: initialise Flask application
feat: add local health endpoint
feat: create initial dashboard
feat: validate playlist URLs
feat: add SQLite playlist storage
test: cover playlist import validation
docs: add local setup instructions
```

Before each commit:

``` bash
git status
```

After tests pass:

``` bash
git add .
git commit -m "feat: describe the completed change"
git push
```

Do not commit virtual environments, local databases, downloaded music,
secrets, cache files, or temporary test output.

------------------------------------------------------------------------

## 14. Current Status and Decision Log

Update this section as the project progresses.

  Item                                    Status
  --------------------------------------- ----------------------------------------------
  Project name: Audify                    Decided
  Open-source GitHub repository           Created/cloned by project owner
  Local browser interface                 Decided
  Local-first architecture                Decided
  Initial backend: Python + Flask         Proposed
  Initial frontend: HTML/CSS/JavaScript   Proposed
  Initial database: SQLite                Proposed
  First release scope                     Metadata import and local library foundation
  Download support                        Later phase; permission-aware only
  Offline player                          Later phase
  PyPI distribution                       Consider after MVP
  Windows-first development               Proposed

### Decisions still to confirm

-   Exact supported playlist providers for the first release.
-   Final database schema and migration approach.
-   Whether to use a single Python process or a separate frontend
    development server.
-   Minimum supported Python version.
-   Final licence after reviewing dependencies and project goals.

------------------------------------------------------------------------

## 15. Immediate Next Steps

1.  Open the cloned `audify` repository in VS Code.
2.  Confirm the terminal is at the repository root.
3.  Check `git status` and `python --version`.
4.  Create and activate a virtual environment.
5.  Add `.gitignore`, `requirements.txt`, and this plan to the
    repository.
6.  Implement the Flask health endpoint.
7.  Run it locally and verify it in the browser.
8.  Commit the working foundation.

**First milestone:** A clean, understandable Audify application that
starts locally and serves its first page. Build the rest one tested
feature at a time.
