import { geometry, pgEnum } from 'drizzle-orm/pg-core'
import { SRID_CODE } from '~/server/helpers/spatial-data'

export const genderEnum = pgEnum('gender', ['masculine', 'feminine'])

export const geometryType = <TName extends string, TType extends string>(
  name: TName,
  type: TType
) =>
  geometry(name, {
    type,
    mode: 'xy',
    srid: SRID_CODE,
  })
