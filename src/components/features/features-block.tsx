import { Card, CardBody } from '@nextui-org/card'
import { Image } from '@nextui-org/image'
import { Tooltip } from '@nextui-org/tooltip'
import {
  Icon,
  IconExternalLink,
  IconInfoCircle,
  IconWorld,
} from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { FC, PropsWithChildren, useMemo } from 'react'
import { MarkdownContent } from '~/components/generic/markdown-content'
import { cn } from '~/helpers/cn'
import { makeGoogleMapsUrl } from '~/helpers/data/google-maps-id'
import { sortByIsOfficialWebsite } from '~/helpers/sortBy'
import { IntlMessageKeys } from '~/helpers/types'
import { Link } from '~/navigation'
import { ExternalLink } from '~/server/db/constants/externalLinks'
import { Features } from '~/server/db/constants/features'
import {
  featureDisplayGroups,
  getCompositeFeatureKey,
  getCompositeFeatureValues,
  getIconForFeature,
  nestedT,
  useFeatureDisplay,
} from '~/server/db/constants/features-display-data'
import { getLinkData } from './named-websites'

export const FeaturesBlock: FC<{
  features: Features
  className?: string
  externalLinks?: ExternalLink[]
  googleMapsId?: string | null
  geoUri?: string | null
}> = ({ features, className, externalLinks, googleMapsId, geoUri }) => {
  const t = useTranslations('data.features')
  const t2 = useTranslations('explore')

  const { allValuesNull, allValuesNullInGroup, getMoreInfoContent } =
    useFeatureDisplay(features)

  const sortedExternalLinks = useMemo(
    () => externalLinks?.sort(sortByIsOfficialWebsite),
    [externalLinks]
  )

  const hasExternalLinks = useMemo(() => {
    return (
      (sortedExternalLinks && sortedExternalLinks.length > 0) ||
      !!googleMapsId ||
      !!geoUri
    )
  }, [externalLinks, googleMapsId, geoUri])

  if (allValuesNull && !hasExternalLinks) return null

  const thereIsJustOneGroup =
    Object.values(allValuesNullInGroup).filter((v) => !v).length === 1

  return (
    <Card className={cn('bg-cream', className)} radius="lg" shadow="none">
      <CardBody className="gap-4">
        {featureDisplayGroups.map(
          (group) =>
            !allValuesNullInGroup[group.key] && (
              <FeatureList
                key={group.key}
                title={
                  thereIsJustOneGroup
                    ? t('titles.features')
                    : t(`titles.${group.key}`)
                }
                variant={group.key === 'notes' ? 'blocks' : 'items'}
              >
                {group.featureDisplays.map((featureDisplay) => {
                  if ('hidden' in featureDisplay && featureDisplay.hidden) {
                    return null
                  }

                  switch (featureDisplay.type) {
                    case 'number':
                    case 'text': {
                      const value = features[featureDisplay.key]
                      if (value === null || value === undefined) return null

                      if (
                        'showRaw' in featureDisplay &&
                        featureDisplay.showRaw
                      ) {
                        return (
                          <FeatureItem
                            as="li"
                            key={featureDisplay.key}
                            icon={featureDisplay.icon}
                            text={String(value)}
                            moreInfo={getMoreInfoContent(featureDisplay)}
                          />
                        )
                      } else {
                        return (
                          <FeatureItem
                            as="li"
                            key={featureDisplay.key}
                            icon={featureDisplay.icon}
                            text={t(
                              `values.${`${featureDisplay.type}.${featureDisplay.key}` as IntlMessageKeys<'data.features.values'>}`,
                              {
                                value,
                              }
                            )}
                            moreInfo={getMoreInfoContent(featureDisplay)}
                          />
                        )
                      }
                    }
                    case 'markdown': {
                      const value = features[featureDisplay.key]
                      if (value === null || value === undefined) return null
                      return (
                        <MarkdownFeatureItem
                          key={featureDisplay.key}
                          icon={featureDisplay.icon}
                          label={t(`labels.${featureDisplay.key}`)}
                          content={value}
                        />
                      )
                    }
                    case 'enum': {
                      const value = features[featureDisplay.key]
                      if (value === null || value === undefined) return null

                      return (
                        <FeatureItem
                          as="li"
                          key={featureDisplay.key}
                          icon={getIconForFeature(featureDisplay, value)}
                          text={t(
                            `values.enum.${`${featureDisplay.key}.${value}` as IntlMessageKeys<'data.features.values.enum'>}`
                          )}
                          moreInfo={getMoreInfoContent(featureDisplay)}
                        />
                      )
                    }
                    case 'boolean': {
                      const value = features[featureDisplay.key]
                      if (value === null || value === undefined) return null

                      return (
                        <BooleanFeatureItem
                          key={featureDisplay.key}
                          icon={getIconForFeature(featureDisplay, true)}
                          iconOff={getIconForFeature(featureDisplay, false)}
                          text={t(
                            `values.boolean.${featureDisplay.key}.${value}`
                          )}
                          value={value}
                          moreInfo={getMoreInfoContent(featureDisplay)}
                        />
                      )
                    }
                    case 'composite': {
                      const values = getCompositeFeatureValues(
                        featureDisplay,
                        features
                      )

                      if (!values) return null

                      const key = getCompositeFeatureKey(featureDisplay.keys)
                      return (
                        <FeatureItem
                          as="li"
                          key={key}
                          icon={featureDisplay.icon}
                          text={nestedT(t, `values.composite.${key}`, values)}
                          moreInfo={getMoreInfoContent(featureDisplay)}
                        />
                      )
                    }
                  }
                })}
              </FeatureList>
            )
        )}

        {hasExternalLinks && (
          <FeatureList title={t('titles.links')} variant="small-items">
            {sortedExternalLinks?.map((link) => (
              <LinkFeatureItem key={link.id} link={link} />
            ))}
            {googleMapsId && (
              <LinkFeatureItem
                link={{
                  url: makeGoogleMapsUrl(googleMapsId),
                  title: null,
                }}
              />
            )}
            {!!geoUri && (
              <LinkFeatureItem
                link={{
                  url: geoUri,
                  title: t2('maps-app'),
                }}
                icon={IconExternalLink}
              />
            )}
          </FeatureList>
        )}
      </CardBody>
    </Card>
  )
}

