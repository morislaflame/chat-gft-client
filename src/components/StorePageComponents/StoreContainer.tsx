import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import LoadingIndicator from '../CoreComponents/LoadingIndicator';
import StoreEmptyState from './StoreEmptyState';
import StoreList from './StoreList';

const StoreContainer: React.FC = observer(() => {
    const { product } = useContext(Context) as IStoreContext;
    const { t } = useTranslate();

    useEffect(() => {
        // Load products when component mounts
        product.fetchProducts();
    }, [product]);

    const handlePurchase = async (productId: number) => {
        try {
            await product.buyProduct(productId);
        } catch (error) {
            console.error('Error initiating purchase:', error);
            // Ошибка уже обработана в ProductStore, 
            // здесь только логируем для отладки
        }
    };
    // Показываем лоадинг пока загружаются продукты
    if (product.loading) {
        return <LoadingIndicator />;
    }

    if (!product.products || !Array.isArray(product.products)) {
        return (
            <StoreEmptyState
                title={t('storeUnavailable')}
                description={t('storeUnavailableDesc')}
                actionText={t('refresh')}
                onRefresh={() => product.fetchProducts()}
            />
        );
    }

    if (product.products.length === 0) {
        return (
            <StoreEmptyState
                title={t('storeComingSoon')}
                description={t('storeComingSoonDesc')}
                actionText={t('refresh')}
                onRefresh={() => product.fetchProducts()}
            />
        );
    }

    const isMobile = document.body.classList.contains('telegram-mobile');

    return (
        <div className="p-4 overflow-y-auto flex w-full flex-col gap-2"
        style={{ marginTop: isMobile ? '158px' : '58px' }}>

            <StoreList
                products={product.products}
                t={t}
                onPurchase={handlePurchase}
                getProductState={(productId: number) => ({
                    isLoading: product.isProductLoading(productId)
                })}
            />

                {/* Payment Info */}
                {/* <div className="mt-6 bg-primary-800 border border-primary-700 rounded-xl p-4">
                    <div className="text-sm text-gray-400 text-center">
                        <i className="fas fa-shield-alt mr-2"></i>
                        Secure payment powered by Telegram Stars
                    </div>
                </div> */}
        </div>
    );
});

export default StoreContainer;
