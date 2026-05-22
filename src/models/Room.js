const database = require('../database/database');

class Room {
  static async create(roomName, ownerId, maxPlayers = 4, gameMode = -1) {
    const result = await database.run(
      'INSERT INTO rooms (room_name, owner_id, max_players, game_mode) VALUES (?, ?, ?, ?)',
      [roomName, ownerId, maxPlayers, gameMode]
    );
    return result.id;
  }

  static async findById(roomId) {
    return database.get(
      'SELECT * FROM rooms WHERE id = ? AND is_active = 1',
      [roomId]
    );
  }

  static async findAll() {
    return database.all(
      'SELECT * FROM rooms WHERE is_active = 1 ORDER BY created_at DESC'
    );
  }

  static async getActiveRooms() {
    return database.all(
      'SELECT r.*, COUNT(rp.user_id) as player_count FROM rooms r LEFT JOIN room_players rp ON r.id = rp.room_id WHERE r.is_active = 1 GROUP BY r.id'
    );
  }

  static async addPlayer(roomId, userId) {
    await database.run(
      'INSERT INTO room_players (room_id, user_id) VALUES (?, ?)',
      [roomId, userId]
    );
    // Update player count
    await database.run(
      'UPDATE rooms SET current_players = current_players + 1 WHERE id = ?',
      [roomId]
    );
  }

  static async removePlayer(roomId, userId) {
    await database.run(
      'DELETE FROM room_players WHERE room_id = ? AND user_id = ?',
      [roomId, userId]
    );
    // Update player count
    await database.run(
      'UPDATE rooms SET current_players = current_players - 1 WHERE id = ?',
      [roomId]
    );
  }

  static async getPlayersInRoom(roomId) {
    return database.all(
      'SELECT u.id, u.username, u.actor_id FROM room_players rp JOIN users u ON rp.user_id = u.id WHERE rp.room_id = ?',
      [roomId]
    );
  }

  static async closeRoom(roomId) {
    await database.run(
      'UPDATE rooms SET is_active = 0 WHERE id = ?',
      [roomId]
    );
  }

  static async getRoomsByOwner(ownerId) {
    return database.all(
      'SELECT * FROM rooms WHERE owner_id = ? AND is_active = 1',
      [ownerId]
    );
  }
}

module.exports = Room;
