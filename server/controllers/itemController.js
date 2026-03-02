/**
 * Controller - Sorting
 * - Receives HTTP requests for sorting operations.
 * - Validates input, instantiates the sorting engine (Model), and streams results back to the client.
 */
const { SortingArrayProcessor } = require('../models/sortingFunctions');

/**
 * Handles a sort request using Server-Sent Events (SSE).
 * - Validates query parameters.
 * - Routes the request to the correct algorithm method on the sorting engine.
 *
 * @param {import('express').Request} request - Incoming HTTP request.
 * @param {import('express').Response} response - Streaming HTTP response (SSE).
 * @returns {void}
 */
exports.handleSort = (request, response) => {
    try {
        response.setHeader('Content-Type', 'text/event-stream');
        response.setHeader('Cache-Control', 'no-cache');
        response.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        const { algo: algorithmName } = request.params;

        const rawRequestData = request.query.data;
        if (!rawRequestData) {
            response.status(400).write('data: {"error":"Missing data query parameter"}\n\n');
            return response.end();
        }

        let parsedRequestData;
        try {
            parsedRequestData = JSON.parse(rawRequestData);
        } catch (error) {
            response.status(400).write('data: {"error":"Invalid JSON in data parameter"}\n\n');
            return response.end();
        }

        const sortingEngine = new SortingArrayProcessor(parsedRequestData);

        if (typeof sortingEngine[algorithmName] !== 'function') {
            response.status(400).write('data: {"error":"Algorithm not found!"}\n\n');
            return response.end();
        }

        // Dynamically invoke the algorithm that matches the requested name (e.g., bubble, quick, merge).
        sortingEngine[algorithmName](response);
        response.end();
    } catch (error) {
        response.status(500).write(`data: {"error":"${error.message}"}\n\n`);
        response.end();
    }
};