import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';

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
      <Modal isOpen={isOpen} onClose={handleClose} closeOnOverlayClick={!isLoading} className="p-6">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-0 right-0 w-8 h-8 rounded-full hover:bg-primary-700"
            aria-label={t('close')}
            disabled={isLoading}
            icon="fas fa-times"
          />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-center mb-4"
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <i className="fa-solid fa-gem text-secondary-gradient text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-white">{t('changeReferralCodeTitle')}</h2>
            <p className="text-sm text-gray-300 mt-2">{t('changeReferralCodeDesc')} {costGems} <i className="fa-solid fa-gem text-secondary-gradient text-sm"></i></p>
          </motion.div>

          

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="mt-4"
          >
            <Button
              onClick={handleConfirm}
              variant="gradient"
              size="default"
              className="w-full mb-2"
              icon="fas fa-check"
              disabled={isLoading}
            >
              {isLoading ? t('saving') : t('confirm')}
            </Button>
          </motion.div>
        </div>
      </Modal>
    );
  }
);

export default ReferralCodeChangeConfirmModal;

