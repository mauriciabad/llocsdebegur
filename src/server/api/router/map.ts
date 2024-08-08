import 'server-only'

import { calculatePath } from '~/helpers/spatial-data/multi-line'
import { db } from '~/server/db/db'
import { routes } from '~/server/db/schema'
import { selectMultiLine } from '~/server/helpers/spatial-data/multi-line'
import { publicProcedure, router } from '~/server/trpc'

const getAllPlacesForMap = db.query.places
  .findMany({
    columns: {
      id: true,
      name: true,
      importance: true,
      location: true,
    },
    with: {
      mainCategory: {
        columns: {
          id: true,
          icon: true,
          color: true,
        },
      },
    },
  })
  .prepare('map/getAllPlacesForMap')

const getAllRoutesForMap = db.query.routes
  .findMany({
    columns: {
      id: true,
      name: true,
      importance: true,
    },
    extras: {
      path: selectMultiLine('path', routes.path),
    },
    with: {
      mainCategory: {
        columns: {
          id: true,
          icon: true,
          color: true,
        },
      },
    },
  })
  .prepare('map/getAllRoutesForMap')

export const mapRouter = router({
  getAllPlaces: publicProcedure.query(async () => {
    return await getAllPlacesForMap.execute()
  }),
  getAllRoutes: publicProcedure.query(async () => {
    return (await getAllRoutesForMap.execute()).map(calculatePath)
  }),
})
