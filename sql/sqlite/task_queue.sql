CREATE TABLE task_queue (
  create_at INTEGER,
  id INTEGER PRIMARY KEY,
  next_trigger_time INTEGER,
  task_id INTEGER,
  update_at INTEGER
);
