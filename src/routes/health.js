const express = require('express');
const router = express.Router();

// Health check endpoint - used by Flash to test connection
router.get('/api/test', (req, res) => {
  res.status(200).send('OK');
});

// Geolocation endpoint - used by LocationByIPService to determine user's country
router.get('/api/geolocation/country', (req, res) => {
  // Get client IP
  const clientIp = req.ip || req.connection.remoteAddress;
  
  // For now, default to 'us' - you can integrate a real geolocation service later
  // Examples: MaxMind GeoIP2, IP2Location, GeoLite2, etc.
  res.json({
    clientCountry: 'us',
    targetCountry: 'us',
    clientIp: clientIp
  });
});

module.exports = router;
