-- SQL Schema for ExporTrack-AI
-- Import this into your phpMyAdmin (http://localhost/phpmyadmin)

CREATE DATABASE IF NOT EXISTS exportrack_ai;
USE exportrack_ai;

-- 1. Users Table (Foundation)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'Staff',
  authProvider VARCHAR(20) DEFAULT 'email',
  profilePicture TEXT,
  region VARCHAR(50),
  userMode ENUM('demo', 'real') DEFAULT 'real',
  passwordHash VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Teams Table
CREATE TABLE IF NOT EXISTS teams (
  id VARCHAR(50) PRIMARY KEY,
  ownerId VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id VARCHAR(50) PRIMARY KEY,
  teamId VARCHAR(50) NOT NULL,
  userId VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  permission ENUM('view_only', 'edit', 'admin') DEFAULT 'view_only',
  joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (teamId, userId)
);

-- 4. Team Invites Table
CREATE TABLE IF NOT EXISTS team_invites (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  workspaceId VARCHAR(50),
  token VARCHAR(255) UNIQUE NOT NULL,
  status ENUM('Pending', 'Accepted', 'Expired') DEFAULT 'Pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  expiresAt DATETIME
);

-- 5. Shipments Table
CREATE TABLE IF NOT EXISTS shipments (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(100),
  clientName VARCHAR(100) NOT NULL,
  destinationCountry VARCHAR(100),
  shipmentDate DATE,
  containerNumber VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Shipment Created',
  isDelayed TINYINT(1) DEFAULT 0,
  deadline DATE,
  priority ENUM('High', 'Medium', 'Low') NOT NULL DEFAULT 'Medium',
  assignedTo VARCHAR(100),
  trackingId VARCHAR(100),
  driverName VARCHAR(100),
  driverPhone VARCHAR(20),
  vehicleNumber VARCHAR(50),
  estimatedDeliveryTime DATETIME,
  bookingDate DATE,
  departureDate DATE,
  deliveryDate DATE,
  customsDocumentUploaded TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);

-- 6. Invoices Table (References Shipments)
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(50) PRIMARY KEY,
  orgId VARCHAR(50),
  shipmentId VARCHAR(50),
  invoiceNumber VARCHAR(50),
  date DATE,
  buyerName VARCHAR(100),
  buyerAddress TEXT,
  consigneeName VARCHAR(100),
  consigneeAddress TEXT,
  items JSON,
  totalAmount DECIMAL(15, 2),
  currency VARCHAR(10),
  paymentTerms TEXT,
  bankDetails JSON,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'Draft',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shipmentId) REFERENCES shipments(id) ON DELETE SET NULL
);

-- 7. Shipment Timeline Table (References Shipments)
CREATE TABLE IF NOT EXISTS shipment_timeline (
  id VARCHAR(50) PRIMARY KEY,
  shipmentId VARCHAR(50) NOT NULL,
  status VARCHAR(100) NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  note TEXT,
  FOREIGN KEY (shipmentId) REFERENCES shipments(id) ON DELETE CASCADE
);

-- 8. Shipment Comments Table (References Shipments)
CREATE TABLE IF NOT EXISTS shipment_comments (
  id VARCHAR(50) PRIMARY KEY,
  shipmentId VARCHAR(50) NOT NULL,
  author VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  internal TINYINT(1) DEFAULT 0,
  FOREIGN KEY (shipmentId) REFERENCES shipments(id) ON DELETE CASCADE
);

-- 9. OTP Storage Table
CREATE TABLE IF NOT EXISTS otps (
  email VARCHAR(100) PRIMARY KEY,
  otp VARCHAR(10) NOT NULL,
  expiresAt BIGINT NOT NULL,
  attempts INT DEFAULT 0,
  verified TINYINT(1) DEFAULT 0,
  lastSentAt BIGINT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
