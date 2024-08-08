import { relations, sql } from 'drizzle-orm'
import { integer, pgTable, serial, timestamp } from 'drizzle-orm/pg-core'
import { dbUserId } from '../utilities'
import { places } from './places'
import { users } from './users'
import { geometryType } from './utils'

export const verifications = pgTable('verification', {
  id: serial('id').primaryKey(),
  placeId: integer('placeId').notNull(),
  userId: dbUserId('userId').notNull(),

  validatedOn: timestamp('validatedOn')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  deviceLocation: geometryType('deviceLocation', 'point'),
  deviceLocationAccuracy: integer('deviceLocationAccuracy'),
})

export const verificationsRelations = relations(verifications, (r) => ({
  place: r.one(places, {
    fields: [verifications.placeId],
    references: [places.id],
  }),
  user: r.one(users, {
    fields: [verifications.userId],
    references: [users.id],
  }),
}))
