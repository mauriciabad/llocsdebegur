import type { Map as LeafletMap } from 'leaflet'
import { FC, PropsWithChildren, Ref } from 'react'
import {
  MapContainer as LMapContainer,
  type MapContainerProps as LMapContainerProps,
} from 'react-leaflet'

export const MapContainer: FC<
  PropsWithChildren<
    LMapContainerProps & {
      forwardedRef?: Ref<LeafletMap> | null
    }
  >
> = ({ forwardedRef, ...props }) => (
  <LMapContainer {...props} ref={forwardedRef} />
)
