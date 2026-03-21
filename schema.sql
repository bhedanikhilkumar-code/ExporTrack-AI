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

-- 18. Workspace Settings Table
CREATE TABLE IF NOT EXISTS workspace_settings (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  tagline VARCHAR(200),
  logo VARCHAR(255),
  timezone VARCHAR(50),
  language VARCHAR(20),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 15. Packing Lists Table
CREATE TABLE IF NOT EXISTS packing_lists (
  id VARCHAR(50) PRIMARY KEY,
  plNumber VARCHAR(50) NOT NULL,
  plDate DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Draft',
  linkedInvoiceId VARCHAR(50),
  exporterDetails JSON,
  buyerDetails JSON,
  shipmentDetails JSON,
  packages JSON,
  totalPackages INT,
  totalNetWeight DECIMAL(15, 2),
  totalGrossWeight DECIMAL(15, 2),
  totalVolume DECIMAL(15, 4),
  linkedDocuments JSON,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 16. Shipping Bills Table
CREATE TABLE IF NOT EXISTS shipping_bills (
  id VARCHAR(50) PRIMARY KEY,
  sbNumber VARCHAR(50) NOT NULL,
  sbDate DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Draft',
  customsStation VARCHAR(100),
  portCode VARCHAR(20),
  exporterDetails JSON,
  consigneeDetails JSON,
  exportScheme VARCHAR(50),
  shipmentDetails JSON,
  items JSON,
  totalFOBValueINR DECIMAL(15, 2),
  totalFOBValueForeign DECIMAL(15, 2),
  currency VARCHAR(10),
  exchangeRate DECIMAL(15, 4),
  drawbackDetails JSON,
  linkedDocuments JSON,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 17. Certificate of Origins Table
CREATE TABLE IF NOT EXISTS certificate_of_origins (
  id VARCHAR(50) PRIMARY KEY,
  cooNumber VARCHAR(50) NOT NULL,
  cooDate DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Draft',
  cooType VARCHAR(50),
  exporterDetails JSON,
  consigneeDetails JSON,
  transportDetails JSON,
  items JSON,
  declarationText TEXT,
  issuingAuthority VARCHAR(100),
  linkedDocuments JSON,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 14. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(50) PRIMARY KEY,
  referenceNo VARCHAR(100) NOT NULL,
  buyerId VARCHAR(50) NOT NULL,
  invoiceId VARCHAR(50),
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  date VARCHAR(20) NOT NULL,
  method VARCHAR(50),
  status VARCHAR(20),
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 13. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(100),
  shipmentId VARCHAR(50),
  type VARCHAR(50) NOT NULL,
  severity ENUM('High', 'Medium', 'Low') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  dueDate DATE,
  isRead TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shipmentId) REFERENCES shipments(id) ON DELETE CASCADE
);

-- 12. Shipment Documents Table
CREATE TABLE IF NOT EXISTS shipment_documents (
  id VARCHAR(50) PRIMARY KEY,
  shipmentId VARCHAR(50) NOT NULL,
  userId VARCHAR(100),
  type VARCHAR(50) NOT NULL,
  fileName VARCHAR(255) NOT NULL,
  fileFormat ENUM('PDF', 'JPG', 'PNG') NOT NULL,
  status ENUM('Pending', 'Verified', 'Missing', 'Rejected') DEFAULT 'Pending',
  uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  uploadedBy VARCHAR(100),
  FOREIGN KEY (shipmentId) REFERENCES shipments(id) ON DELETE CASCADE
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

-- 10. Buyers Table
CREATE TABLE IF NOT EXISTS buyers (
  id VARCHAR(50) PRIMARY KEY,
  companyName VARCHAR(100) NOT NULL,
  contactPerson VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  currency VARCHAR(10) DEFAULT 'USD',
  paymentTerms TEXT,
  tags JSON,
  totalOrders INT DEFAULT 0,
  totalValue DECIMAL(15, 2) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 11. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(50) PRIMARY KEY,
  companyName VARCHAR(100) NOT NULL,
  contactPerson VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  category VARCHAR(50),
  rating DECIMAL(3, 2) DEFAULT 0,
  tags JSON,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
