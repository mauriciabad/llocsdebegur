'use client'

import { Button } from '@nextui-org/button'
import { useDisclosure } from '@nextui-org/use-disclosure'
import { IconDiscountCheckFilled } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { FC } from 'react'
import { VerificationRequirements } from '~/server/db/constants/verifications'
import {
  OnVerificate,
  VerificatePlaceVisitModal,
} from './verificate-place-visit-modal'

export type VerificateButtonProps = {
  expectedLocation: { x: number; y: number }
  placeId: number
  isAlreadyVisited: boolean
  isAlreadyVerified: boolean
  verificationRequirements: VerificationRequirements | null
  className?: string
  onVerificate?: OnVerificate
  hideIfDone?: boolean
}

export const VerificateButton: FC<VerificateButtonProps> = ({
  placeId,
  expectedLocation,
  isAlreadyVisited,
  isAlreadyVerified,
  verificationRequirements,
  className,
  onVerificate,
  hideIfDone,
}) => {
  const t = useTranslations('missions')
  const {
    isOpen: isVerificateModalOpen,
    onOpen: onVerificateModalOpen,
    onOpenChange: onVerificateModalOpenChange,
  } = useDisclosure()
  const isVerificationRequired =
    verificationRequirements && verificationRequirements.isLocationRequired

  return (
    <>
      {(isVerificationRequired ? isAlreadyVerified : isAlreadyVisited) ? (
        !hideIfDone && (
          <Button
            fullWidth
            color="primary"
            isDisabled
            startContent={<IconDiscountCheckFilled size={20} />}
            className={className}
          >
            {t('visit-already-verified')}
          </Button>
        )
      ) : (
        <Button
          color="primary"
          fullWidth
          onPress={onVerificateModalOpen}
          startContent={<IconDiscountCheckFilled size={20} />}
          className={className}
        >
          {t('verificate-visit')}
        </Button>
      )}

      <VerificatePlaceVisitModal
        isOpen={isVerificateModalOpen}
        onOpenChange={onVerificateModalOpenChange}
        expectedLocation={expectedLocation}
        placeId={placeId}
        onVerificate={onVerificate}
        isAlreadyVisited={isAlreadyVisited}
        verificationRequirements={verificationRequirements}
      />
    </>
  )
}
