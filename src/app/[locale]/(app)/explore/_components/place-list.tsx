'use client'

import { Card, CardBody } from '@nextui-org/card'
import { Image } from '@nextui-org/image'
import { LatLngLiteral } from 'leaflet'
import Link from 'next-intl/link'
import { FC } from 'react'

function makeImageUrl<T extends string>(s3key: T | null) {
  if (!s3key) {
    return 'https://descobreix-begur-app-g3qf4o.s3.eu-west-1.amazonaws.com/static/app/content-placeholder.png'
  }
  return `https://descobreix-begur-app-g3qf4o.s3.eu-west-1.amazonaws.com/${s3key}` as const
}

export const PlaceList: FC<{
  places: {
    id: number
    mainImage: string | null
    location: LatLngLiteral
    name: string
  }[]
}> = ({ places }) => {
  return (
    <ul className="space-y-4">
      {places?.map((place) => (
        <Card
          as={Link}
          shadow="none"
          radius="md"
          key={place.id}
          isPressable
          href={`/explore/places/${place.id}`}
        >
          <CardBody className="grid grid-cols-[1fr_auto] p-0">
            <div>
              <h2 className="font-title font-bold">{place.name}</h2>
              <p className="text-sm text-gray-500">
                {place.location.lat}, {place.location.lng}
              </p>
            </div>
            <Image
              radius="md"
              alt={place.name}
              className="z-0 aspect-square h-16 object-cover"
              src={makeImageUrl(place.mainImage)}
            />
          </CardBody>
        </Card>
      ))}
    </ul>
  )
}
