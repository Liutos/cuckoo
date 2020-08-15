CREATE TABLE t_context (
  id INTEGER PRIMARY KEY,
  name TEXT,
  create_at TEXT,
  update_at TEXT
);

CREATE TABLE t_repeat (
  id INTEGER PRIMARY KEY,
  type TEXT,
  create_at TEXT,
  update_at TEXT
);

CREATE TABLE t_remind_log (
  id INTEGER PRIMARY KEY,
  plan_alarm_at INTEGER,
  real_alarm_at INTEGER,
  task_id INTEGER,
  create_at TEXT,
  update_at TEXT
);

CREATE TABLE t_remind (
  id INTEGER PRIMARY KEY,
  duration INTEGER,
  repeat_id INTEGER,
  repeat_type TEXT,
  restricted_hours INTEGER,
  timestamp INTEGER,
  create_at TEXT,
  update_at TEXT
);

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

CREATE TABLE task_queue (
  create_at INTEGER,
  id INTEGER PRIMARY KEY,
  next_trigger_time INTEGER,
  task_id INTEGER,
  update_at INTEGER
);
