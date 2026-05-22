const express = require('express');
const RoomController = require('../controllers/RoomController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All room endpoints require authentication
router.use(authMiddleware);

// Room CRUD operations
router.post('/', RoomController.createRoom);
router.get('/', RoomController.getAllRooms);
router.get('/owner/my-rooms', RoomController.getRoomsByOwner);
router.get('/:roomId', RoomController.getRoom);
router.post('/:roomId/join', RoomController.joinRoom);
router.post('/:roomId/leave', RoomController.leaveRoom);
router.post('/:roomId/close', RoomController.closeRoom);

module.exports = router;
