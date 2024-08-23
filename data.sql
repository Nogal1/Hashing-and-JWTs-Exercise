DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    join_at timestamp without time zone NOT NULL,
    last_login_at timestamp with time zone
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    from_username text NOT NULL REFERENCES users,
    to_username text NOT NULL REFERENCES users,
    body text NOT NULL,
    sent_at timestamp with time zone NOT NULL,
    read_at timestamp with time zone
);


-- Insert sample users
INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at) VALUES
('john_doe', 'password123', 'John', 'Doe', '+1234567890', NOW(), NOW()),
('jane_smith', 'password456', 'Jane', 'Smith', '+1234567891', NOW(), NOW()),
('alice_jones', 'password789', 'Alice', 'Jones', '+1234567892', NOW(), NOW()),
('bob_brown', 'password012', 'Bob', 'Brown', '+1234567893', NOW(), NOW());

-- Insert sample messages
INSERT INTO messages (from_username, to_username, body, sent_at, read_at) VALUES
('john_doe', 'jane_smith', 'Hey Jane, how are you?', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
('jane_smith', 'john_doe', 'I am good, John. How about you?', NOW() - INTERVAL '1 day', NULL),
('alice_jones', 'john_doe', 'John, we need to discuss the project.', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
('bob_brown', 'alice_jones', 'Alice, can you review this document?', NOW() - INTERVAL '4 hours', NULL),
('jane_smith', 'bob_brown', 'Hi Bob, when is the meeting?', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '3 hours'),
('john_doe', 'alice_jones', 'Sure, let’s meet tomorrow.', NOW() - INTERVAL '1 hour', NULL);
