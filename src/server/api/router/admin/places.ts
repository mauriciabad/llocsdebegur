import 'server-only'

import { and, asc, eq, isNull, like, or, sql } from 'drizzle-orm'
import {
  createPlaceSchema,
  editPlaceSchema,
  getPlacesSchema,
  listCategoriesSchema,
  listPlacesSchema,
} from '~/schemas/places'
import { db } from '~/server/db/db'
import {
  externalLinks,
  features,
  placeCategories,
  places,
  placesToPlaceCategories,
} from '~/server/db/schema'
import { ascNullsEnd } from '~/server/helpers/order-by'
import {
  flattenTranslationsOnExecute,
  withTranslations,
} from '~/server/helpers/translations/query/with-translations'
import { adminProcedure, router } from '~/server/trpc'

const getAllPlaces = ({
  limit,
  offset,
  ids: placeIds,
  locale,
}: {
  limit: number
  offset: number
  ids: number[]
  locale: string | null
}) =>
  flattenTranslationsOnExecute(
    db.query.places
      .findMany(
        withTranslations({
          columns: {
            id: true,
            name: true,
            description: true,
            content: true,
            importance: true,
          },
          limit: limit,
          offset: offset,
          orderBy: asc(places.id),
          where: (place, { inArray }) => inArray(place.id, placeIds),
          with: {
            mainImage: {
              columns: {
                id: true,
              },
            },
            features: withTranslations({}),
            categories: {
              columns: {},
              with: {
                category: {
                  columns: {
                    id: true,
                    icon: true,
                    name: true,
                  },
                },
              },
            },
            mainCategory: {
              columns: {
                id: true,
                icon: true,
                color: true,
                name: true,
              },
            },
          },
        })
      )
      .prepare('admin/places/getAllPlaces')
  ).execute({ locale })

const getAllPlaceIds = db
  .selectDistinct({ id: places.id, importance: places.importance })
  .from(places)
  .leftJoin(
    placesToPlaceCategories,
    eq(places.id, placesToPlaceCategories.placeId)
  )
  .where(
    and(
      or(
        isNull(sql`${sql.placeholder('categoryId')}::integer`),
        eq(
          places.mainCategoryId,
          sql`${sql.placeholder('categoryId')}::integer`
        ),
        eq(
          placesToPlaceCategories.categoryId,
          sql`${sql.placeholder('categoryId')}::integer`
        )
      ),
      or(
        isNull(sql`${sql.placeholder('query')}::text`),
        like(places.name, sql`${sql.placeholder('query')}::text`)
      )
    )
  )
  .orderBy(ascNullsEnd(places.importance), asc(places.id))
  .prepare('admin/places/getAllPlaceIds')

const listCategories = flattenTranslationsOnExecute(
  db.query.placeCategories
    .findMany(
      withTranslations({
        columns: {
          id: true,
          icon: true,
          name: true,
          namePlural: true,
          nameGender: true,
          color: true,
          order: true,
        },
        orderBy: [ascNullsEnd(placeCategories.order)],
      })
    )
    .prepare('admin/places/listCategories')
)

const getPlace = flattenTranslationsOnExecute(
  db.query.places
    .findFirst(
      withTranslations({
        columns: {
          id: true,
          name: true,
          description: true,
          content: true,
          importance: true,
          googleMapsId: true,
          location: true,
        },
        where: (place, { eq }) =>
          eq(place.id, sql`${sql.placeholder('id')}::integer`),
        with: {
          mainImage: true,
          externalLinks: withTranslations({}),
          categories: {
            columns: {},
            with: {
              category: withTranslations({
                columns: {
                  id: true,
                  icon: true,
                  name: true,
                },
              }),
            },
          },
          mainCategory: withTranslations({
            columns: {
              id: true,
              icon: true,
              color: true,
              name: true,
            },
          }),
          features: true,
        },
      })
    )
    .prepare('admin/places/getPlace')
)

export const placesAdminRouter = router({
  list: adminProcedure.input(listPlacesSchema).query(async ({ input }) => {
    const preparedQuery = input.query
      ? `%${input.query.toLocaleLowerCase().replaceAll(/\s+/g, '%')}%`
      : null

    const ids = (
      await getAllPlaceIds.execute({
        query: preparedQuery,
        categoryId: input.categoryId,
      })
    ).map(({ id }) => id)

    return {
      data: await getAllPlaces({
        locale: input.locale,
        offset: (input.page - 1) * input.pageSize,
        limit: input.pageSize,
        ids: ids,
      }),
      total: ids.length,
    }
  }),
  get: adminProcedure.input(getPlacesSchema).query(async ({ input }) => {
    const result = await getPlace.execute({
      locale: input.locale,
      id: input.id,
    })
    if (!result) return undefined
    return result
  }),
  listCategories: adminProcedure
    .input(listCategoriesSchema)
    .query(async ({ input }) => {
      return await listCategories.execute({ locale: input.locale })
    }),
  createPlace: adminProcedure
    .input(createPlaceSchema)
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        const newFeatures = (
          await tx
            .insert(features)
            .values({ ...input.features })
            .returning()
        )[0]

        const newPlace = (
          await tx
            .insert(places)
            .values({
              name: input.name,
              description: input.description,
              googleMapsId: input.googleMapsId,
              mainCategoryId: input.mainCategory,
              mainImageId: input.mainImageId,
              location: input.location,
              importance: input.importance,
              content: input.content,
              verificationRequirementsId: 1,
              featuresId: newFeatures.id,
            })
            .returning()
        )[0]

        if (input.categories.length > 0) {
          await tx.insert(placesToPlaceCategories).values(
            input.categories.map((categoryId) => ({
              placeId: newPlace.id,
              categoryId: categoryId,
            }))
          )
        }

        if (input.externalLinks.length > 0) {
          await tx.insert(externalLinks).values(
            input.externalLinks.map((externalLink) => ({
              placeId: newPlace.id,
              ...externalLink,
            }))
          )
        }

        return newPlace.id
      })
    }),
  editPlace: adminProcedure
    .input(editPlaceSchema)
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        const placeId = Number(input.id)

        const featuresId = (
          await tx
            .selectDistinct({ featuresId: places.featuresId })
            .from(places)
            .where(eq(places.id, placeId))
        )[0].featuresId

        await tx
          .update(features)
          .set({
            id: featuresId,
            ...input.features,
          })
          .where(eq(features.id, featuresId))

        await tx
          .update(places)
          .set({
            name: input.name,
            description: input.description,
            googleMapsId: input.googleMapsId,
            mainCategoryId: input.mainCategory,
            mainImageId: input.mainImageId,
            location: input.location,
            importance: input.importance,
            content: input.content,
            featuresId: featuresId,
          })
          .where(eq(places.id, placeId))

        await tx
          .delete(placesToPlaceCategories)
          .where(eq(placesToPlaceCategories.placeId, placeId))
        if (input.categories.length > 0) {
          await tx.insert(placesToPlaceCategories).values(
            input.categories.map((categoryId) => ({
              placeId: placeId,
              categoryId: categoryId,
            }))
          )
        }

        await tx.delete(externalLinks).where(eq(externalLinks.placeId, placeId))
        if (input.externalLinks.length > 0) {
          await tx.insert(externalLinks).values(
            input.externalLinks.map((externalLink) => ({
              placeId: placeId,
              ...externalLink,
            }))
          )
        }

        return placeId
      })
    }),
})
