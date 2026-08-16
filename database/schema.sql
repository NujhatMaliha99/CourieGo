-- Courier Delivery Management System database schema
CREATE DATABASE IF NOT EXISTS courier_management;
USE courier_management;

CREATE TABLE roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(20),
  address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE login (
  login_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  last_login DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE receivers (
  receiver_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(120),
  address VARCHAR(255) NOT NULL
);

CREATE TABLE parcels (
  parcel_id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  tracking_id VARCHAR(50) NOT NULL UNIQUE,
  parcel_type VARCHAR(50) NOT NULL,
  weight DECIMAL(10,2) NOT NULL,
  charge DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(user_id),
  FOREIGN KEY (receiver_id) REFERENCES receivers(receiver_id),
  CHECK (weight > 0),
  CHECK (charge >= 0)
);

CREATE TABLE payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  parcel_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(30),
  payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid',
  paid_at DATETIME NULL,
  FOREIGN KEY (parcel_id) REFERENCES parcels(parcel_id) ON DELETE CASCADE
);

CREATE TABLE delivery_agents (
  agent_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  vehicle_number VARCHAR(50),
  availability_status VARCHAR(30) NOT NULL DEFAULT 'available',
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE assignments (
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,
  parcel_id INT NOT NULL,
  agent_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  FOREIGN KEY (parcel_id) REFERENCES parcels(parcel_id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES delivery_agents(agent_id)
);

CREATE TABLE tracking_status (
  tracking_status_id INT AUTO_INCREMENT PRIMARY KEY,
  status_name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255)
);

CREATE TABLE delivery_history (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  parcel_id INT NOT NULL,
  tracking_status_id INT NOT NULL,
  location VARCHAR(150),
  remarks VARCHAR(255),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parcel_id) REFERENCES parcels(parcel_id) ON DELETE CASCADE,
  FOREIGN KEY (tracking_status_id) REFERENCES tracking_status(tracking_status_id)
);

-- Minimal sample records make parcel API testing possible immediately.
INSERT IGNORE INTO roles (role_id, role_name) VALUES
  (1, 'customer'),
  (2, 'delivery_agent'),
  (3, 'admin');

INSERT IGNORE INTO users (user_id, role_id, full_name, email, phone, address) VALUES
  (1, 1, 'Sample Sender', 'sender@example.com', '01700000000', 'Dhaka');

INSERT IGNORE INTO receivers (receiver_id, full_name, phone, email, address) VALUES
  (1, 'Sample Receiver', '01800000000', 'receiver@example.com', 'Chattogram');

INSERT IGNORE INTO tracking_status (tracking_status_id, status_name, description) VALUES
  (1, 'pending', 'Parcel information has been created'),
  (2, 'picked_up', 'Parcel has been collected'),
  (3, 'in_transit', 'Parcel is moving between locations'),
  (4, 'out_for_delivery', 'Parcel is with the delivery agent'),
  (5, 'delivered', 'Parcel was delivered'),
  (6, 'cancelled', 'Parcel delivery was cancelled');
