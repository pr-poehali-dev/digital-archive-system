CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  steam_id VARCHAR(64) UNIQUE NOT NULL,
  username VARCHAR(255),
  avatar_url TEXT,
  profile_url TEXT,
  plan VARCHAR(32) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(128) PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
