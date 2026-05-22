const Room = require('../models/Room');
const User = require('../models/User');

class RoomController {
  static async createRoom(req, res) {
    try {
      const { room_name, max_players = 4, game_mode = -1 } = req.body;
      const userId = req.user.id;

      if (!room_name) {
        return res.status(400).json({ error: 'Room name required' });
      }

      const roomId = await Room.create(room_name, userId, max_players, game_mode);
      // Add owner to room
      await Room.addPlayer(roomId, userId);

      const room = await Room.findById(roomId);
      res.status(201).json({
        message: 'Room created successfully',
        room
      });
    } catch (err) {
      console.error('Create room error:', err);
      res.status(500).json({ error: 'Failed to create room' });
    }
  }

  static async getAllRooms(req, res) {
    try {
      const rooms = await Room.getActiveRooms();
      res.json({ rooms });
    } catch (err) {
      console.error('Get all rooms error:', err);
      res.status(500).json({ error: 'Failed to get rooms' });
    }
  }

  static async getRoom(req, res) {
    try {
      const { roomId } = req.params;
      const room = await Room.findById(roomId);

      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      const players = await Room.getPlayersInRoom(roomId);
      res.json({ room, players });
    } catch (err) {
      console.error('Get room error:', err);
      res.status(500).json({ error: 'Failed to get room' });
    }
  }

  static async joinRoom(req, res) {
    try {
      const { roomId } = req.params;
      const userId = req.user.id;

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      if (room.current_players >= room.max_players) {
        return res.status(400).json({ error: 'Room is full' });
      }

      await Room.addPlayer(roomId, userId);
      const players = await Room.getPlayersInRoom(roomId);

      res.json({
        message: 'Joined room successfully',
        room,
        players
      });
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Already in this room' });
      }
      console.error('Join room error:', err);
      res.status(500).json({ error: 'Failed to join room' });
    }
  }

  static async leaveRoom(req, res) {
    try {
      const { roomId } = req.params;
      const userId = req.user.id;

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      await Room.removePlayer(roomId, userId);

      // If room is empty, close it
      const players = await Room.getPlayersInRoom(roomId);
      if (players.length === 0) {
        await Room.closeRoom(roomId);
      }

      res.json({ message: 'Left room successfully' });
    } catch (err) {
      console.error('Leave room error:', err);
      res.status(500).json({ error: 'Failed to leave room' });
    }
  }

  static async closeRoom(req, res) {
    try {
      const { roomId } = req.params;
      const userId = req.user.id;

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      if (room.owner_id !== userId) {
        return res.status(403).json({ error: 'Only room owner can close the room' });
      }

      await Room.closeRoom(roomId);
      res.json({ message: 'Room closed successfully' });
    } catch (err) {
      console.error('Close room error:', err);
      res.status(500).json({ error: 'Failed to close room' });
    }
  }

  static async getRoomsByOwner(req, res) {
    try {
      const userId = req.user.id;
      const rooms = await Room.getRoomsByOwner(userId);
      res.json({ rooms });
    } catch (err) {
      console.error('Get owner rooms error:', err);
      res.status(500).json({ error: 'Failed to get owner rooms' });
    }
  }
}

module.exports = RoomController;
