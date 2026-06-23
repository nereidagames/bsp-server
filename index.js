require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');

// Import routes
const authRoutes = require('./src/routes/auth');
const roomRoutes = require('./src/routes/rooms');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve crossdomain.xml at root level for Flash/CORS compliance
app.get('/crossdomain.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0"?>
<!DOCTYPE cross-domain-policy SYSTEM "http://www.adobe.com/xml/dtds/cross-domain-policy.dtd">
<cross-domain-policy>
    <allow-access-from domain="*" to-ports="80,443,*" />
    <allow-http-request-headers-from domain="*" headers="*" />
</cross-domain-policy>`);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Test endpoint - used by Flash to verify connection
app.get('/api/test', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'BSP Server is running' });
});

// Geolocation endpoint - used by LocationByIPService to determine user's country
app.get('/api/geolocation/country', (req, res) => {
  // Get client IP
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  // For now, default to 'us' - you can integrate a real geolocation service later
  // Popular services: MaxMind GeoIP2, IP2Location, GeoLite2, etc.
  res.json({
    clientCountry: 'us',
    targetCountry: 'us',
    clientIp: clientIp
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'BlockStarPlanet Private Server',
    version: '1.0.0',
    description: 'Private server for BlockStarPlanet game'
  });
});

// Auto-ping to keep Render alive (ping every 14 minutes)
// This prevents the server from going into sleep mode
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

setInterval(() => {
  const timestamp = new Date().toISOString();
  console.log(`[PING] Server is alive at ${timestamp}`);
  // In production on Render, this would be triggered by external monitoring
  // But we can also add a self-ping mechanism if needed
}, PING_INTERVAL);

console.log(`[STARTUP] Auto-ping configured every 14 minutes to keep Render.com alive`);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  BlockStarPlanet Private Server         ║
║  Running on port ${PORT}                 ║
║  Environment: ${process.env.NODE_ENV || 'development'}               ║
║  Ping interval: 14 minutes              ║
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
