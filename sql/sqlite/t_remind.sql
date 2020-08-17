CREATE TABLE t_remind (
  id INTEGER PRIMARY KEY,
  duration INTEGER,
  repeat_id INTEGER,
  repeat_type TEXT,
  restricted_hours INTEGER,
  restricted_wdays INTEGER,
  task_id INTEGER,
  timestamp INTEGER,
  create_at TEXT,
  update_at TEXT
);
