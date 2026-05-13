function createDeviceRepository(mysql) {
  return {
    async findAll(filter) {
      let query = 'SELECT * FROM devices';
      const params = [];
      if (filter) {
        query += ' WHERE LOWER(room) = LOWER(?)';
        params.push(filter);
      }
      const [rows] = await mysql.query(query, params);
      return rows;
    },

    async findAllPaginated(page = 1, limit = 10, filter = null) {
      let query = 'SELECT * FROM devices';
      let countQuery = 'SELECT COUNT(*) as total FROM devices';
      const params = [];
      const countParams = [];

      if (filter) {
        query += ' WHERE LOWER(room) = LOWER(?)';
        countQuery += ' WHERE LOWER(room) = LOWER(?)';
        params.push(filter);
        countParams.push(filter);
      }

      query += ' LIMIT ? OFFSET ?';
      params.push(limit, (page - 1) * limit);

      const [data] = await mysql.query(query, params);
      const [countResult] = await mysql.query(countQuery, countParams);
      const total = countResult[0].total;

      return { data, total };
    },

    async findById(id) {
      const [rows] = await mysql.query('SELECT * FROM devices WHERE id = ?', [
        id,
      ]);
      return rows[0] || undefined;
    },

    async create(data) {
      const defaults = {
        device: '',
        status: 'offline',
        room: '',
        description: 'no description',
        enabled: false,
        image: null,
        power: 0,
      };
      const merged = { ...defaults, ...data };
      const fields = [
        'device',
        'status',
        'room',
        'description',
        'enabled',
        'image',
        'power',
      ];
      const values = fields.map((f) => merged[f]);
      const placeholders = fields.map(() => '?').join(', ');

      const [result] = await mysql.query(
        `INSERT INTO devices (${fields.join(', ')}) VALUES (${placeholders})`,
        values,
      );
      return this.findById(result.insertId);
    },

    async update(id, data) {
      const fields = Object.keys(data).filter((k) => k !== 'id');
      if (fields.length === 0) return this.findById(id);

      const setClause = fields.map((f) => `${f} = ?`).join(', ');
      const values = fields.map((f) => data[f]);
      values.push(id);

      await mysql.query(`UPDATE devices SET ${setClause} WHERE id = ?`, values);
      return this.findById(id);
    },

    async remove(id) {
      const [result] = await mysql.query('DELETE FROM devices WHERE id = ?', [
        id,
      ]);
      return result.affectedRows > 0;
    },

    async *streamAll() {
      const [rows] = await mysql.query('SELECT * FROM devices');
      for (const row of rows) {
        yield row;
      }
    },
  };
}

export { createDeviceRepository };
