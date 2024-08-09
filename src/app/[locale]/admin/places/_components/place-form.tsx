'use client'

import { Checkbox } from '@nextui-org/checkbox'
import { Input, Textarea } from '@nextui-org/input'
import { Button } from '@nextui-org/react'
import { IconExternalLink } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { FC, useState } from 'react'
import { Controller } from 'react-hook-form'
import { ExternalLinksEditor } from '~/components/admin-only/external-links-editor'
import { FeaturesEditor } from '~/components/admin-only/features-editor'
import { SelectPlaceCategory } from '~/components/admin-only/select-place-category'
import { MarkdownEditor } from '~/components/generic/markdown-editor'
import {
  SafeForm,
  SafeSubmitButton,
  useSafeForm,
} from '~/components/generic/safe-form'
import { MapPointSelector } from '~/components/map/map-elements/map-point-selector'
import { cn } from '~/helpers/cn'
import { revalidateAll } from '~/helpers/revalidate-all'
import { Link, useRouter } from '~/navigation'
import { createPlaceSchema } from '~/schemas/places'
import { ApiRouterOutput } from '~/server/api/router'
import { trpc } from '~/trpc'
import {
  getGoogleMapsIdFromUrl,
  makeGoogleMapsUrl,
} from '../../../../../helpers/data/google-maps-id'
import { UploadPlaceImageModal } from './upload-place-image-modal'

type Place = NonNullable<ApiRouterOutput['admin']['places']['get']>

export const PlaceForm: FC<{
  place?: Place
  className?: string
}> = ({ className, place }) => {
  const t = useTranslations('admin-places-and-routes')
  const router = useRouter()

  const utils = trpc.useUtils()
  const createPlaceMutation = trpc.admin.places.createPlace.useMutation({
    onSuccess() {
      utils.admin.places.list.invalidate()
      utils.admin.places.get.invalidate()
    },
  })
  const editPlaceMutation = trpc.admin.places.editPlace.useMutation({
    onSuccess() {
      utils.admin.places.list.invalidate()
      utils.admin.places.get.invalidate()
    },
  })

  const form = useSafeForm({
    schema: createPlaceSchema,
    defaultValues: place
      ? {
          name: place.name,
          description: place.description ?? undefined,
          mainCategory: place.mainCategory.id,
          categories: place.categories.map((c) => c.category.id).join(','),
          location: `${place.location.x}, ${place.location.y}`,
          importance: place.importance,
          mainImageId: place.mainImage?.id ?? undefined,
          content: place.content ?? undefined,
          features: place.features,
          externalLinks: place.externalLinks,
          googleMapsId: place.googleMapsId,
        }
      : {
          name: undefined,
          description: undefined,
          mainCategory: undefined,
          categories: '',
          location: undefined,
          importance: undefined,
          mainImageId: undefined,
          content: undefined,
          features: {},
          externalLinks: [],
        },
  })

  const [stayOnPage, setStayOnPage] = useState(false)

  const isCreateForm = !place

  return (
    <>
      <h1 className="text-2xl font-bold">
        {isCreateForm ? t('create') : t('edit')}
      </h1>
      <p className="text-lg text-red-500">CATALAN ONLY</p>

      <SafeForm
        form={form}
        handleSubmit={async (values) => {
          if (isCreateForm) {
            await createPlaceMutation.mutateAsync(values)
          } else {
            await editPlaceMutation.mutateAsync({
              ...values,
              id: place.id,
            })
          }

          await revalidateAll()

          if (!stayOnPage) {
            return router.push('/admin/places/')
          }

          if (isCreateForm) form.reset()
        }}
        className={cn('space-y-4', className)}
      >
        <div className="grid gap-4 sm:grid-cols-4 lg:grid-cols-5">
          <Controller
            name="name"
            control={form.control}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                isInvalid={!!error}
                errorMessage={error?.message}
                onBlur={onBlur}
                onChange={onChange}
                value={value}
                label={t('labels.name')}
                className="sm:col-span-3 lg:col-span-4"
              />
            )}
          />
          <Controller
            name="importance"
            control={form.control}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                type="number"
                isInvalid={!!error}
                errorMessage={error?.message}
                onBlur={onBlur}
                onChange={onChange}
                value={value?.toString()}
                label={t('labels.importance')}
              />
            )}
          />
        </div>
        <Controller
          name="description"
          control={form.control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Textarea
              isInvalid={!!error}
              errorMessage={error?.message}
              onBlur={onBlur}
              onChange={onChange}
              value={value ?? undefined}
              label={t('labels.description')}
            />
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Controller
            name="mainCategory"
            control={form.control}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <SelectPlaceCategory
                isInvalid={!!error}
                errorMessage={error?.message}
                onBlur={onBlur}
                onChange={onChange}
                selectedKeys={value ? [String(value)] : []}
                label={t('labels.mainCategory')}
              />
            )}
          />

          <Controller
            name="categories"
            control={form.control}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <SelectPlaceCategory
                isInvalid={!!error}
                errorMessage={error?.message}
                onBlur={onBlur}
                onChange={onChange}
                selectedKeys={value ? value.split(',') : []}
                label={t('labels.categories')}
                selectionMode="multiple"
                className="sm:col-span-2 lg:col-span-3"
              />
            )}
          />
        </div>

        <div className="flex items-center gap-4">
          <Controller
            name="googleMapsId"
            control={form.control}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <>
                <Input
                  isInvalid={!!error}
                  errorMessage={error?.message}
                  onBlur={() => {
                    const idFromUrl = getGoogleMapsIdFromUrl(value)
                    if (idFromUrl) onChange({ target: { value: idFromUrl } })

                    onBlur()
                  }}
                  onChange={onChange}
                  value={value ?? undefined}
                  label={t('labels.googleMapsId')}
                />
                <Button
                  as={Link}
                  href={makeGoogleMapsUrl(value) ?? ''}
                  target="_blank"
                  isIconOnly
                  size="lg"
                  isDisabled={!value}
                >
                  <IconExternalLink />
                </Button>
              </>
            )}
          />
        </div>

        <Controller
          name="mainImageId"
          control={form.control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <UploadPlaceImageModal
              isInvalid={!!error}
              errorMessage={error?.message}
              onBlur={onBlur}
              onChange={onChange}
              value={value}
              label={t('labels.mainImage')}
            />
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="content"
            control={form.control}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <MarkdownEditor
                isInvalid={!!error}
                errorMessage={error?.message}
                onBlur={onBlur}
                onChange={onChange}
                value={value}
                label={t('labels.content')}
              />
            )}
          />

          <div className="relative flex-1 basis-64">
            <Controller
              name="location"
              control={form.control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <MapPointSelector
                  isInvalid={!!error}
                  errorMessage={error?.message}
                  onBlur={onBlur}
                  onChange={onChange}
                  value={value}
                  label={t('labels.location')}
                  reset={() => form.resetField('location', { keepDirty: true })}
                />
              )}
            />
          </div>
        </div>

        <FeaturesEditor label={t('labels.features')} />

        <ExternalLinksEditor label={t('labels.externalLinks')} />

        <div className="sticky bottom-4 z-10 mt-8 flex items-center justify-start gap-4">
          <SafeSubmitButton color="primary" size="lg" />
          <Checkbox isSelected={stayOnPage} onValueChange={setStayOnPage}>
            {isCreateForm ? t('do-more') : t('keep-editing')}
          </Checkbox>
        </div>
      </SafeForm>
    </>
  )
}
