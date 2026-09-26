-- Learner progress per learner code (see src/d1-store.ts). updated_at: ISO time of the last save.
CREATE TABLE IF NOT EXISTS learners (
  code TEXT PRIMARY KEY,
  progress TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS learners_updated_at ON learners (updated_at);
