import React from 'react';
import { observer } from 'mobx-react-lite';

import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';

type ReferralCodeChangeConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  nextRefCode: string;
  costGems: number;
};

const ReferralCodeChangeConfirmModal: React.FC<ReferralCodeChangeConfirmModalProps> = observer(
  ({ isOpen, onClose, onConfirm, isLoading = false, costGems }) => {
    const { t } = useTranslate();
    const { hapticImpact } = useHapticFeedback();

    const handleClose = () => {
      if (isLoading) return;
      hapticImpact('soft');
      onClose();
    };

    const handleConfirm = () => {
      if (isLoading) return;
      hapticImpact('soft');
      onConfirm();
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        closeOnOverlayClick={!isLoading}
        swipeToClose={!isLoading}
        closeDisabled={isLoading}
        closeAriaLabel={t('close')}
        title={t('changeReferralCodeTitle')}
        description={
          <span>
            {t('changeReferralCodeDesc')} {costGems}{' '}
            <i className="fa-solid fa-gem text-secondary-gradient text-sm"></i>
          </span>
        }
        headerIcon={<i className="fa-solid fa-gem text-secondary-gradient text-2xl"></i>}
        headerIconContainerClassName="bg-amber-500/15 border border-amber-500/30"
        footer={
          <Button
            onClick={handleConfirm}
            variant="gradient"
            size="lg"
            className="w-full"
            icon="fas fa-check"
            disabled={isLoading}
          >
            {isLoading ? t('saving') : t('confirm')}
          </Button>
        }
      >
      </Modal>
    );
  }
);

export default ReferralCodeChangeConfirmModal;

