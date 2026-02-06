import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import { REWARDS_ROUTE } from '@/utils/consts';

type GemsInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const GemsInfoModal: React.FC<GemsInfoModalProps> = observer(({ isOpen, onClose }) => {
  const { t } = useTranslate();
  const { hapticImpact } = useHapticFeedback();
  const navigate = useNavigate();

  const handleClose = () => {
    hapticImpact('soft');
    onClose();
  };

  const handleGoToRewards = () => {
    hapticImpact('soft');
    onClose();
    navigate(REWARDS_ROUTE);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={true}
      title={t('gemsInfoTitle')}
      headerIcon={<i className="fa-solid fa-gem text-white text-2xl"></i>}
      headerIconContainerClassName="bg-secondary-gradient border border-amber-500/30"
      closeAriaLabel={t('close')}
      footer={
        <Button
          onClick={handleGoToRewards}
          variant="secondary"
          size="lg"
          className="w-full"
          icon="fas fa-arrow-right"
        >
          {t('goToRewards')}
        </Button>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="bg-primary-700 border border-primary-600 rounded-lg p-4"
      >
        <ul className="list-disc pl-5 space-y-2 text-md text-gray-200">
          <li>{t('gemsInfoP1')}</li>
          <li>{t('gemsInfoP2')}</li>
          <li>{t('gemsInfoP3')}</li>
        </ul>
      </motion.div>
    </Modal>
  );
});

export default GemsInfoModal;

