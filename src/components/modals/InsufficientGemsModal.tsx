import React, { useContext, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import { QUESTS_ROUTE, STORE_ROUTE } from '@/utils/consts';
import Button from '@/components/ui/button';
import { trackEvent } from '@/utils/analytics';

const InsufficientGemsModal: React.FC = observer(() => {
  const { chat } = useContext(Context) as IStoreContext;
  const { t } = useTranslate();
  const navigate = useNavigate();
  const isOpen = chat.insufficientGems;
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      trackedRef.current = false;
      return;
    }
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackEvent('gems_paywall_view', { context: 'payable_suggestion' });
  }, [isOpen]);

  const handleClose = () => {
    chat.closeInsufficientGems();
  };

  const handleGoToStore = () => {
    chat.closeInsufficientGems();
    trackEvent('gems_paywall_view', { context: 'payable_suggestion', placement: 'modal_to_store' });
    navigate(STORE_ROUTE);
  };

  const handleGoToQuests = () => {
    chat.closeInsufficientGems();
    trackEvent('gems_paywall_view', { context: 'payable_suggestion', placement: 'modal_to_quests' });
    navigate(QUESTS_ROUTE);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={true}
      title={t('insufficientGems')}
      description={t('insufficientGemsDesc')}
      headerIcon={<i className="fa-solid fa-gem text-white text-2xl"></i>}
      headerIconContainerClassName="bg-secondary-gradient shadow-lg"
      closeAriaLabel={t('close')}
      footer={
        <>
          <Button
            onClick={handleGoToStore}
            variant="gradient"
            size="lg"
            className="w-full"
            icon="fas fa-store"
          >
            {t('goToStore')}
          </Button>

          <p className="text-center text-gray-400 text-xs">{t('insufficientGemsTasksNote')}</p>

          <Button
            onClick={handleGoToQuests}
            variant="secondary"
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

export default InsufficientGemsModal;
