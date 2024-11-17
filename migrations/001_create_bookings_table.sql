CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  booking_time TEXT NOT NULL,
  booking_date TEXT NOT NULL
);

CREATE INDEX idx_client_id ON bookings (client_id);
