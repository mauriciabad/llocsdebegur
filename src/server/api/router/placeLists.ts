import 'server-only'

import { sql } from 'drizzle-orm'
import {
  addToVisitedPlacesListSchema,
  getVisitedPlacesSchema,
} from '~/schemas/placeLists'
import { db } from '~/server/db/db'
import { placeListToPlace, places } from '~/server/db/schema'
import { getVisitedPlaceListIdByUserId } from '~/server/helpers/db-queries/placeLists'
import { ascNullsEnd } from '~/server/helpers/order-by'
import {
  flattenTranslationsOnExecute,
  withTranslations,
} from '~/server/helpers/translations/query/with-translations'
import { protectedProcedure, router } from '~/server/trpc'

const addToPlaceList = db
  .insert(placeListToPlace)
  .values({
    placeListId: sql`${sql.placeholder('placeListId')}::integer`,
    placeId: sql`${sql.placeholder('placeId')}::integer`,
  })
  .prepare('placeLists/addToPlaceList')

const getPlacesFromPlaceListQuery = flattenTranslationsOnExecute(
  db.query.placeListToPlace
    .findMany({
      columns: {
        addedAt: true,
      },
      where: (placeList, { eq }) =>
        eq(
          placeList.placeListId,
          sql`${sql.placeholder('placeListId')}::integer`
        ),

      with: {
        place: withTranslations({
          columns: {
            id: true,
            name: true,
            description: true,
            location: true,
          },
          orderBy: [ascNullsEnd(places.importance)],
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
                color: true,
                name: true,
              },
            }),
          },
        }),
      },
    })
    .prepare('placeLists/getPlacesFromPlaceList')
)

const getPlacesFromPlaceListCountQuery = db.query.placeListToPlace
  .findMany({
    columns: {
      placeId: true,
    },
    where: (placeList, { eq }) =>
      eq(
        placeList.placeListId,
        sql`${sql.placeholder('placeListId')}::integer`
      ),
  })
  .prepare('placeLists/getPlacesFromPlaceListCount')

export const placeListsRouter = router({
  addToVisitedPlacesList: protectedProcedure
    .input(addToVisitedPlacesListSchema)
    .mutation(async ({ input, ctx }) => {
      const visitedPlaceListId = await getVisitedPlaceListIdByUserId(
        ctx.session.user.id
      )

      return await addToPlaceList.execute({
        placeListId: visitedPlaceListId,
        placeId: input.placeId,
      })
    }),

  getVisitedPlaces: protectedProcedure
    .input(getVisitedPlacesSchema)
    .query(async ({ input, ctx }) => {
      const visitedPlaceListId = await getVisitedPlaceListIdByUserId(
        ctx.session.user.id
      )

      const result = await getPlacesFromPlaceListQuery.execute({
        locale: input.locale,
        placeListId: visitedPlaceListId,
      })

      return result.map(({ addedAt, place }) => ({
        ...place,
        addedAt,
      }))
    }),

  getVisitedPlacesCount: protectedProcedure.query(async ({ ctx }) => {
    const visitedPlaceListId = await getVisitedPlaceListIdByUserId(
      ctx.session.user.id
    )

    const result = await getPlacesFromPlaceListCountQuery.execute({
      placeListId: visitedPlaceListId,
    })

    return result.length
  }),
})
