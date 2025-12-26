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
                <div className="w-12 h-12 rounded-full border border-purple-500 bg-gradient-to-br from-purple-500/20 to-violet-600/20 flex items-center justify-center">
                    <div className="flex items-center justify-center gap-1 text-white text-xs font-bold leading-none">
                        <i className="fa-solid fa-bolt text-[10px] leading-none"></i>
                        <span>{product.energy}</span>
                    </div>
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
                className="min-w-[20%] rounded-full flex !gap-1 items-center justify-center"
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
