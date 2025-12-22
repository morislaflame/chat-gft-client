import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/CoreComponents/Button';
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
      className="p-6"
    >
      <div className="relative">
        <button
          onClick={handleClose}
          className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-700 transition-colors cursor-pointer"
          aria-label={t('close')}
        >
          <i className="fas fa-times text-white text-xl"></i>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-center mb-4"
        >
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
            <i className="fa-solid fa-bolt text-purple-400 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-white">{t('energyInfoTitle')}</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="bg-primary-700/40 border border-primary-600 rounded-lg p-4"
        >
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-200">
            <li>{t('energyInfoP1')}</li>
            <li>{t('energyInfoP2')}</li>
            <li>{t('energyInfoP3')}</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="mt-4"
        >
          <Button
            onClick={handleGoToStore}
            variant="secondary"
            size="md"
            className="w-full mb-2"
            icon="fas fa-arrow-right"
          >
            {t('goToStore')}
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
});

export default EnergyInfoModal;

