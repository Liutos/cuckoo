CREATE TABLE t_remind_log (
  id INTEGER PRIMARY KEY,
  plan_alarm_at INTEGER,
  real_alarm_at INTEGER,
  task_id INTEGER,
  create_at TEXT,
  update_at TEXT
);
