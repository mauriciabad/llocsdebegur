import { IconAward, IconBooks } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { FC } from 'react'
import { CategoryTagList } from '~/components/category-tags/category-tag-list'
import { IconTitle } from '~/components/generic/icon-title'
import { MarkdownContent } from '~/components/generic/markdown-content'
import { OptimizedImage } from '~/components/generic/optimized-image'
import { ShareButton } from '~/components/generic/share-button'
import { ApiRouterOutput } from '~/server/api/router'
import { FeaturesBlock } from '../../../../../../../components/features/features-block'
import { VisitMissionsAcordion } from '../../../../missions/_components/visit-missions-acordion'
import { PlaceDetailsVerificateButton } from './place-details-verificate-button'
import { ViewMoreImagesButtonAndDialog } from './view-more-images-button-and-dialog'

type Place = NonNullable<ApiRouterOutput['places']['get']>
type VisitMissions = ApiRouterOutput['missions']['getVisitMissions']

export const PlaceDetails: FC<{
  place: Place
  visitMissions: VisitMissions
}> = ({ place, visitMissions }) => {
  const t = useTranslations('explore')

  return (
    <div className="mt-4 px-4">
      <div className="mb-2 flex">
        <h2 className="grow font-title text-xl font-semibold">{place.name}</h2>
        <ShareButton
          data={{
            title: `${place.name} | Begur Secret`,
            url: `/explore/places/${place.id}`,
            text: place.description ?? undefined,
          }}
        />
      </div>

      {place.description && (
        <p className="text-stone-800">{place.description}</p>
      )}

      <PlaceDetailsVerificateButton
        expectedLocation={place.location}
        placeId={place.id}
        verificationRequirements={place.verificationRequirements}
        isAlreadyVisited={place.visited}
        isAlreadyVerified={place.verifications.length > 0}
        hideIfDone
        className="mt-4"
      />

      {place.mainImage &&
        (place.images && place.images.length >= 1 ? (
          <div className="mt-4 grid grid-cols-[2fr_1fr] grid-rows-2 gap-2">
            <OptimizedImage
              radius="lg"
              shadow="sm"
              className="aspect-[4/3]"
              classNames={{
                wrapper: 'row-span-2',
              }}
              image={place.mainImage}
              alt={place.name}
            />
            <OptimizedImage
              radius="lg"
              shadow="sm"
              alt={place.name}
              full="both"
              image={place.images[0]}
            />
            <ViewMoreImagesButtonAndDialog
              images={
                place.mainImage
                  ? [place.mainImage, ...place.images]
                  : place.images
              }
              buttonText={t('see-more')}
              className="h-full"
            />
          </div>
        ) : (
          <OptimizedImage
            radius="lg"
            shadow="sm"
            alt={place.name}
            className="mt-4 aspect-[4/3] object-cover"
            image={place.mainImage}
          />
        ))}

      <CategoryTagList
        mainCategory={place.mainCategory}
        categories={place.categories.map((c) => c.category)}
        wrap
        className="mt-4"
      />

      <FeaturesBlock
        features={place.features}
        externalLinks={place.externalLinks}
        googleMapsId={place.googleMapsId}
        geoUri={`geo:${place.location.x},${place.location.y}`}
        className="mt-4"
      />

      <IconTitle icon={IconBooks} title={t('detailed-info')} className="mt-4" />
      {place.content ? (
        <MarkdownContent content={place.content} size="sm" />
      ) : (
        <p className="mt-4 py-4 text-center text-sm text-stone-500">
          {t('no-more-info')}
        </p>
      )}

      <IconTitle icon={IconAward} title={t('related-missions')} />
      <VisitMissionsAcordion visitMissions={visitMissions} />
    </div>
  )
}
