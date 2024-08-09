'use client'

import { Button } from '@nextui-org/button'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  type ModalProps,
} from '@nextui-org/modal'
import {
  IconCircleCheck,
  IconCircleCheckFilled,
  IconCircleOff,
  IconDiscountCheckFilled,
  IconLoader,
  IconLogin2,
  IconQrcodeOff,
  IconUser,
  IconUserPlus,
} from '@tabler/icons-react'
import { useSession } from 'next-auth/react'
import { useLogger } from 'next-axiom'
import { useTranslations } from 'next-intl'
import { FC } from 'react'
import { AlertBox } from '~/components/generic/alert-box'
import { DividerWithText } from '~/components/generic/divider-with-text'
import { ExplanationCard } from '~/components/generic/explanation-card'
import { LinkButton } from '~/components/links/link-button'
import { useRouter } from '~/navigation'
import {
  VerificationRequirements,
  isVerificationRequired,
} from '~/server/db/constants/verifications'
import { trpc } from '~/trpc'
import { useLocationValidator } from '../_hooks/useLocationValidator'

export type OnVerificate = (
  hasBeenVerified: boolean,
  verificationData: {
    location: { x: number; y: number } | null
    accuracy: number | null
  }
) => Promise<void> | void

export const VerificatePlaceVisitModal: FC<
  Omit<ModalProps, 'children'> & {
    onVerificate?: OnVerificate
    expectedLocation: { x: number; y: number }
    placeId: number
    isAlreadyVisited: boolean
    verificationRequirements: VerificationRequirements | null
  }
> = ({
  isOpen,
  onOpenChange,
  onVerificate,
  expectedLocation,
  placeId,
  isAlreadyVisited,
  verificationRequirements,
}) => {
  const t = useTranslations('verificate')
  const { validateLocation, deviceLocationError, loadingDeviceLocation } =
    useLocationValidator(
      expectedLocation,
      verificationRequirements?.maxLocationDistance
    )
  const log = useLogger()
  const { data: session } = useSession()
  const addToVisitedPlacesMutation =
    trpc.placeLists.addToVisitedPlacesList.useMutation()
  const verificateVisitMutation =
    trpc.verifications.verificateVisit.useMutation()
  const router = useRouter()

  const addToVisitedPlaces: OnVerificate = async (
    hasBeenVerified,
    verificationData
  ) => {
    if (!isAlreadyVisited) {
      await addToVisitedPlacesMutation.mutateAsync({
        placeId,
      })
    }
    if (hasBeenVerified) {
      await verificateVisitMutation.mutateAsync({
        placeId,
        deviceLocation: verificationData.location,
        deviceLocationAccuracy: verificationData.accuracy,
      })
    }

    await onVerificate?.(hasBeenVerified, verificationData)
    router.refresh()
  }

  const handleSubmit = async ({
    userId,
    onClose,
  }: {
    userId: string
    onClose: () => void
  }) => {
    if (!verificationRequirements)
      throw new Error('verificationRequirements is null')

    if (verificationRequirements.isLocationRequired) {
      const validatedLocation = await validateLocation()

      if (validatedLocation) {
        log.info('Place visit location verificated', {
          placeId,
          userId,
          deviceLocation: validatedLocation,
        })

        await addToVisitedPlaces(true, {
          location: validatedLocation.location,
          accuracy: validatedLocation.accuracy,
        })

        onClose()
      } else {
        log.error('Place visit location verification failed', {
          placeId,
          userId,
          error: deviceLocationError,
        })
      }
    } else {
      await addToVisitedPlaces(true, { location: null, accuracy: null })
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t('verificate-visit')}
            </ModalHeader>

            {session ? (
              <ModalBody className="block space-y-2 pb-6 pt-0">
                <>
                  {isVerificationRequired(verificationRequirements) ? (
                    <>
                      {verificationRequirements.isLocationRequired && (
                        <>
                          <ExplanationCard
                            icon={IconQrcodeOff}
                            title={t('place-has-no-code')}
                            subtitle={t('use-device-location-to-verificate')}
                          />

                          {deviceLocationError &&
                            (deviceLocationError ===
                            'permission-not-granted-yet' ? (
                              <AlertBox type="warning">
                                {t('grant-location-permission-to-continue')}
                              </AlertBox>
                            ) : (
                              <AlertBox type="error">
                                {t(
                                  `device-location-errors.${deviceLocationError}`
                                )}
                              </AlertBox>
                            ))}
                        </>
                      )}

                      <Button
                        color="primary"
                        fullWidth
                        onPress={async () => {
                          await handleSubmit({
                            onClose,
                            userId: session.user.id,
                          })
                        }}
                        startContent={
                          loadingDeviceLocation ? (
                            <IconLoader size={20} className="animate-spin" />
                          ) : (
                            <IconDiscountCheckFilled size={20} />
                          )
                        }
                        isDisabled={
                          deviceLocationError === 'permission-denied' ||
                          loadingDeviceLocation ||
                          addToVisitedPlacesMutation.isLoading
                        }
                      >
                        {loadingDeviceLocation
                          ? t('accessing-location')
                          : addToVisitedPlacesMutation.isLoading
                            ? t('loading')
                            : t('verificate-visit')}
                      </Button>

                      {!isAlreadyVisited && (
                        <>
                          <DividerWithText text={t('or')} />

                          <Button
                            fullWidth
                            onPress={async () => {
                              await addToVisitedPlaces(false, {
                                location: null,
                                accuracy: null,
                              })
                              onClose()
                            }}
                            startContent={
                              <IconCircleCheck
                                className="text-stone-700"
                                size={20}
                              />
                            }
                            isDisabled={
                              loadingDeviceLocation ||
                              addToVisitedPlacesMutation.isLoading
                            }
                          >
                            {addToVisitedPlacesMutation.isLoading
                              ? t('loading')
                              : t('continue-without-verificating')}
                          </Button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <ExplanationCard
                        icon={IconCircleOff}
                        title={t('place-can-not-be-verificated')}
                        subtitle={t('place-can-not-be-verificated-description')}
                      />
                      <Button
                        fullWidth
                        color="primary"
                        onPress={async () => {
                          await addToVisitedPlaces(false, {
                            location: null,
                            accuracy: null,
                          })
                          onClose()
                        }}
                        startContent={<IconCircleCheckFilled size={20} />}
                        isDisabled={addToVisitedPlacesMutation.isLoading}
                      >
                        {addToVisitedPlacesMutation.isLoading
                          ? t('loading')
                          : t('continue-without-verificating')}
                      </Button>
                    </>
                  )}
                </>
              </ModalBody>
            ) : (
              <ModalBody className="block space-y-2 pb-6 pt-0">
                <>
                  <ExplanationCard
                    icon={IconUser}
                    title={t('login-required')}
                    subtitle={t('login-required-description')}
                  >
                    <div className="flex flex-wrap justify-center gap-2 py-4">
                      <LinkButton
                        href="/profile"
                        startContent={<IconLogin2 size={20} />}
                      >
                        {t('login')}
                      </LinkButton>
                      <LinkButton
                        color="primary"
                        href="/register"
                        startContent={<IconUserPlus size={20} />}
                      >
                        {t('register')}
                      </LinkButton>
                    </div>
                  </ExplanationCard>
                </>
              </ModalBody>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
