CREATE TABLE t_task (
  id INTEGER PRIMARY KEY,
  brief TEXT,
  context_id INTEGER,
  detail TEXT,
  device TEXT,
  icon TEXT,
  icon_file TEXT,
  remind_id INTEGER,
  state TEXT,
  create_at TEXT,
  update_at TEXT
);
