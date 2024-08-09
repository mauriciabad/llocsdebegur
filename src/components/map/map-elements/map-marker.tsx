import moize from 'moize'
import { FC, memo, useMemo, useState } from 'react'
import { useMap, useMapEvent } from 'react-leaflet'
import { useRouter } from '~/navigation'
import { NextMarker } from '../leaflet-components/next-js-ready/marker'
import {
  PlaceMarkerLeafletIconProps,
  getPlaceMarkerLeafletDivIcon,
  getPlaceMarkerLeafletIcon,
} from '../utilities/place-marker-svg'

type MapMarkerSize =
  | PlaceMarkerLeafletIconProps['size']
  | 'all-markers'
  | 'not-emphasized'
export type MapMarkerInvariable = {
  placeId: number
  lat: number
  lng: number
  url?: string
  icon: PlaceMarkerLeafletIconProps['icon']
  color: PlaceMarkerLeafletIconProps['color']
}
export type MapMarker = MapMarkerInvariable & {
  zIndexOffset?: number
  disabled?: boolean
  animated?: boolean
  size?: MapMarkerSize
}

export const MapMarker: FC<MapMarker> = memo(
  ({
    lat,
    lng,
    url,
    zIndexOffset,
    disabled,
    size = 'all-markers',
    ...placeMarkerProps
  }) => {
    const router = useRouter()

    const map = useMap()
    const [actualSize, setActualSize] = useState<
      PlaceMarkerLeafletIconProps['size']
    >(calcSize(size, map.getZoom()))

    useMapEvent('zoom', () => {
      const zoom = map.getZoom()
      const newSize = calcSize(size, zoom)
      if (newSize !== actualSize) {
        setActualSize(newSize)
      }
    })

    const iconOptions = useMemo(() => {
      return placeMarkerProps.animated
        ? getPlaceMarkerLeafletDivIcon({
            ...placeMarkerProps,
            size: actualSize,
          })
        : getPlaceMarkerLeafletIcon({
            ...placeMarkerProps,
            size: actualSize,
          })
    }, [placeMarkerProps, actualSize])

    return (
      <NextMarker
        zIndexOffset={zIndexOffset ?? 0}
        position={[lat, lng]}
        interactive={!disabled}
        icon={iconOptions}
        eventHandlers={
          url && !disabled
            ? {
                click: () => {
                  router.push(url)
                },
              }
            : undefined
        }
        keyboard={!disabled}
      />
    )
  }
)

const calcSize = moize((size: MapMarkerSize, zoom: number) => {
  switch (size) {
    case 'all-markers': {
      if (zoom <= 14) return 'xs'
      if (zoom <= 15) return 'sm'
      return 'md'
    }
    case 'not-emphasized': {
      if (zoom <= 15.5) return 'none'
      if (zoom <= 16) return 'xs'
      if (zoom <= 17) return 'sm'
      return 'md'
    }
    default: {
      return size
    }
  }
})
