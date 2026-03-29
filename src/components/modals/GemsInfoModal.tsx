import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';

import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import LoadingIndicator from '@/components/CoreComponents/LoadingIndicator';
import StoreList from '@/components/StorePageComponents/StoreList';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import { REWARDS_ROUTE } from '@/utils/consts';
import { Context, type IStoreContext } from '@/store/StoreProvider';

type GemsInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const GemsInfoModal: React.FC<GemsInfoModalProps> = observer(({ isOpen, onClose }) => {
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

  const handleGoToRewards = () => {
    hapticImpact('soft');
    onClose();
    navigate(REWARDS_ROUTE);
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
      title={t('gemsInfoTitle')}
      headerIcon={<i className="fa-solid fa-gem text-white text-2xl"></i>}
      headerIconContainerClassName="bg-secondary-gradient border border-amber-500/30"
      closeAriaLabel={t('close')}
      contentClassName="max-h-[min(70vh,520px)] overflow-y-auto"
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
      <div className="rounded-lg px-4 space-y-6 pb-2">
        <ul className="list-disc pl-5 space-y-2 text-md text-gray-200">
          <li>{t('gemsInfoP1')}</li>
          <li>{t('gemsInfoP2')}</li>
          <li>{t('gemsInfoP3')}</li>
        </ul>

        <div>
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">{t('gemsModalEnergyPacks')}</h3>
          {product.loading ? (
            <div className="flex justify-center py-6">
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

export default GemsInfoModal;
