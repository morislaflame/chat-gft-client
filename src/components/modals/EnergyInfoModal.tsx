import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import { STORE_ROUTE } from '@/utils/consts';

type EnergyInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const EnergyInfoModal: React.FC<EnergyInfoModalProps> = observer(({ isOpen, onClose }) => {
  const { t } = useTranslate();
  const { hapticImpact } = useHapticFeedback();
  const navigate = useNavigate();

  const handleClose = () => {
    hapticImpact('soft');
    onClose();
  };

  const handleGoToStore = () => {
    hapticImpact('soft');
    onClose();
    navigate(STORE_ROUTE);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={true}
      title={t('energyInfoTitle')}
      headerIcon={<i className="fa-solid fa-bolt text-white text-2xl"></i>}
      headerIconContainerClassName="bg-user-message border border-purple-500/30"
      closeAriaLabel={t('close')}
      footer={
        <Button
          onClick={handleGoToStore}
          variant="gradient"
          size="lg"
          className="w-full"
          icon="fas fa-arrow-right"
        >
          {t('goToStore')}
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
          <li>{t('energyInfoP1')}</li>
          <li>{t('energyInfoP2')}</li>
          <li>{t('energyInfoP3')}</li>
        </ul>
      </motion.div>
    </Modal>
  );
});

export default EnergyInfoModal;

