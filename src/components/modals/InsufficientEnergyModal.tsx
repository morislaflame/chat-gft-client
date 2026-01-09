import React, { useContext, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import { QUESTS_ROUTE, STORE_ROUTE } from '@/utils/consts';
import Button from '../CoreComponents/Button';
import { trackEvent } from '@/utils/analytics';

const InsufficientEnergyModal: React.FC = observer(() => {
  const { chat } = useContext(Context) as IStoreContext;
  const { t } = useTranslate();
  const navigate = useNavigate();
  const isOpen = chat.insufficientEnergy;
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      trackedRef.current = false;
      return;
    }
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackEvent('stars_paywall_view', { context: 'energy_depleted' });
    trackEvent('energy_depleted', { balance: null, context: 'story' });
    trackEvent('error_show', { error_area: 'energy', error_code: 'energy_depleted', fatal: 0 });
  }, [isOpen]);

  const handleClose = () => {
    chat.closeInsufficientEnergy();
  };

  const handleGoToStore = () => {
    chat.closeInsufficientEnergy();
    trackEvent('stars_paywall_view', { context: 'energy_depleted', placement: 'modal_to_store' });
    navigate(STORE_ROUTE);
  };

  const handleGoToQuests = () => {
    chat.closeInsufficientEnergy();
    trackEvent('stars_paywall_view', { context: 'energy_depleted', placement: 'modal_to_quests' });
    navigate(QUESTS_ROUTE);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={true}
      className="p-4"
    >
      <div className="relative">
        {/* Header */}
        <div className="text-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: 'spring',
              delay: 0.2,
              bounce: 0.4
            }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg"
          >
            <i className="fa-solid fa-bolt text-white text-4xl"></i>
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {t('insufficientEnergy')}
          </h2>
          <p className="text-gray-400 text-sm">
            {t('insufficientEnergyDesc')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleGoToStore}
            variant="tretiary"
            size="md"
            className="w-full"
            icon="fas fa-store"
          >
           {t('goToStore')}
          </Button>
        </motion.div>

          <p className="text-center text-gray-400 text-xs">{t('insufficientEnergyTasksNote')}</p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleGoToQuests}
              variant="secondary"
              size="md"
              className="w-full"
              icon="fas fa-tasks"
            >
              {t('goToQuests')}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={handleClose}
              variant="default"
              size="md"
              className="w-full"
            >
              {t('cancel')}
            </Button>
          </motion.div>

        </div>
      </div>
    </Modal>
  );
});

export default InsufficientEnergyModal;

