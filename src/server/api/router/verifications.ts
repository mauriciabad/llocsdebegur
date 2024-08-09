import 'server-only'

import { verificateVisitSchema } from '~/schemas/verifications'
import { db } from '~/server/db/db'
import { verifications } from '~/server/db/schema'
import { protectedProcedure, router } from '~/server/trpc'

export const verificationsRouter = router({
  verificateVisit: protectedProcedure
    .input(verificateVisitSchema)
    .mutation(async ({ input, ctx }) => {
      return await db.insert(verifications).values({
        placeId: input.placeId,
        userId: ctx.session.user.id,
        deviceLocation: input.deviceLocation,
        deviceLocationAccuracy: input.deviceLocationAccuracy,
      })
    }),
})
