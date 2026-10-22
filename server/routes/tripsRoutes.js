const express = require('express');
const router = express.Router();
const tripsController = require('../controllers/tripsController');
const itineraryController = require('../controllers/itineraryController');
const activitiesController = require('../controllers/activitiesController');
const accommodationsController = require('../controllers/accommodationsController');
const transportationController = require('../controllers/transportationController');
const expensesController = require('../controllers/expensesController');
const { authenticate } = require('../middleware/auth');

// All trip routes require authentication
router.use(authenticate);

// --- Trips CRUD ---
router.get('/', tripsController.getUserTrips);
router.get('/:id', tripsController.getTripById);
router.post('/', tripsController.createTrip);
router.put('/:id', tripsController.updateTrip);
router.patch('/:id/status', tripsController.updateTripStatus);
router.post('/:id/duplicate', tripsController.duplicateTrip);
router.delete('/:id', tripsController.deleteTrip);

// --- Itinerary ---
router.post('/:tripId/itinerary/days', itineraryController.addDay);
router.delete('/:tripId/itinerary/days/:dayId', itineraryController.deleteDay);
router.post('/:tripId/itinerary/items', itineraryController.addItem);
router.put('/:tripId/itinerary/items/:itemId', itineraryController.updateItem);
router.delete('/:tripId/itinerary/items/:itemId', itineraryController.deleteItem);
router.patch('/:tripId/itinerary/reorder', itineraryController.reorderItems);

// --- Activities ---
router.get('/:tripId/activities', activitiesController.getActivities);
router.post('/:tripId/activities', activitiesController.createActivity);
router.put('/:tripId/activities/:id', activitiesController.updateActivity);
router.delete('/:tripId/activities/:id', activitiesController.deleteActivity);

// --- Accommodations ---
router.get('/:tripId/accommodations', accommodationsController.getAccommodations);
router.post('/:tripId/accommodations', accommodationsController.createAccommodation);
router.put('/:tripId/accommodations/:id', accommodationsController.updateAccommodation);
router.delete('/:tripId/accommodations/:id', accommodationsController.deleteAccommodation);

// --- Transportation ---
router.get('/:tripId/transportation', transportationController.getTransportation);
router.post('/:tripId/transportation', transportationController.createTransportation);
router.put('/:tripId/transportation/:id', transportationController.updateTransportation);
router.delete('/:tripId/transportation/:id', transportationController.deleteTransportation);

// --- Expenses & Budget ---
router.get('/:tripId/expenses', expensesController.getExpenses);
router.post('/:tripId/expenses', expensesController.createExpense);
router.put('/:tripId/expenses/:id', expensesController.updateExpense);
router.delete('/:tripId/expenses/:id', expensesController.deleteExpense);

// --- Packing Items ---
router.get('/:tripId/packing', expensesController.getPackingItems);
router.post('/:tripId/packing', expensesController.addPackingItem);
router.patch('/:tripId/packing/:id', expensesController.togglePackingItem);
router.delete('/:tripId/packing/:id', expensesController.deletePackingItem);

// --- Trip Photos & Memories ---
router.get('/:tripId/photos', tripsController.getTripPhotos);
router.post('/:tripId/photos', tripsController.addTripPhoto);
router.delete('/:tripId/photos/:photoId', tripsController.deleteTripPhoto);
router.post('/:tripId/photos/:photoId/like', tripsController.likeTripPhoto);

module.exports = router;
