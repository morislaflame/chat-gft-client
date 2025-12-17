import React from 'react';
import Button from '../CoreComponents/Button';
import starsIcon from '@/assets/stars.svg';
import type { Product } from '@/types/types';

type TranslateFn = (key: string) => string;

type StoreItemProps = {
    product: Product;
    isLoading: boolean;
    onPurchase: (productId: number) => void;
    t: TranslateFn;
};

const StoreItem: React.FC<StoreItemProps> = ({ product, isLoading, onPurchase, t }) => {
    return (
        <div className="bg-primary-800 border border-primary-700 rounded-xl p-3 flex items-center justify-between hover:bg-primary-700/50 transition">
            <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                    <i className="text-white text-sm"></i>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                    <div className="text-sm font-semibold">{product.name}</div>
                    <div className="text-xs text-gray-400">
                        {t('energy')}: {product.energy}
                    </div>
                </div>
            </div>
            <Button
                onClick={() => onPurchase(product.id)}
                disabled={isLoading}
                variant="secondary"
                size="sm"
                className="min-w-[20%] rounded-full flex gap-2 items-center justify-center"
            >
                {isLoading ? t('loading') : (
                    <>
                        {product.starsPrice}
                        <img src={starsIcon} alt="stars" className="w-4 h-4" />
                    </>
                )}
            </Button>
        </div>
    );
};

export default StoreItem;
