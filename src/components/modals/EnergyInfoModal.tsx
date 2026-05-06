import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';

import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import LoadingIndicator from '@/components/CoreComponents/LoadingIndicator';
import StoreList from '@/components/StorePageComponents/StoreList';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import { QUESTS_ROUTE } from '@/utils/consts';
import { Context, type IStoreContext } from '@/store/context';

type EnergyInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const EnergyInfoModal: React.FC<EnergyInfoModalProps> = observer(({ isOpen, onClose }) => {
  const { t } = useTranslate();
  const { hapticImpact } = useHapticFeedback();
  const navigate = useNavigate();
  const { product } = useContext(Context) as IStoreContext;

  useEffect(() => {
    if (!isOpen) return;
    void product.fetchProducts();
  }, [isOpen, product]);

  const handleClose = () => {
    hapticImpact('soft');
    onClose();
  };

  const handleGoToQuests = () => {
    hapticImpact('soft');
    onClose();
    navigate(QUESTS_ROUTE);
  };

  const handlePurchase = async (productId: number) => {
    try {
      await product.buyProduct(productId);
    } catch (error) {
      console.error('Error initiating purchase:', error);
    }
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
      contentClassName="max-h-[min(70vh,520px)] overflow-y-auto"
      footer={
        <Button
          onClick={handleGoToQuests}
          variant="gradient"
          size="lg"
          className="w-full"
          icon="fas fa-arrow-right"
        >
          {t('goToQuests')}
        </Button>
      }
    >
      <div className="rounded-lg space-y-6">
        {/* <ul className="list-disc pl-5 space-y-2 text-md text-gray-200">
          <li>{t('energyInfoP1')}</li>
          <li>{t('energyInfoP2')}</li>
          <li>{t('energyInfoP3')}</li>
        </ul> */}

        <div>
          {product.loading ? (
            <div className="flex justify-center py-4">
              <LoadingIndicator />
            </div>
          ) : !product.products?.length ? (
            <p className="text-xs text-zinc-500 text-center py-4">{t('storeComingSoonDesc')}</p>
          ) : (
            <div className="flex flex-col gap-2">
              <StoreList
                products={product.products}
                t={t}
                onPurchase={handlePurchase}
                getProductState={(productId: number) => ({
                  isLoading: product.isProductLoading(productId),
                })}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
});

export default EnergyInfoModal;

