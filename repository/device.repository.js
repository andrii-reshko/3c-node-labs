import { eq, sql, like } from 'drizzle-orm';
import { devices } from '../db/schema.js';

function createDeviceRepository(drizzle) {
  return {
    async findAll(filter) {
      if (filter) {
        return await drizzle
          .select()
          .from(devices)
          .where(like(devices.room, filter));
      }
      return await drizzle.select().from(devices);
    },

    async findAllPaginated(page = 1, limit = 10, filter = null) {
      const offset = (page - 1) * limit;

      if (filter) {
        const data = await drizzle
          .select()
          .from(devices)
          .where(like(devices.room, filter))
          .limit(limit)
          .offset(offset);
        const [{ count }] = await drizzle
          .select({ count: sql`count(*)`.as('count') })
          .from(devices)
          .where(like(devices.room, filter));
        return { data, total: Number(count) };
      }

      const data = await drizzle
        .select()
        .from(devices)
        .limit(limit)
        .offset(offset);
      const [{ count }] = await drizzle
        .select({ count: sql`count(*)`.as('count') })
        .from(devices);
      return { data, total: Number(count) };
    },

    async findById(id) {
      const [result] = await drizzle
        .select()
        .from(devices)
        .where(eq(devices.id, id));
      return result || undefined;
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
      const [result] = await drizzle
        .insert(devices)
        .values(merged)
        .$returningId();
      return this.findById(result.id);
    },

    async update(id, data) {
      await drizzle.update(devices).set(data).where(eq(devices.id, id));
      return this.findById(id);
    },

    async remove(id) {
      const result = await drizzle.delete(devices).where(eq(devices.id, id));
      return result.rowCount > 0;
    },

    async *streamAll() {
      const rows = await drizzle.select().from(devices);
      for (const row of rows) {
        yield row;
      }
    },
  };
}

export { createDeviceRepository };
