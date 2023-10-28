'use client'

import { Card, CardBody } from '@nextui-org/card'
import { Image } from '@nextui-org/image'
import { useLocale, useTranslations } from 'next-intl'
import type { FC, HTMLAttributes } from 'react'
import { cn } from '~/helpers/cn'
import { onlyTranslatableLocales } from '~/i18n'
import { trpc } from '~/trpc'

function makeImageUrl<T extends string>(s3key: T | null) {
  if (!s3key) {
    return 'https://descobreix-begur-app-g3qf4o.s3.eu-west-1.amazonaws.com/static/app/content-placeholder.png'
  }
  return `https://descobreix-begur-app-g3qf4o.s3.eu-west-1.amazonaws.com/${s3key}` as const
}

export const PlaceList: FC<Omit<HTMLAttributes<HTMLElement>, 'children'>> = ({
  className,
  ...props
}) => {
  const t = useTranslations('explore.list')
  const locale = useLocale()

  const { data: places, isInitialLoading } = trpc.places.list.useQuery({
    locale: onlyTranslatableLocales(locale),
  })

  if (isInitialLoading) {
    return (
      <div
        className={cn(
          'rounded border border-gray-200 bg-gray-200 px-4 py-2 text-lg',
          className
        )}
        {...props}
      >
        {t('loading')}
      </div>
    )
  }

  return (
    <ul
      className={cn('grid grid-cols-2 gap-2 sm:grid-cols-3', className)}
      {...props}
    >
      {places?.map((place) => (
        <Card
          as="li"
          shadow="sm"
          key={place.id}
          isPressable
          onPress={() => console.log('item pressed')}
        >
          <CardBody className="">
            <Image
              shadow="sm"
              radius="lg"
              width="100%"
              alt={place.name}
              className="aspect-square w-full object-cover"
              src={makeImageUrl(place.mainImage)}
            />
            <p className="mt-4 font-bold">{place.name}</p>
            <p>
              {place.location.lat}, {place.location.lng}
            </p>
          </CardBody>
        </Card>
      ))}
    </ul>
  )
}
