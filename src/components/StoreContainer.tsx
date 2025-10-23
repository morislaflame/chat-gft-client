import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import EmptyPage from './EmptyPage';
import LoadingIndicator from './LoadingIndicator';
import starsIcon from '@/assets/stars.svg';

const StoreContainer: React.FC = observer(() => {
    const { product } = useContext(Context) as IStoreContext;

    useEffect(() => {
        // Load products when component mounts
        product.fetchProducts();
    }, [product]);

    const handlePurchase = async (productId: number) => {
        try {
            await product.buyProduct(productId);
            alert('Purchase initiated! Please complete the payment in the popup.');
        } catch (error) {
            console.error('Error initiating purchase:', error);
            alert('Error processing purchase. Please try again.');
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
                title="Store Unavailable"
                description="The store is currently unavailable. Please try again later."
                actionText="Refresh"
                onAction={() => product.fetchProducts()}
            />
        );
    }

    // Проверяем, что массив не пустой
    if (product.products.length === 0) {
        return (
            <EmptyPage
                icon="fas fa-store"
                title="Store Coming Soon"
                description="The store is currently empty. New products will be available soon!"
                actionText="Refresh"
                onAction={() => product.fetchProducts()}
            />
        );
    }

    return (
        <div className="p-4 overflow-y-auto flex w-full">
            <div className="max-w-2xl mx-auto w-full space-y-3 mt-3">
                <div className="text-center mb-4">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-800 border border-primary-700 text-[11px] uppercase tracking-wider text-gray-400">
                        Store
                    </div>
                </div>

                {/* Products */}
                {product.products.map((prod) => (
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
                                    Energy: {prod.energy} 
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handlePurchase(prod.id)}
                            className="px-3 py-1.5 text-xs rounded-full bg-secondary-500 hover:bg-secondary-400 text-white transition flex gap-2 items-center justify-center min-w-[20%]"
                        >
                            {prod.starsPrice}
                            <img src={starsIcon} alt="stars" className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {/* Payment Info */}
                <div className="mt-6 bg-primary-800 border border-primary-700 rounded-xl p-4">
                    <div className="text-sm text-gray-400 text-center">
                        <i className="fas fa-shield-alt mr-2"></i>
                        Secure payment powered by Telegram Stars
                    </div>
                </div>
            </div>
        </div>
    );
});

export default StoreContainer;
