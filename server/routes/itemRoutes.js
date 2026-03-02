/**
 * Routes - Sorting
 * - Connects HTTP endpoints under /sort to the sorting controller.
 * - Part of the Controller layer in the MVC architecture.
 */
const express = require('express');

const sortingRouter = express.Router();
const sortingController = require('../controllers/itemController');

/**
 * GET /:algo
 * Streams sorting steps for the requested algorithm using SSE.
 * @name GET/sort/:algo
 * @function
 * @param {string} algo - Algorithm name (bubble, selection, insertion, merge, quick).
 */
sortingRouter.get('/:algo', sortingController.handleSort);

module.exports = sortingRouter;