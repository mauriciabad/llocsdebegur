'use client'

import { IconFocus2 } from '@tabler/icons-react'
import { Map as LeafletMap, LeafletMouseEvent, divIcon } from 'leaflet'
import { FC, memo, useCallback, useEffect, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MapContainer, Marker } from 'react-leaflet'
import { cn } from '~/helpers/cn'
import { MapPoint } from '~/helpers/spatial-data/point'
import { CustomLayersControl, LayerId } from './custom-layers-controls'
import { CustomLocationControl } from './custom-location-control'
import { useMapResize } from './useMapResize'

import 'leaflet.locatecontrol'
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css'
import 'leaflet/dist/leaflet.css'
import { MapMarker } from './map-marker'

const DEFAULT_CENTER = {
  lat: 41.953,
  lng: 3.2137,
} as const satisfies MapPoint

export const mapContainerClassName = 'z-0 h-64 w-full'

export const MapRaw: FC<{
  center?: MapPoint
  className?: string
  zoom?: number
  fullControl?: boolean
  markers?: MapMarker[]
  classNames?: {
    controls?: string
  }
  disableMarkers?: boolean
  onValueChange?: (location: MapPoint | undefined) => void
  value?: MapPoint
  defaultLayer?: LayerId
  innerRef?: (instance: LeafletMap | null) => void
}> = memo(
  ({
    center = DEFAULT_CENTER,
    className,
    markers,
    fullControl,
    zoom: initialZoom = 14,
    classNames = {},
    disableMarkers,
    onValueChange,
    value,
    defaultLayer,
  }) => {
    const [map, setMap] = useState<LeafletMap | null>(null)

    useMapResize(map)

    const onClick = useCallback(
      (e: LeafletMouseEvent) => {
        onValueChange?.(e.latlng)
      },
      [onValueChange]
    )

    useEffect(() => {
      if (map) {
        map.on('click', onClick)
        return () => {
          map.off('click', onClick)
        }
      }
    }, [map, onClick])

    return (
      <MapContainer
        center={value ?? center}
        zoom={initialZoom}
        zoomControl={false}
        scrollWheelZoom={fullControl}
        doubleClickZoom={fullControl}
        touchZoom={fullControl}
        dragging={fullControl}
        keyboard={fullControl}
        className={cn(mapContainerClassName, className)}
        ref={setMap}
        attributionControl={false}
        zoomSnap={0.5}
      >
        {markers?.map((placeMarkerProps) => (
          <MapMarker
            key={`${placeMarkerProps.lat}-${placeMarkerProps.lng}-${placeMarkerProps.placeId}`}
            disabled={disableMarkers}
            {...placeMarkerProps}
          />
        ))}

        {value && (
          <Marker
            position={value}
            interactive={false}
            key={`${value.lat}-${value.lng}-selected`}
            icon={divIcon({
              html: renderToStaticMarkup(
                <div className="relative">
                  <IconFocus2
                    className="absolute inset-0 !-z-10 text-black/60"
                    size={48}
                    stroke={4}
                  />
                  <IconFocus2
                    className="z-10 text-white"
                    size={48}
                    stroke={1}
                  />
                </div>
              ),
              iconSize: [0, 0],
              className:
                '!flex justify-center items-center border-0 bg-none [&>*]:shrink-0',
            })}
          />
        )}

        <div
          className={cn(
            'absolute bottom-4 right-4 z-[1000] flex flex-col-reverse gap-2',
            classNames.controls
          )}
        >
          <CustomLayersControl
            hide={!fullControl}
            defaultLayer={defaultLayer}
          />
          <CustomLocationControl hide={!fullControl} />
        </div>
      </MapContainer>
    )
  }
)
