CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(60),
    last_name VARCHAR(100) NOT NULL,
    initials VARCHAR(30),
    email VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(8) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE users_addresses (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(7) NOT NULL CHECK (address_type IN ('HOME', 'INVOICE', 'POST', 'WORK')),
    valid_from TIMESTAMP NOT NULL,
    post_code VARCHAR(6) NOT NULL,
    city VARCHAR(60) NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    street VARCHAR(100) NOT NULL,
    building_number VARCHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, address_type, valid_from)
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_users_addresses_updated_at
BEFORE UPDATE ON users_addresses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

INSERT INTO users (first_name, last_name, initials, email, status)
VALUES
    ('John', 'Doe', 'JD', 'john.doe@example.com', 'ACTIVE'),
    ('Jane', 'Smith', 'JS', 'jane.smith@example.com', 'ACTIVE'),
    ('Alice', 'Johnson', 'AJ', 'alice.johnson@example.com', 'ACTIVE'),
    ('Bob', 'Brown', 'BB', 'bob.brown@example.com', 'ACTIVE'),
    ('Charlie', 'Davis', 'CD', 'charlie.davis@example.com', 'ACTIVE'),
    ('Emily', 'Clark', 'EC', 'emily.clark@example.com', 'ACTIVE'),
    ('Frank', 'Miller', 'FM', 'frank.miller@example.com', 'ACTIVE'),
    ('Grace', 'Wilson', 'GW', 'grace.wilson@example.com', 'ACTIVE'),
    ('Henry', 'Moore', 'HM', 'henry.moore@example.com', 'ACTIVE'),
    ('Ivy', 'Taylor', 'IT', 'ivy.taylor@example.com', 'ACTIVE'),
    ('Jack', 'Anderson', 'JA', 'jack.anderson@example.com', 'ACTIVE'),
    ('Karen', 'Thomas', 'KT', 'karen.thomas@example.com', 'ACTIVE'),
    ('Leo', 'Martinez', 'LM', 'leo.martinez@example.com', 'ACTIVE'),
    ('Mia', 'Harris', 'MH', 'mia.harris@example.com', 'ACTIVE'),
    ('Nathan', 'White', 'NW', 'nathan.white@example.com', 'ACTIVE'),
    ('Olivia', 'Lopez', 'OL', 'olivia.lopez@example.com', 'ACTIVE'),
    ('Peter', 'Young', 'PY', 'peter.young@example.com', 'ACTIVE'),
    ('Quinn', 'Hall', 'QH', 'quinn.hall@example.com', 'ACTIVE'),
    ('Ryan', 'Allen', 'RA', 'ryan.allen@example.com', 'ACTIVE'),
    ('Sophia', 'King', 'SK', 'sophia.king@example.com', 'ACTIVE');

INSERT INTO users_addresses (user_id, address_type, valid_from, post_code, city, country_code, street, building_number)
SELECT id, 'HOME', CURRENT_TIMESTAMP, 
    '123456', 'Sample City', 'USA', 'Main Street', '10A'
FROM users;