const FeatureItem: FC<{
  icon: Icon
  favicon?: string
  href?: string
  text: string
  moreInfo?: string | null
  as?: 'li' | 'div'
  classNames?: {
    text?: string
  }
}> = ({
  icon,
  text,
  moreInfo,
  as: htmlAs = 'div',
  favicon,
  classNames,
  href,
}) => {
  const Icon = icon
  const Component = htmlAs

  const content = (
    <>
      {favicon ? (
        <Image
          src={favicon}
          alt=""
          width={18}
          height={18}
          removeWrapper
          className="aspect-square object-contain"
          radius="none"
        />
      ) : (
        <Icon size={18} className="shrink-0 text-stone-800" />
      )}

      <span
        className={cn(
          'text-sm font-medium text-stone-800 decoration-stone-400',
          href && 'underline',
          classNames?.text
        )}
      >
        {text}

        {moreInfo && (
          <IconInfoCircle
            size={16}
            className="ml-1 box-content inline-block shrink-0 text-stone-400"
          />
        )}
      </span>
    </>
  )

  const item = (
    <Component className="flex items-start gap-2">
      {href ? (
        <Link className="contents" href={href}>
          {content}
        </Link>
      ) : (
        content
      )}
    </Component>
  )

  return (
    <>
      {moreInfo ? (
        <Tooltip
          content={
            <MarkdownContent className="text-stone-800" content={moreInfo} />
          }
        >
          {item}
        </Tooltip>
      ) : (
        item
      )}
    </>
  )
}

const MarkdownFeatureItem: FC<{
  icon: Icon
  label: string
  content: string
}> = ({ icon, label, content }) => {
  return (
    <li>
      <FeatureItem icon={icon} text={label} />
      <MarkdownContent
        className="px-1 text-sm text-stone-800"
        content={content}
      />
    </li>
  )
}

const BooleanFeatureItem: FC<{
  icon: Icon
  iconOff?: Icon
  text: string
  textOff?: string
  value: boolean | null
  moreInfo?: string | null
}> = ({ icon, iconOff, text, textOff, value, moreInfo }) => {
  if (value === null || value === undefined) return null

  return (
    <>
      {value ? (
        <FeatureItem as="li" icon={icon} text={text} moreInfo={moreInfo} />
      ) : (
        (textOff || iconOff) && (
          <FeatureItem
            as="li"
            icon={iconOff ?? icon}
            text={textOff ?? text}
            moreInfo={moreInfo}
          />
        )
      )}
    </>
  )
}
const LinkFeatureItem: FC<{
  link: Pick<ExternalLink, 'title' | 'url'>
  icon?: Icon
}> = ({ link, icon }) => {
  const { name, favicon } = getLinkData(link)
  return (
    <FeatureItem
      href={link.url}
      icon={icon ?? IconWorld}
      text={name}
      favicon={favicon}
      classNames={{
        text: 'truncate',
      }}
    />
  )
}

const FeatureList: FC<
  PropsWithChildren<{
    title: string
    variant?: 'items' | 'blocks' | 'small-items'
  }>
> = ({ title, children, variant }) => {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold leading-none text-foreground-700">
        {title}
      </h4>
      <ul
        className={cn('grid gap-2 pl-1', {
          'xs2:grid-cols-2': variant === 'items',
          'sm:grid-cols-2': variant === 'blocks',
          'xs2:grid-cols-2 xs:grid-cols-3': variant === 'small-items',
        })}
      >
        {children}
      </ul>
    </div>
  )
}
