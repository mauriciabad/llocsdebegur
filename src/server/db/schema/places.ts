import { relations } from 'drizzle-orm'
import { doublePrecision, integer, text } from 'drizzle-orm/pg-core'
import { pgTableWithTranslations } from '../../helpers/translations/db-tables'
import { externalLinks } from './externalLinks'
import { features } from './features'
import { images } from './images'
import { placeCategories, placesToPlaceCategories } from './placeCategories'
import { placeListToPlace } from './placeLists'
import { routesToPlaces } from './routes'
import { geometryType } from './utils'
import { verificationRequirements } from './verificationRequirements'
import { verifications } from './verifications'

export const {
  normalTable: places,
  translationsTable: placesTranslations,
  makeRelationsWithTranslations: makePlaceRelations,
  translationsTableRelations: placesTranslationsRelations,
} = pgTableWithTranslations({
  name: 'place',
  normalColumns: {
    mainImageId: integer('mainImageId'),
    googleMapsId: text('googleMapsId'),
    location: geometryType('location', 'point').notNull(),
    mainCategoryId: integer('mainCategoryId').notNull(),
    featuresId: integer('featuresId').notNull(),
    verificationRequirementsId: integer('verificationRequirementsId'),
    importance: doublePrecision('importance'),
  },
  translatableColumns: {
    name: text('name').notNull(),
    description: text('description'),
    content: text('content'), // Markdown
  },
})

export const placesRelations = relations(places, (r) => ({
  ...makePlaceRelations(r),

  routes: r.many(routesToPlaces),
  mainImage: r.one(images, {
    fields: [places.mainImageId],
    references: [images.id],
  }),
  mainCategory: r.one(placeCategories, {
    fields: [places.mainCategoryId],
    references: [placeCategories.id],
    relationName: 'mainCategory',
  }),
  categories: r.many(placesToPlaceCategories, {
    relationName: 'secondaryPlaceToCategories',
  }),
  features: r.one(features, {
    fields: [places.featuresId],
    references: [features.id],
  }),
  externalLinks: r.many(externalLinks),
  placeLists: r.many(placeListToPlace),
  verificationRequirements: r.one(verificationRequirements, {
    fields: [places.verificationRequirementsId],
    references: [verificationRequirements.id],
  }),
  verifications: r.many(verifications),
}))
