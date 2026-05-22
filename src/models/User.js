const database = require('../database/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(username, password, email = null) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await database.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    return result.id;
  }

  static async findByUsername(username) {
    return database.get(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
  }

  static async findById(id) {
    return database.get(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
  }

  static async updateActorId(userId, actorId) {
    await database.run(
      'UPDATE users SET actor_id = ? WHERE id = ?',
      [actorId, userId]
    );
  }

  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async getAll() {
    return database.all('SELECT id, username, actor_id FROM users');
  }
}

module.exports = User;
