import React, { useContext, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import { QUESTS_ROUTE, STORE_ROUTE } from '@/utils/consts';
import Button from '@/components/ui/button';
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
      title={t('insufficientEnergy')}
      description={t('insufficientEnergyDesc')}
      headerIcon={<i className="fa-solid fa-bolt text-white text-2xl"></i>}
      headerIconContainerClassName="bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg"
      closeAriaLabel={t('close')}
      footer={
        <>
          <Button
            onClick={handleGoToStore}
            variant="secondary"
            size="lg"
            className="w-full"
            icon="fas fa-store"
          >
            {t('goToStore')}
          </Button>

          <p className="text-center text-gray-400 text-xs">{t('insufficientEnergyTasksNote')}</p>

          <Button
            onClick={handleGoToQuests}
            variant="gradient"
            size="lg"
            className="w-full"
            icon="fas fa-tasks"
          >
            {t('goToQuests')}
          </Button>

          <Button
            onClick={handleClose}
            variant="default"
            size="lg"
            className="w-full"
          >
            {t('cancel')}
          </Button>
        </>
      }
    >
    </Modal>
  );
});

export default InsufficientEnergyModal;

