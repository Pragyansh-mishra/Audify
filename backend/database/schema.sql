CREATE TABLE IF NOT EXISTS songs (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    title TEXT NOT NULL,

    artist TEXT,

    filename TEXT NOT NULL,

    filepath TEXT NOT NULL UNIQUE,

    duration REAL,

    thumbnail TEXT,

    source_url TEXT,

    file_size INTEGER DEFAULT 0,

    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);