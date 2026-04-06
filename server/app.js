/**
 * Application Entry (Server)
 * - Bootstraps the Express application.
 * - Wires static assets (View) and the sorting routes (Controller layer).
 */
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());
// Route layer responsible for sorting-related HTTP endpoints.
const sortingRoutes = require('./routes/itemRoutes');

// Serve the frontend sorting visualizer (View) as static assets.
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Mount the sorting routes under /sort (Controller -> business logic).
app.use('/sort', sortingRoutes);

const PORT = 8000;

app.use((err, req, res, next) => {
    console.error("see the error here ---->", err.message);
    res.status(500).json({ error: "inside error", details: err.message });
});
/**
 * Starts the HTTP server on the configured port.
 * @param {number} port - The TCP port on which the server will listen.
 * @returns {void}
 */
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
