import type { Metadata } from 'next'
import { unstable_setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { type FC } from 'react'
import { makeImageUrl } from '~/helpers/images'
import { toLatLng } from '~/helpers/spatial-data/point'
import {
  LocaleRouteParams,
  locales,
  onlyTranslatableLocales,
  parseLocale,
} from '~/i18n'
import { db } from '~/server/db/db'
import { getTrpc } from '~/server/get-server-thing'
import { OverrideMainMap } from '../../_components/override-main-map'
import { PlaceDetails } from './_components/place-details'

type Params = LocaleRouteParams<{ placeId: string }>

export async function generateStaticParams() {
  const queryResult = await db.query.places.findMany({
    columns: { id: true },
  })
  return queryResult.map((place) => ({
    placeId: String(place.id),
  }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const placeId = Number(params.placeId)
  const locale = parseLocale(params.locale)
  const trpc = await getTrpc()
  const place = await trpc.metadata.place({
    locale: onlyTranslatableLocales(params.locale),
    id: placeId,
  })
  if (!place) return {}

  const title = `${place.name}`
  const categoriesList = [
    place.mainCategory.namePlural,
    ...place.categories.map((c) => c.category.namePlural),
  ]
  const description = `${place.description} | ${categoriesList.join(', ')}`
  const alternates = Object.fromEntries(
    locales.map((l) => [l, `/${l}/explore/places/${placeId}`])
  )

  return {
    title,
    description,
    alternates: {
      canonical: `/explore/places/${placeId}`,
      languages: alternates,
    },
    openGraph: {
      title,
      description,
      url: alternates[locale],
      siteName: 'Begur Secret',
      images: place.mainImage
        ? {
            url: makeImageUrl(place.mainImage.key),
            width: place.mainImage.width,
            height: place.mainImage.height,
            alt: place.mainImage.alt ?? undefined,
          }
        : undefined,
      locale,
      type: 'article',
      // modifiedTime: place.updatedAt,
      // publishedTime: place.updatedAt,
      authors: 'Begur Secret',
      tags: [...categoriesList, 'begur', 'costa-brava', 'baix-emporda'],
      section: place.mainCategory.namePlural,
    },
  }
}

const PlacePage: FC<LocaleRouteParams> = async ({ params }) => {
  const locale = parseLocale(params.locale)
  unstable_setRequestLocale(locale)
  const placeId = Number(params.placeId)

  const trpc = await getTrpc()
  const place = await trpc.places.get({
    locale: onlyTranslatableLocales(params.locale),
    id: placeId,
  })
  if (!place) notFound()

  const visitMissions = await trpc.missions.getVisitMissions({
    locale: onlyTranslatableLocales(params.locale),
    placeId,
  })

  const veryEmphasizedMarkers = new Set([placeId])

  return (
    <>
      <OverrideMainMap
        center={toLatLng(place.location)}
        zoom={18}
        veryEmphasizedMarkers={veryEmphasizedMarkers}
      />
      <PlaceDetails place={place} visitMissions={visitMissions} />
    </>
  )
}

export default PlacePage
