-- IndexNow (src/indexnow.ts): the pages last reported to search engines, as JSON {url: lastmod}. One row.
CREATE TABLE IF NOT EXISTS indexnow (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  pages TEXT NOT NULL
);
