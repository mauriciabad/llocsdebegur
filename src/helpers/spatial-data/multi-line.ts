import { z } from 'zod'

type Lat = number
type Lng = number
export type MapMultiLine = [Lat, Lng][][]

/**
 * @example MultiLineString((1 1,2 2,3 3),(4 4,5 5))
 */
export type MultiLineString = `MultiLineString(${string})`

const multiLineSchema = z.array(z.array(z.tuple([z.number(), z.number()])))

/**
 * Extracts a multi-line from a string.
 * Notice that the order is lng lat, not lat lng. Except in JSON format, where it doesn't matter.
 * @param value String in the format `lng lat`, `MULTILINE(lng lat), `{ "lat": 1,"lng": 1 }` or `{ "x": 1,"y": 1 }`. There can be a comma between the values.
 * @returns Object representing a multi-line
 */
export function getMultiLine(
  value: MultiLineString | MapMultiLine
): MapMultiLine
export function getMultiLine(value: null | undefined): null
export function getMultiLine(
  value: string | MultiLineString | MapMultiLine | null | undefined
): MapMultiLine | null
export function getMultiLine(
  value: string | MultiLineString | MapMultiLine | null | undefined
): MapMultiLine | null {
  if (!value) return null
  if (typeof value === 'string') {
    try {
      return getMultiLine(JSON.parse(value))
    } catch (e) {
      // Ignore
    }

    return nullIfHasNull(
      Array.from(
        value.matchAll(/(\([\d.-]+ +[\d.-]+( *, *[\d.-]+ +[\d.-]+)*\))/g)
      ).map(([rawLine]) =>
        rawLine
          .slice(1, -1)
          .split(',')
          .map((rawPoint) => {
            const matchesPoints = rawPoint.match(
              /(?<lng>[\d.-]+) +(?<lat>[\d.-]+)/
            )
            if (
              !matchesPoints?.groups?.['lat'] ||
              !matchesPoints?.groups?.['lng']
            ) {
              return null
            }
            return [
              parseFloat(String(matchesPoints.groups['lat'])),
              parseFloat(String(matchesPoints.groups['lng'])),
            ] as const
          })
      )
    )
  }

  try {
    return multiLineSchema.parse(value)
  } catch (e) {
    // Ignore
  }

  return null
}

export function calculatePath<
  L extends MultiLineString | null | undefined,
  P extends { path: L },
>(route: P) {
  return {
    ...route,
    path: getMultiLine(route.path),
  }
}

export function multiLineToString(value: MapMultiLine): MultiLineString {
  return `MultiLineString(${value.map((line) => `(${line.map(([lat, lng]) => `${lng} ${lat}`).join(',')})`).join(',')})`
}

function nullIfHasNull<T>(l1: (T | null)[][]): T[][] | null {
  if (l1.some((l2) => l2.some((l3) => l3 === null))) {
    return null
  }

  return l1 as T[][]
}

export function multiLineFromGeoJson(value: unknown): MapMultiLine | null {
  try {
    const geoJson = GeoJsonSchema.parse(value)
    return geoJson.features.map((feature) => feature.geometry.coordinates)
  } catch (e) {
    return null
  }
}

const GeoJsonSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(
    z.object({
      type: z.literal('Feature'),
      geometry: z.object({
        coordinates: z.array(z.tuple([z.number(), z.number()])),
        type: z.literal('LineString'),
      }),
    })
  ),
})
