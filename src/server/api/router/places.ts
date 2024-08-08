import 'server-only'

import { sql } from 'drizzle-orm'
import { getPlacesSchema } from '~/schemas/places'
import { db } from '~/server/db/db'
import { getVisitedPlacesIdsByUserId } from '~/server/helpers/db-queries/placeLists'
import {
  flattenTranslationsOnExecute,
  withTranslations,
} from '~/server/helpers/translations/query/with-translations'
import { publicProcedure, router } from '~/server/trpc'

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
          features: withTranslations({}),
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
                eq(verification.userId, sql`${sql.placeholder('userId')}::text`)
              ),
            limit: 1,
          },
          verificationRequirements: true,
        },
      })
    )
    .prepare('places/getPlace')
)

export const placesRouter = router({
  get: publicProcedure.input(getPlacesSchema).query(async ({ input, ctx }) => {
    const visitedPlacesIds = await getVisitedPlacesIdsByUserId(
      ctx.session?.user.id
    )

    const result = await getPlace.execute({
      locale: input.locale,
      id: input.id,
      userId: ctx.session?.user.id,
    })

    if (!result) return undefined

    return {
      ...result,
      images: [],
      visited: visitedPlacesIds.has(input.id),
    }
  }),
})
