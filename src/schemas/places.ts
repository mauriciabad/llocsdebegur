import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { googleMapsIdSchema } from '~/helpers/data/google-maps-id'
import { translatableLocales } from '~/i18n'
import { MAX_IMPORTANCE } from '~/server/db/constants/shared'
import { features } from '~/server/db/schema'
import { externalLinkSchema } from './externalLink'
import { numericIdSchema } from './shared'

export const listPlacesSchema = z.object({
  locale: z.enum(translatableLocales).nullable(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive(),
  query: z.string().optional(),
  categoryId: numericIdSchema.optional(),
})

export const getPlacesSchema = z.object({
  locale: z.enum(translatableLocales).nullable(),
  id: numericIdSchema,
})

export const listCategoriesSchema = z.object({
  locale: z.enum(translatableLocales).nullable(),
})

export const createPlaceSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional().nullable(),
  googleMapsId: googleMapsIdSchema.optional().nullable(),
  mainCategory: z.coerce.number().positive('Required').int(),
  categories: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return []
      return value.split(',').map(Number)
    })
    .pipe(z.array(numericIdSchema)),
  location: z
    .string()
    .min(3, 'Required')
    .transform((value) => {
      const [x, y] = value.split(',')
      return { x: Number(x), y: Number(y) }
    })
    .pipe(
      z.object({
        x: z.number(),
        y: z.number(),
      })
    ),
  importance: z.coerce.number().gt(0).lt(MAX_IMPORTANCE).optional().nullable(),
  mainImageId: z.number().int().optional().nullable(),
  content: z.string().optional().nullable(),
  features: createInsertSchema(features),
  externalLinks: z.array(externalLinkSchema),
})

export const editPlaceSchema = createPlaceSchema.extend({
  id: numericIdSchema,
})

export type ListPlacesInputData = z.infer<typeof listPlacesSchema>
export type GetPlacesInputData = z.infer<typeof getPlacesSchema>
export type ListCategoriesInputData = z.infer<typeof listCategoriesSchema>
export type CreatePlaceInputData = z.infer<typeof createPlaceSchema>
export type EditPlaceInputData = z.infer<typeof editPlaceSchema>
