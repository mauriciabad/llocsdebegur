'use client'

import { Button } from '@nextui-org/button'
import { Input } from '@nextui-org/input'
import {
  Selection,
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/table'
import { Tooltip } from '@nextui-org/tooltip'
import {
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { FC, useCallback, useMemo, useState } from 'react'
import { SelectPlaceCategory } from '~/components/admin-only/select-place-category'
import { CategoryTagList } from '~/components/category-tags/category-tag-list'
import { MarkdownContent } from '~/components/generic/markdown-content'
import { cn } from '~/helpers/cn'
import { Link } from '~/navigation'
import { ApiRouterOutput } from '~/server/api/router'

type Place = ApiRouterOutput['admin']['places']['list'][number]

const columns = [
  {
    key: 'id',
    sortable: true,
    align: 'end',
  },
  {
    key: 'name',
    sortable: true,
    align: 'start',
  },
  {
    key: 'categories',
    sortable: true,
    align: 'start',
  },
  {
    key: 'images',
    sortable: true,
    align: 'start',
  },
  {
    key: 'content',
    sortable: true,
    align: 'start',
  },
  {
    key: 'missingInfo',
    sortable: true,
    align: 'center',
  },
  {
    key: 'importance',
    sortable: true,
    align: 'center',
  },
  {
    key: 'actions',
    sortable: false,
    align: 'center',
  },
] as const satisfies {
  key: keyof Place | 'actions' | 'missingInfo' | 'images'
  sortable: boolean
  align: 'center' | 'start' | 'end' | undefined
}[]

type Column = (typeof columns)[number]
type ColumnKey = Column['key']
type SortableColumnKey<T = Column> = T extends { sortable: true; key: infer ID }
  ? ID
  : never

const getSortValue = (item: Place, columnKey: SortableColumnKey) => {
  switch (columnKey) {
    case 'categories':
      return item.mainCategory.name
    case 'missingInfo':
      return item.features.hasMissingInfo
    case 'images':
      return Boolean(item.mainImage?.id)
    case 'content':
      return Boolean(item.content)
    default:
      return item[columnKey]
  }
}

export const PlacesTable: FC<{
  places: Place[]
  className?: string
}> = ({ className, places }) => {
  const t = useTranslations('admin-places-and-routes')

  const [filterValue, setFilterValue] = useState('')

  const [mainCategoryFilter, setMainCategoryFilter] = useState<Selection>(
    new Set()
  )
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'id',
    direction: 'ascending',
  })

  const hasSearchFilter = Boolean(filterValue)

  const filteredItems = useMemo(() => {
    let filteredUsers = [...places]

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((place) =>
        place.name.toLowerCase().includes(filterValue.toLowerCase())
      )
    }
    if (mainCategoryFilter !== 'all' && mainCategoryFilter.size !== 0) {
      filteredUsers = filteredUsers.filter((place) =>
        mainCategoryFilter.has(place.mainCategory.id.toString())
      )
    }

    return filteredUsers
  }, [places, filterValue, mainCategoryFilter])

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a: Place, b: Place) => {
      const columnKey = sortDescriptor.column as SortableColumnKey
      const first = getSortValue(a, columnKey)
      const second = getSortValue(b, columnKey)
      const cmp =
        first !== null && second !== null
          ? first < second
            ? -1
            : first > second
              ? 1
              : 0
          : first === null
            ? 1
            : -1

      return sortDescriptor.direction === 'descending' ? -cmp : cmp
    })
  }, [sortDescriptor, filteredItems])

  const renderCell = useCallback((place: Place, columnKey: ColumnKey) => {
    switch (columnKey) {
      case 'name':
        return (
          <>
            <p className="font-semibold">{place.name}</p>
            <p className="line-clamp-2 text-xs text-gray-600">
              {place.description}
            </p>
          </>
        )
      case 'content':
        return place.content ? (
          <Tooltip content={<MarkdownContent content={place.content} />}>
            <span>✔</span>
          </Tooltip>
        ) : (
          '❌'
        )
      case 'images':
        return place.mainImage?.id ? '✔' : '❌'
      case 'missingInfo':
        return place.features.hasMissingInfoNotes ? (
          <Tooltip content={place.features.hasMissingInfoNotes}>
            <span>
              {place.features.hasMissingInfo === null
                ? '?'
                : place.features.hasMissingInfo
                  ? '❌'
                  : '✔'}
            </span>
          </Tooltip>
        ) : (
          place.features.hasMissingInfo !== null &&
            (place.features.hasMissingInfo ? '❌' : '✔')
        )
      case 'categories':
        return (
          <CategoryTagList
            mainCategory={place.mainCategory}
            categories={place.categories.map((c) => c.category)}
            wrap
          />
        )
      case 'actions':
        return (
          <div className="relative flex items-center">
            <Tooltip content={t('actions.view')}>
              <Button
                href={`/explore/places/${place.id}`}
                as={Link}
                variant="light"
                radius="sm"
                isIconOnly
                className="h-unit-8 w-unit-8 min-w-unit-8 text-default-600"
              >
                <IconEye />
              </Button>
            </Tooltip>
            <Tooltip content={t('actions.edit')}>
              <Button
                href={`/admin/places/${place.id}`}
                as={Link}
                variant="light"
                radius="sm"
                isIconOnly
                className="h-unit-8 w-unit-8 min-w-unit-8 text-default-600"
              >
                <IconEdit />
              </Button>
            </Tooltip>
            <Tooltip color="danger" content={t('actions.delete')}>
              <Button
                onPress={() => {
                  alert(t('delete-unsupported'))
                }}
                variant="light"
                radius="sm"
                isIconOnly
                color="danger"
                className="h-unit-8 w-unit-8 min-w-unit-8 text-default-600 hover:text-danger"
              >
                <IconTrash />
              </Button>
            </Tooltip>
          </div>
        )
      default:
        return place[columnKey]
    }
  }, [])

  const onSearchChange = useCallback((value?: string) => {
    setFilterValue(value ?? '')
  }, [])

  const onClear = useCallback(() => {
    setFilterValue('')
  }, [])

  const topContent = useMemo(() => {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        <div className="flex flex-col-reverse items-end justify-between gap-3 xs:flex-row">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            classNames={{
              inputWrapper: 'h-unit-10',
            }}
            placeholder={t('search-placeholder')}
            startContent={<IconSearch />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex flex-1 items-center justify-end gap-3">
            <span className="hidden whitespace-nowrap text-right text-small text-default-400 sm:inline-block">
              {t('total', { total: sortedItems.length })}
            </span>
            <SelectPlaceCategory
              onSelectionChange={setMainCategoryFilter}
              selectedKeys={mainCategoryFilter}
              label={t('columns.categories')}
              selectionMode="multiple"
              size="sm"
              className="max-w-64"
            />

            <Button
              href="/admin/places/new"
              as={Link}
              color="primary"
              endContent={<IconPlus className="flex-shrink-0" />}
            >
              {t('add-new')}
            </Button>
          </div>
        </div>
      </div>
    )
  }, [
    filterValue,
    sortedItems,
    mainCategoryFilter,
    onSearchChange,
    hasSearchFilter,
  ])

  return (
    <Table
      selectionMode="single"
      selectionBehavior="replace"
      isHeaderSticky
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.key}
            align={column.align}
            allowsSorting={column.sortable}
            className="uppercase"
          >
            {t(`columns.${column.key}`)}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent={t('nothing-found')} items={sortedItems}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey as ColumnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
