import { Card } from '@nextui-org/card'
import { Input } from '@nextui-org/input'
import { Button } from '@nextui-org/react'
import { IconArrowBackUp } from '@tabler/icons-react'
import { FC } from 'react'
import { Map } from '~/components/map/map'
import { cn } from '~/helpers/cn'

export const MapPointSelector: FC<{
  isInvalid?: boolean
  errorMessage?: string
  label?: string
  value?: string | undefined
  onChange: (e: { target: { value: string | undefined } }) => void
  onBlur: () => void
  reset?: () => void
  className?: string
}> = ({
  isInvalid,
  errorMessage,
  label,
  value,
  onChange,
  onBlur,
  className,
  reset,
}) => {
  const valueAsMapPoint = stringToMapPoint(value)

  return (
    <div className={cn('flex h-96 flex-col', className)}>
      <p className="mb-1">{label}</p>

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <Card
        radius="sm"
        className={cn(
          {
            'border-2 border-red-500': isInvalid,
          },
          'relative grow'
        )}
      >
        <div className="absolute inset-x-2 top-2 z-10 flex w-auto items-center gap-2">
          <Input
            isInvalid={isInvalid}
            onBlur={onBlur}
            onChange={onChange}
            value={value}
            label={label}
            className="shadow-lg"
            placeholder="Lng, Lat"
          />
          {reset && (
            <Button
              onPress={reset}
              size="lg"
              isIconOnly
              variant="solid"
              className="mr-1 bg-white shadow-lg"
            >
              <IconArrowBackUp />
            </Button>
          )}
        </div>
        <Map
          className="h-full w-full rounded-md"
          onValueChange={(newValue) => {
            const newValueString = newValue
              ? `${newValue.lng}, ${newValue.lat}`
              : undefined

            onChange({ target: { value: newValueString } })
            onBlur()
          }}
          value={valueAsMapPoint}
          fullControl
          disableMarkers
          zoom={valueAsMapPoint ? 18 : undefined}
        />
      </Card>
    </div>
  )
}

function stringToMapPoint(value: string | undefined) {
  const [lat, lng] = (value?.split(',') ?? []).map((v) => Number(v))

  return !isNaN(lat) && !isNaN(lng) ? { lat, lng } : undefined
}
