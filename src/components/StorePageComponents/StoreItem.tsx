import React from 'react';
import Button from '@/components/ui/button';
import starsIcon from '@/assets/stars.svg';
import type { Product } from '@/types/types';
import { Card } from '../ui/card';

type TranslateFn = (key: string) => string;

type StoreItemProps = {
    product: Product;
    isLoading: boolean;
    onPurchase: (productId: number) => void;
    t: TranslateFn;
};

const StoreItem: React.FC<StoreItemProps> = ({ product, isLoading, onPurchase, t }) => {
    return (
        <Card className="flex items-center justify-between quest-item hover:bg-primary-700/50 transition">
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                className={
                    'absolute -bottom-0 -left-10 h-60 w-60 rounded-full blur-3xl opacity-8 btn-secondary-gradient-border'
                }
                />
            </div>
            <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full only-silver-border flex items-center justify-center">
                    <div className="flex items-center justify-center gap-1 text-white text-xs font-bold leading-none">
                        <i className="fa-solid fa-bolt text-[10px] leading-none"></i>
                        <span>{product.energy}</span>
                    </div>
                </div>
                <div className="flex-1 flex flex-col ">
                    <div className="text-md font-semibold">{product.name}</div>
                    <div className="text-xs text-gray-400">
                        {t('energy')}: {product.energy}
                    </div>
                </div>
            </div>
            <Button
                onClick={() => onPurchase(product.id)}
                disabled={isLoading}
                variant="default"
                size="sm"
                className="min-w-[20%] flex !gap-1 items-center justify-center"
            >
                {isLoading ? t('loading') : (
                    <>
                        {product.starsPrice}
                        <img src={starsIcon} alt="stars" className="w-4 h-4" />
                    </>
                )}
            </Button>
        </Card>
    );
};

export default StoreItem;
