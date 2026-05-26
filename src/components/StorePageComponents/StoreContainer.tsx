import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/context';
import { useTranslate } from '@/utils/useTranslate';
import LoadingIndicator from '../CoreComponents/LoadingIndicator';
import StoreEmptyState from './StoreEmptyState';
import StoreList from './StoreList';

const StoreContainer: React.FC = observer(() => {
    const { product, user } = useContext(Context) as IStoreContext;
    const { t } = useTranslate();

    useEffect(() => {
        product.fetchProducts();
        user?.fetchMyInfo?.(); // Обновляем артефакты в инвентаре
    }, [product, user]);

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

            {/* Инвентарь артефактов пользователя */}
            {user?.user?.artifacts && user.user.artifacts.length > 0 && (
                <div className="mt-6 rounded-xl border border-primary-600 bg-primary-800/50 p-4">
                    <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-backpack text-amber-400" />
                        {t('inventory') || 'Инвентарь'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {user.user.artifacts.map((a) => (
                            <div
                                key={a.code}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary-700/60 px-3 py-2 text-sm"
                            >
                                <span className="text-zinc-200">{a.name || a.code}</span>
                                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs font-medium text-amber-400">
                                    ×{a.quantity}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
