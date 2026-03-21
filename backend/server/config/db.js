const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

// Create a connection pool to the MySQL database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'exportrack_ai',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
});

// Mock query function if DB is down
let isMockMode = false;
const mockData = {
  otps: new Map(),
  users: new Map(),
  shipments: new Map(),
  buyers: new Map(),
  suppliers: new Map(),
  teams: new Map(),
  team_members: new Map(),
  team_invites: new Map(),
  shipment_documents: new Map(),
  shipment_timeline: new Map(),
  shipment_comments: new Map(),
  notifications: new Map(),
  audit_logs: new Map(),
  trackings: new Map(),
  payments: new Map(),
  invoices: new Map(),
  packing_lists: new Map(),
  shipping_bills: new Map(),
  certificate_of_origins: new Map(),
  workspace_settings: new Map()
};

// Test the connection
pool.getConnection()
  .then(conn => {
    console.log('Successfully connected to MySQL database');
    conn.release();
  })
  .catch(err => {
    console.error('Error connecting to MySQL database:', err.message);
    console.warn('!!! BACKEND RUNNING IN MOCK MODE (In-memory storage) !!!');
    console.warn('Please ensure MySQL is running and database "exportrack_ai" is created for persistence.');
    isMockMode = true;
  });

// Wrap pool.query to support mock mode
const originalQuery = pool.query.bind(pool);
pool.query = async (sql, params) => {
  if (!isMockMode) {
    try {
      return await originalQuery(sql, params);
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.code === 'ER_BAD_DB_ERROR') {
        isMockMode = true;
        console.warn('Database connection lost. Switching to MOCK MODE.');
        return pool.query(sql, params); // Recursive call will use mock mode
      }
      throw err;
    }
  }

  // Basic mock implementation for common queries
  const sqlUpper = sql.toUpperCase();

  if (sqlUpper.includes('SELECT * FROM SHIPMENTS')) {
    return [[...mockData.shipments.values()]];
  }

  if (sqlUpper.includes('INSERT INTO SHIPMENTS')) {
    const shipment = params[0]; // Assuming first param is the whole object or ID
    mockData.shipments.set(params[0], { id: params[0], clientName: params[2], status: params[6] });
    return [{ affectedRows: 1 }];
  }

  if (sqlUpper.includes('SELECT LASTSENTAT FROM OTPS')) {
    const email = params[0];
    const otp = mockData.otps.get(email);
    return otp ? [[otp]] : [[]];
  }

  if (sqlUpper.includes('INSERT INTO OTPS')) {
    const [email, otp, expiresAt, lastSentAt] = params;
    mockData.otps.set(email, { email, otp, expiresAt, lastSentAt, verified: false, attempts: 0 });
    return [{ affectedRows: 1 }];
  }

  if (sqlUpper.includes('SELECT * FROM OTPS WHERE EMAIL = ?')) {
    const email = params[0];
    const otp = mockData.otps.get(email);
    return otp ? [[otp]] : [[]];
  }

  if (sqlUpper.includes('UPDATE OTPS SET VERIFIED = TRUE')) {
    const email = params[0];
    const otp = mockData.otps.get(email);
    if (otp) otp.verified = true;
    return [{ affectedRows: 1 }];
  }

  if (sqlUpper.includes('INSERT IGNORE INTO USERS')) {
    const [id, name, email] = params;
    mockData.users.set(email, { id, name, email });
    return [{ affectedRows: 1 }];
  }

  if (sqlUpper.includes('SELECT * FROM BUYERS')) {
    return [[...mockData.buyers.values()]];
  }

  if (sqlUpper.includes('INSERT INTO BUYERS')) {
    const buyer = params[0];
    mockData.buyers.set(buyer.id, buyer);
    return [{ affectedRows: 1 }];
  }

  if (sqlUpper.includes('SELECT * FROM SUPPLIERS')) {
    return [[...mockData.suppliers.values()]];
  }

  if (sqlUpper.includes('INSERT INTO SUPPLIERS')) {
    const supplier = params[0];
    mockData.suppliers.set(supplier.id, supplier);
    return [{ affectedRows: 1 }];
  }

  // --- Teams Mock ---
  if (sqlUpper.includes('SELECT * FROM TEAMS WHERE ID = ?')) {
    const team = mockData.teams.get(params[0]);
    return team ? [[team]] : [[]];
  }

  if (sqlUpper.includes('INSERT INTO TEAMS')) {
    const team = { id: params[0], name: params[1], ownerId: params[2], plan: params[3] };
    mockData.teams.set(team.id, team);
    return [{ affectedRows: 1 }];
  }

  if (sqlUpper.includes('SELECT * FROM TEAM_MEMBERS WHERE TEAMID = ?')) {
    const members = [...mockData.team_members.values()].filter(m => m.teamId === params[0]);
    return [members];
  }

  if (sqlUpper.includes('INSERT INTO TEAM_MEMBERS')) {
    const member = { teamId: params[0], userId: params[1], role: params[2] };
    mockData.team_members.set(`${params[0]}-${params[1]}`, member);
    return [{ affectedRows: 1 }];
  }

  // --- Documents Mock ---
  if (sqlUpper.includes('SELECT * FROM SHIPMENT_DOCUMENTS WHERE SHIPMENTID = ?')) {
    const docs = [...mockData.shipment_documents.values()].filter(d => d.shipmentId === params[0]);
    return [docs];
  }

  if (sqlUpper.includes('INSERT INTO SHIPMENT_DOCUMENTS')) {
    const doc = {
      id: params[0],
      shipmentId: params[1],
      userId: params[2],
      type: params[3],
      fileName: params[4],
      fileFormat: params[5],
      status: params[6] || 'Pending',
      uploadedBy: params[7],
      uploadedAt: new Date().toISOString()
    };
    mockData.shipment_documents.set(doc.id, doc);
    return [{ affectedRows: 1 }];
  }

  // --- Timeline Mock ---
  if (sqlUpper.includes('SELECT * FROM SHIPMENT_TIMELINE WHERE SHIPMENTID = ?')) {
    const timeline = [...mockData.shipment_timeline.values()]
      .filter(t => t.shipmentId === params[0])
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return [timeline];
  }

  if (sqlUpper.includes('INSERT INTO SHIPMENT_TIMELINE')) {
    const event = {
      id: params[0],
      shipmentId: params[1],
      status: params[2],
      note: params[3],
      timestamp: params[4] || new Date().toISOString()
    };
    mockData.shipment_timeline.set(event.id, event);
    return [{ affectedRows: 1 }];
  }

  // --- Comments Mock ---
  if (sqlUpper.includes('SELECT * FROM SHIPMENT_COMMENTS WHERE SHIPMENTID = ?')) {
    const comments = [...mockData.shipment_comments.values()]
      .filter(c => c.shipmentId === params[0])
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return [comments];
  }

  if (sqlUpper.includes('INSERT INTO SHIPMENT_COMMENTS')) {
    const comment = {
      id: params[0],
      shipmentId: params[1],
      author: params[2],
      role: params[3],
      message: params[4],
      createdAt: params[5] || new Date().toISOString(),
      internal: params[6] || 0
    };
    mockData.shipment_comments.set(comment.id, comment);
    return [{ affectedRows: 1 }];
  }

  // --- Notifications Mock ---
  if (sqlUpper.includes('SELECT * FROM NOTIFICATIONS WHERE USERID = ?')) {
    const notifications = [...mockData.notifications.values()]
      .filter(n => n.userId === params[0])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return [notifications];
  }

  if (sqlUpper.includes('UPDATE NOTIFICATIONS SET ISREAD = 1 WHERE ID = ?')) {
    const notification = mockData.notifications.get(params[0]);
    if (notification) notification.isRead = 1;
    return [{ affectedRows: 1 }];
  }

  // --- Audit Logs Mock ---
  if (sqlUpper.includes('SELECT * FROM AUDIT_LOGS')) {
    const logs = [...mockData.audit_logs.values()].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return [logs];
  }

  if (sqlUpper.includes('INSERT INTO AUDIT_LOGS')) {
    const log = params[0];
    mockData.audit_logs.set(log.id, log);
    return [{ affectedRows: 1 }];
  }

  if (sqlUpper.includes('UPDATE USERS SET')) {
    return [{ affectedRows: 1 }]; // User update mock
  }

  // --- Trackings Mock ---
  if (sqlUpper.includes('SELECT * FROM TRACKINGS')) {
    return [[...mockData.trackings.values()]];
  }

  if (sqlUpper.includes('INSERT INTO TRACKINGS')) {
    const tracking = params[0];
    mockData.trackings.set(tracking.id, tracking);
    return [{ affectedRows: 1 }];
  }

  if (sqlUpper.includes('DELETE FROM TRACKINGS')) {
    mockData.trackings.delete(params[0]);
    return [{ affectedRows: 1 }];
  }

  // --- Invites Mock ---
  if (sqlUpper.includes('SELECT * FROM TEAM_INVITES WHERE TOKEN = ?')) {
    const invite = [...mockData.team_invites.values()].find(i => i.token === params[0]);
    return invite ? [[invite]] : [[]];
  }

  if (sqlUpper.includes('INSERT INTO TEAM_INVITES')) {
    const invite = { id: params[0], teamId: params[1], email: params[2], role: params[3], token: params[4], expiresAt: params[5] };
    mockData.team_invites.set(invite.id, invite);
    return [{ affectedRows: 1 }];
  }

  if (sqlUpper.includes('SELECT * FROM INVOICES')) {
    return [[...mockData.invoices.values()]];
  }
  if (sqlUpper.includes('INSERT INTO INVOICES')) {
    mockData.invoices.set(params[0], { id: params[0], ...params });
    return [{ affectedRows: 1 }];
  }
  if (sqlUpper.includes('DELETE FROM INVOICES WHERE ID = ?')) {
    mockData.invoices.delete(params[0]);
    return [{ affectedRows: 1 }];
  }

  if (sqlUpper.includes('SELECT * FROM PACKING_LISTS')) {
    return [[...mockData.packing_lists.values()]];
  }
  if (sqlUpper.includes('INSERT INTO PACKING_LISTS')) {
    mockData.packing_lists.set(params[0], { id: params[0], ...params });
    return [{ affectedRows: 1 }];
  }
  if (sqlUpper.includes('DELETE FROM PACKING_LISTS WHERE ID = ?')) {
    mockData.packing_lists.delete(params[0]);
    return [{ affectedRows: 1 }];
  }

  if (sqlUpper.includes('SELECT * FROM SHIPPING_BILLS')) {
    return [[...mockData.shipping_bills.values()]];
  }
  if (sqlUpper.includes('INSERT INTO SHIPPING_BILLS')) {
    mockData.shipping_bills.set(params[0], { id: params[0], ...params });
    return [{ affectedRows: 1 }];
  }
  if (sqlUpper.includes('DELETE FROM SHIPPING_BILLS WHERE ID = ?')) {
    mockData.shipping_bills.delete(params[0]);
    return [{ affectedRows: 1 }];
  }

  if (sqlUpper.includes('SELECT * FROM CERTIFICATE_OF_ORIGINS')) {
    return [[...mockData.certificate_of_origins.values()]];
  }
  if (sqlUpper.includes('INSERT INTO CERTIFICATE_OF_ORIGINS')) {
    mockData.certificate_of_origins.set(params[0], { id: params[0], ...params });
    return [{ affectedRows: 1 }];
  }
  if (sqlUpper.includes('DELETE FROM CERTIFICATE_OF_ORIGINS WHERE ID = ?')) {
    mockData.certificate_of_origins.delete(params[0]);
    return [{ affectedRows: 1 }];
  }

  if (sqlUpper.includes('SELECT * FROM PAYMENTS')) {
    return [[...mockData.payments.values()]];
  }
  if (sqlUpper.includes('INSERT INTO PAYMENTS')) {
    mockData.payments.set(params[0], { id: params[0], ...params });
    return [{ affectedRows: 1 }];
  }
  if (sqlUpper.includes('DELETE FROM PAYMENTS WHERE ID = ?')) {
    mockData.payments.delete(params[0]);
    return [{ affectedRows: 1 }];
  }

  if (sqlUpper.includes('SELECT * FROM WORKSPACE_SETTINGS')) {
    const settings = mockData.workspace_settings.get('default');
    return [[settings || { id: 'default', name: 'ExporTrack Pro Workspace', tagline: 'Modern Logistics Hub' }]];
  }
  if (sqlUpper.includes('INSERT INTO WORKSPACE_SETTINGS')) {
    mockData.workspace_settings.set('default', { id: 'default', name: params[0], tagline: params[1], timezone: params[2], language: params[3] });
    return [{ affectedRows: 1 }];
  }

  return [[]]; // Default mock response
};

module.exports = pool;
