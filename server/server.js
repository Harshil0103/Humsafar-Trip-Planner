require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { getDb } = require('./db');

const authRoutes = require('./routes/authRoutes');
const destinationsRoutes = require('./routes/destinationsRoutes');
const tripsRoutes = require('./routes/tripsRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationsRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Humsafar Trip Planner REST API',
    database: 'SQLite Connected',
    uptime: process.uptime()
  });
});

// Root & /api route — Dedicated Backend API Server Dashboard
app.get(['/', '/api'], (req, res) => {
  // If JSON is explicitly requested, return API metadata
  if (req.headers.accept && req.headers.accept.includes('application/json') && !req.headers.accept.includes('text/html')) {
    return res.json({
      service: 'Humsafar Backend REST API',
      status: 'online',
      version: '1.0.0',
      database: 'SQLite (Connected)',
      frontendUrl: process.env.CLIENT_URL || 'http://localhost:5173',
      endpoints: {
        health: '/api/health',
        destinations: '/api/destinations',
        auth: '/api/auth',
        trips: '/api/trips',
        admin: '/api/admin'
      }
    });
  }

  // HTML Dashboard for Browser viewing
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Humsafar Backend API Server</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234F46E5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><polygon points='16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76'/></svg>">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;800&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background: #0b0f19;
      color: #f8fafc;
      margin: 0;
      padding: 2.5rem 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .container {
      max-width: 720px;
      width: 100%;
      background: #131b2e;
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.8rem;
      margin: 0 0 0.25rem 0;
      color: #ffffff;
    }
    .badge-status {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 0.4rem 0.9rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .badge-status::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      color: white;
      text-decoration: none;
      font-weight: 600;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .btn:hover {
      background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
      transform: translateY(-1px);
    }
    .section-title {
      font-family: 'Outfit', sans-serif;
      font-size: 0.95rem;
      margin: 1.5rem 0 0.85rem 0;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 700;
    }
    .endpoint-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .endpoint-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #0b0f19;
      border: 1px solid #1e293b;
      padding: 0.85rem 1rem;
      border-radius: 10px;
      font-size: 0.9rem;
      transition: border-color 0.2s;
    }
    .endpoint-item:hover {
      border-color: #334155;
    }
    .method-get {
      background: rgba(14, 165, 233, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(14, 165, 233, 0.3);
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      font-weight: 700;
      font-size: 0.75rem;
    }
    .method-post {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      font-weight: 700;
      font-size: 0.75rem;
    }
    .endpoint-path {
      font-family: monospace;
      color: #818cf8;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
    }
    .endpoint-path:hover {
      text-decoration: underline;
    }
    .desc {
      color: #94a3b8;
      font-size: 0.825rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>🧭 Humsafar Backend API</h1>
        <div style="color: #94a3b8; font-size: 0.9rem;">Node.js + Express 5 + SQLite REST API Service</div>
      </div>
      <div class="badge-status">API Server Online (Port 5000)</div>
    </div>

    <!-- Frontend Link Banner -->
    <div style="background: rgba(79, 70, 229, 0.12); border: 1px solid rgba(79, 70, 229, 0.3); padding: 1.25rem; border-radius: 12px; margin-bottom: 1.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div>
        <div style="font-weight: 700; color: #818cf8; font-size: 1rem; margin-bottom: 0.2rem;">Looking for the Humsafar Web UI?</div>
        <div style="font-size: 0.85rem; color: #cbd5e1;">The interactive React frontend application is running on port 5173.</div>
      </div>
      <a href="http://localhost:5173" class="btn" target="_blank">Open Humsafar UI ➔</a>
    </div>

    <div class="section-title">Interactive API Endpoints</div>
    <div class="endpoint-list">
      <div class="endpoint-item">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span class="method-get">GET</span>
          <a href="/api/health" class="endpoint-path" target="_blank">/api/health</a>
        </div>
        <span class="desc">System health check status</span>
      </div>

      <div class="endpoint-item">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span class="method-get">GET</span>
          <a href="/api/destinations" class="endpoint-path" target="_blank">/api/destinations</a>
        </div>
        <span class="desc">List curated destinations catalog</span>
      </div>

      <div class="endpoint-item">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span class="method-get">GET</span>
          <a href="/api/destinations?region=Europe" class="endpoint-path" target="_blank">/api/destinations?region=Europe</a>
        </div>
        <span class="desc">Filter destinations by region</span>
      </div>

      <div class="endpoint-item">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span class="method-post">POST</span>
          <span class="endpoint-path">/api/auth/login</span>
        </div>
        <span class="desc">User & Admin JWT Authentication</span>
      </div>

      <div class="endpoint-item">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span class="method-post">POST</span>
          <span class="endpoint-path">/api/auth/register</span>
        </div>
        <span class="desc">User Registration</span>
      </div>
    </div>

    <div style="margin-top: 2rem; padding-top: 1.25rem; border-top: 1px solid #1e293b; display: flex; justify-content: space-between; font-size: 0.8rem; color: #64748b; flex-wrap: wrap; gap: 0.5rem;">
      <div>Database: <strong style="color: #cbd5e1;">SQLite (Persistent)</strong></div>
      <div>Auth: <strong style="color: #cbd5e1;">Bcrypt + JWT (Bearer Token)</strong></div>
      <div>CORS: <strong style="color: #10b981;">Enabled</strong></div>
    </div>
  </div>
</body>
</html>`);
});

// Fallback for API 404
app.use((req, res) => {
  res.status(404).json({ error: `API endpoint '${req.path}' not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error. Please try again.'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await getDb();
    console.log('Connected to SQLite database successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 Trip Planner Backend Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
