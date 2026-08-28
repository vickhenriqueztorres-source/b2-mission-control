-- Schema SQLite WAL para B2 Mission Control

CREATE TABLE IF NOT EXISTS productions (
    production_id TEXT PRIMARY KEY,
    project_name TEXT NOT NULL DEFAULT 'O Outro Lado',
    status TEXT NOT NULL,
    current_step INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_log TEXT,
    metadata TEXT -- JSON string
);

CREATE TABLE IF NOT EXISTS scenes (
    scene_id TEXT PRIMARY KEY,
    production_id TEXT NOT NULL,
    shot_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    motion_prompt TEXT,
    start_frame_path TEXT,
    output_video_path TEXT,
    FOREIGN KEY (production_id) REFERENCES productions(production_id)
);

CREATE TABLE IF NOT EXISTS agent_events (
    event_id TEXT PRIMARY KEY,
    production_id TEXT NOT NULL,
    source TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    step_index INTEGER,
    event_type TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payload TEXT, -- JSON string
    FOREIGN KEY (production_id) REFERENCES productions(production_id)
);

CREATE TABLE IF NOT EXISTS artifacts (
    artifact_id TEXT PRIMARY KEY,
    production_id TEXT NOT NULL,
    artifact_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    sha256 TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (production_id) REFERENCES productions(production_id)
);

CREATE TABLE IF NOT EXISTS operational_control_state (
    singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
    queue_paused INTEGER NOT NULL DEFAULT 0,
    emergency_stopped INTEGER NOT NULL DEFAULT 0,
    emergency_reason TEXT,
    requested_by TEXT,
    activated_at TEXT,
    released_at TEXT,
    updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO operational_control_state (
    singleton,
    queue_paused,
    emergency_stopped,
    updated_at
) VALUES (1, 0, 0, CURRENT_TIMESTAMP);
