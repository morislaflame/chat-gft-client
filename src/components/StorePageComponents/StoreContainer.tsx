import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import EmptyPage from '../CoreComponents/EmptyPage';
import LoadingIndicator from '../CoreComponents/LoadingIndicator';
import Button from '../CoreComponents/Button';
import starsIcon from '@/assets/stars.svg';

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

    // Проверяем, что products существует и является массивом
    if (!product.products || !Array.isArray(product.products)) {
        return (
            <EmptyPage
                icon="fas fa-store"
                title={t('storeUnavailable')}
                description={t('storeUnavailableDesc')}
                actionText={t('refresh')}
                onAction={() => product.fetchProducts()}
            />
        );
    }

    // Проверяем, что массив не пустой
    if (product.products.length === 0) {
        return (
            <EmptyPage
                icon="fas fa-store"
                title={t('storeComingSoon')}
                description={t('storeComingSoonDesc')}
                actionText={t('refresh')}
                onAction={() => product.fetchProducts()}
            />
        );
    }

    const isMobile = document.body.classList.contains('telegram-mobile');

    return (
        <div className="p-4 overflow-y-auto flex w-full flex-col gap-2"
        style={{ marginTop: isMobile ? '156px' : '56px' }}>

                {/* Products */}
                {product.products.map((prod) => {
                    const isProductLoading = product.isProductLoading(prod.id);
                    
                    return (
                        <div
                            key={prod.id}
                            className="bg-primary-800 border border-primary-700 rounded-xl p-3 flex items-center justify-between hover:bg-primary-700/50 transition"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                                    <i className="text-white text-sm"></i>
                                </div>
                                <div className="flex-1 flex flex-col gap-1">
                                    <div className="text-sm font-semibold">{prod.name}</div>
                                    <div className="text-xs text-gray-400">
                                        {t('energy')}: {prod.energy} 
                                    </div>
                                </div>
                            </div>
                            <Button
                                onClick={() => handlePurchase(prod.id)}
                                disabled={isProductLoading}
                                variant="secondary"
                                size="sm"
                                className="min-w-[20%] rounded-full flex gap-2 items-center justify-center"
                            >
                                {isProductLoading ? t('loading') : (
                                    <>
                                        {prod.starsPrice}
                                        <img src={starsIcon} alt="stars" className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    );
                })}

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
