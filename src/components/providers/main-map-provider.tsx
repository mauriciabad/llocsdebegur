'use client'

import type { Map as LeafletMap } from 'leaflet'
import {
  FC,
  PropsWithChildren,
  createContext,
  memo,
  useContext,
  useState,
} from 'react'
import { trpc } from '~/trpc'
import { MapLineInvariable } from '../map/map-elements/map-line'
import { MapMarkerInvariable } from '../map/map-elements/map-marker'

export type SetOfMarkers = Set<NonNullable<MapMarkerInvariable['placeId']>>
export type SetOfLines = Set<NonNullable<MapLineInvariable['routeId']>>

const MainMapCtx = createContext<
  Readonly<{
    map: LeafletMap | null
    setMap: (map: LeafletMap | null) => void
    emphasizedMarkers: SetOfMarkers | undefined
    setEmphasizedMarkers: (markers: SetOfMarkers | undefined) => void
    veryEmphasizedMarkers: SetOfMarkers | undefined
    setVeryEmphasizedMarkers: (markers: SetOfMarkers | undefined) => void
    veryEmphasizedLines: SetOfLines | undefined
    setVeryEmphasizedLines: (lines: SetOfLines | undefined) => void
    markers: readonly MapMarkerInvariable[] | undefined
    lines: readonly MapLineInvariable[] | undefined
  }>
>({
  map: null,
  setMap: () => {},
  emphasizedMarkers: undefined,
  setEmphasizedMarkers: () => {},
  veryEmphasizedMarkers: undefined,
  setVeryEmphasizedMarkers: () => {},
  veryEmphasizedLines: undefined,
  setVeryEmphasizedLines: () => {},
  markers: [],
  lines: [],
})

export const useMainMap = () => useContext(MainMapCtx)

export const MainMapProvider: FC<PropsWithChildren> = memo(({ children }) => {
  const [map, setMap] = useState<LeafletMap | null>(null)
  const [emphasizedMarkers, setEmphasizedMarkers] = useState<SetOfMarkers>()
  const [veryEmphasizedMarkers, setVeryEmphasizedMarkers] =
    useState<SetOfMarkers>()
  const [veryEmphasizedLines, setVeryEmphasizedLines] = useState<SetOfLines>()

  const { data: places } = trpc.map.getAllPlaces.useQuery()
  const markers = places?.map((place) => ({
    placeId: place.id,
    lat: place.location.y,
    lng: place.location.x,
    icon: place.mainCategory.icon,
    color: place.mainCategory.color,
    url: `/explore/places/${place.id}`,
    name: place.name,
  }))

  const { data: routes } = trpc.map.getAllRoutes.useQuery()
  const lines = routes?.map((route) => ({
    routeId: route.id,
    color: route.mainCategory.color,
    path: route.path,
    url: `/explore/routes/${route.id}`,
    name: route.name,
    importance: route.importance,
  }))

  return (
    <>
      <MainMapCtx.Provider
        value={{
          map,
          setMap,
          emphasizedMarkers,
          setEmphasizedMarkers,
          veryEmphasizedMarkers,
          setVeryEmphasizedMarkers,
          veryEmphasizedLines,
          setVeryEmphasizedLines,
          markers,
          lines,
        }}
      >
        {children}
      </MainMapCtx.Provider>
    </>
  )
})
