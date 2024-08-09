import 'server-only'

import { sql } from 'drizzle-orm'
import { getVisitMissionsSchema } from '~/schemas/missions'
import { db } from '~/server/db/db'
import {
  placeCategories,
  places,
  placesToPlaceCategories,
} from '~/server/db/schema'
import { getVisitedPlacesIdsByUserId } from '~/server/helpers/db-queries/placeLists'
import { ascNullsEnd } from '~/server/helpers/order-by'
import {
  flattenTranslationsOnExecute,
  withTranslations,
} from '~/server/helpers/translations/query/with-translations'
import { publicProcedure, router } from '~/server/trpc'

const getVisitMissions = flattenTranslationsOnExecute(
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
        },
        where: (placeCategories, { eq, and, or, inArray, isNull }) =>
          and(
            eq(placeCategories.hasVisitMission, true),
            or(
              isNull(sql`${sql.placeholder('placeId')}::integer`),
              eq(
                placeCategories.id,
                db
                  .selectDistinct({ data: places.mainCategoryId })
                  .from(places)
                  .where(
                    eq(places.id, sql`${sql.placeholder('placeId')}::integer`)
                  )
              ),
              inArray(
                placeCategories.id,
                db
                  .select({ data: placesToPlaceCategories.categoryId })
                  .from(placesToPlaceCategories)
                  .where(
                    eq(
                      placesToPlaceCategories.placeId,
                      sql`${sql.placeholder('placeId')}::integer`
                    )
                  )
              )
            )
          ),
        orderBy: [ascNullsEnd(placeCategories.order)],
        with: {
          secondaryPlaces: {
            with: {
              place: withTranslations({
                columns: {
                  id: true,
                  name: true,
                  description: true,
                  location: true,
                },
                with: {
                  mainImage: true,
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
                      name: true,
                      color: true,
                    },
                  }),
                  verifications: {
                    columns: {
                      id: true,
                      validatedOn: true,
                    },
                    orderBy: (verifications, { desc }) => [
                      desc(verifications.validatedOn),
                    ],
                    where: (verification, { or, isNull, eq }) =>
                      or(
                        isNull(sql`${sql.placeholder('userId')}::text`),
                        eq(
                          verification.userId,
                          sql`${sql.placeholder('userId')}::text`
                        )
                      ),
                    limit: 1,
                  },
                  verificationRequirements: true,
                },
              }),
            },
          },
          mainPlaces: withTranslations({
            columns: {
              id: true,
              name: true,
              description: true,
              location: true,
            },
            with: {
              mainImage: true,
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
                  name: true,
                  color: true,
                },
              }),
              verifications: {
                columns: {
                  id: true,
                  validatedOn: true,
                },
                orderBy: (verifications, { desc }) => [
                  desc(verifications.validatedOn),
                ],
                where: (verification, { or, isNull, eq }) =>
                  or(
                    isNull(sql`${sql.placeholder('userId')}::text`),
                    eq(
                      verification.userId,
                      sql`${sql.placeholder('userId')}::text`
                    )
                  ),
                limit: 1,
              },
              verificationRequirements: true,
            },
          }),
        },
      })
    )
    .prepare('missions/getVisitMissions')
)

export const missionsRouter = router({
  getVisitMissions: publicProcedure
    .input(getVisitMissionsSchema)
    .query(async ({ input, ctx }) => {
      const result = await getVisitMissions.execute({
        locale: input.locale,
        placeId: input.placeId,
        userId: ctx.session?.user.id,
      })

      const visitedPlacesIds = await getVisitedPlacesIdsByUserId(
        ctx.session?.user.id
      )

      return result
        .map(({ secondaryPlaces, mainPlaces, ...category }) => {
          const mainPlacesIds = mainPlaces.map((place) => place.id)
          return {
            category,
            places: [
              ...mainPlaces,
              ...secondaryPlaces
                .map(({ place }) => place)
                .filter((place) => place && !mainPlacesIds.includes(place.id)),
            ].map(({ categories, ...place }) => ({
              ...place,
              categories: categories.map(({ category }) => category),
              images: [],
              visited: visitedPlacesIds.has(place.id),
            })),
          }
        })
        .filter(({ places }) => places.length > 0)
    }),
})
