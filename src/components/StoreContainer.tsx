import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import EmptyPage from './EmptyPage';

const StoreContainer: React.FC = observer(() => {
    const { shop, user } = useContext(Context) as IStoreContext;

    useEffect(() => {
        // Load packages when component mounts
        shop.loadPackages();
    }, [shop]);

    const handlePurchase = async (packageId: string) => {
        const result = await shop.purchasePackage(packageId);
        if (result.success) {
            await user.loadBalance(); // Refresh balance
            alert('Purchase successful!');
        } else {
            alert('Error processing purchase. Please try again.');
        }
    };
    // Проверяем, что packages существует и является массивом
    if (!shop.packages || !Array.isArray(shop.packages)) {
        return (
            <EmptyPage
                icon="fas fa-store"
                title="Store Unavailable"
                description="The store is currently unavailable. Please try again later."
                actionText="Refresh"
                onAction={() => shop.loadPackages()}
            />
        );
    }

    // Проверяем, что массив не пустой
    if (shop.packages.length === 0) {
        return (
            <EmptyPage
                icon="fas fa-store"
                title="Store Coming Soon"
                description="The store is currently empty. New packages will be available soon!"
                actionText="Refresh"
                onAction={() => shop.loadPackages()}
            />
        );
    }

    return (
        <div className="pt-24 pb-32 px-4 overflow-y-auto chat-scrollbar h-screen">
            <div className="max-w-2xl mx-auto w-full">
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 mr-3 rounded-full bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center">
                        <i className="fas fa-store text-white"></i>
                    </div>
                    <h2 className="text-xl font-bold text-secondary-400">Store</h2>
                </div>

                {/* Stars packages */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {shop.packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className={`bg-primary-800 border border-primary-700 rounded-xl p-4 relative ${
                                pkg.popular ? 'ring-2 ring-secondary-500' : ''
                            }`}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-secondary-500 text-white text-xs px-2 py-1 rounded-full">
                                        Popular
                                    </div>
                                </div>
                            )}
                            
                            <div className="text-center">
                                <div className="text-2xl font-bold text-secondary-400 mb-2">
                                    {pkg.stars} ⭐
                                </div>
                                <div className="text-sm text-gray-400 mb-3">
                                    {pkg.bonus && `+${pkg.bonus} bonus`}
                                </div>
                                <div className="text-lg font-semibold mb-4">
                                    ${pkg.price}
                                </div>
                                <button
                                    onClick={() => handlePurchase(pkg.id)}
                                    className="w-full bg-secondary-500 hover:bg-secondary-400 text-white py-2 px-4 rounded-lg transition"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

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
