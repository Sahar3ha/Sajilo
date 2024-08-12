const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./database/db');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const http = require('http');
const multiparty = require('connect-multiparty');

// Making express app
const app = express();
const corsPolicy = {
    origin: true,
    credentials: true,
    optionSuccessStatus: 200
};
app.use(cors(corsPolicy));

// dotenv config
dotenv.config();

// mongodb connection
connectDB();

// json middleware (to accept json data)
app.use(express.json());
app.use(multiparty());

// user routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/vehicleRoutes'));

// HTTPS options (read your certificate and key files)
const httpsOptions = {
    key: fs.readFileSync('certificates/localhost.key'),
    cert: fs.readFileSync('certificates/localhost.crt')
};

// Create HTTPS server
const httpsServer = https.createServer(httpsOptions, app);

// Optionally create an HTTP server to redirect to HTTPS
const httpApp = express();
httpApp.use((req, res) => {
    res.redirect(`https://${req.hostname}${req.url}`);
});
const httpServer = http.createServer(httpApp);

// Define ports
const HTTPS_PORT = process.env.HTTPS_PORT || 443; // Default HTTPS port is 443
const HTTP_PORT = process.env.PORT || 80; // Default HTTP port is 80

// Start HTTP server for redirecting to HTTPS
httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP Server is running on port ${HTTP_PORT} and redirecting to HTTPS`);
});

// Start HTTPS server
httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server is running on port ${HTTPS_PORT}`);
});

module.exports = app;
