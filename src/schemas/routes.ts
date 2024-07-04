import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import {
  multiLineSchema,
  multilineFromGeoJsonString,
} from '~/helpers/spatial-data/multi-line'
import { translatableLocales } from '~/i18n'
import { MAX_IMPORTANCE } from '~/server/db/constants/shared'
import { features } from '~/server/db/schema'
import { externalLinkSchema } from './externalLink'
import { numericIdSchema } from './shared'

export const listRoutesSchema = z.object({
  locale: z.enum(translatableLocales).nullable(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive(),
  query: z.string().optional(),
  categoryId: numericIdSchema.optional(),
})

export const getRoutesSchema = z.object({
  locale: z.enum(translatableLocales).nullable(),
  id: numericIdSchema,
})

export const listCategoriesSchema = z.object({
  locale: z.enum(translatableLocales).nullable(),
})

export const createRouteSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional().nullable(),
  mainCategory: z.coerce.number().positive('Required').int(),
  categories: z
    .string()
    .optional()
    .transform((value) => value?.split(',').map(Number) ?? [])
    .pipe(z.array(numericIdSchema)),
  path: z
    .string()
    .min(3, 'Required')
    .transform(multilineFromGeoJsonString)
    .pipe(multiLineSchema),
  importance: z.coerce.number().gt(0).lt(MAX_IMPORTANCE).optional().nullable(),
  content: z.string().optional().nullable(),
  features: createInsertSchema(features),
  externalLinks: z.array(externalLinkSchema),
})

export const editRouteSchema = createRouteSchema.extend({
  id: numericIdSchema,
})

export type ListRoutesInputData = z.infer<typeof listRoutesSchema>
export type GetRoutesInputData = z.infer<typeof getRoutesSchema>
export type ListCategoriesInputData = z.infer<typeof listCategoriesSchema>
export type CreateRouteInputData = z.infer<typeof createRouteSchema>
export type EditRouteInputData = z.infer<typeof editRouteSchema>
