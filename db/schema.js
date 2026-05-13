import {
  mysqlTable,
  varchar,
  text,
  boolean,
  int,
  timestamp,
} from 'drizzle-orm/mysql-core';

export const devices = mysqlTable('devices', {
  id: int('id').autoincrement().primaryKey(),
  device: varchar('device', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('offline'),
  room: varchar('room', { length: 255 }).notNull().default(''),
  description: text('description').default('no description'),
  enabled: boolean('enabled').default(false),
  image: varchar('image', { length: 512 }),
  power: int('power').default(0),
  createdAt: timestamp('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: timestamp('updated_at').default('CURRENT_TIMESTAMP'),
});

export const migrations = mysqlTable('migrations', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  hash: varchar('hash', { length: 32 }).notNull(),
  appliedAt: timestamp('applied_at').default('CURRENT_TIMESTAMP'),
});
