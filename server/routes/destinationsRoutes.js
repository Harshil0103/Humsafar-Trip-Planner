const express = require('express');
const router = express.Router();
const destinationsController = require('../controllers/destinationsController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', destinationsController.getDestinations);
router.get('/:id', destinationsController.getDestinationById);
router.post('/', authenticate, requireAdmin, destinationsController.createDestination);
router.put('/:id', authenticate, requireAdmin, destinationsController.updateDestination);
router.delete('/:id', authenticate, requireAdmin, destinationsController.deleteDestination);

module.exports = router;
