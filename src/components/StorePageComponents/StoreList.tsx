import React from 'react';
import type { Product } from '@/types/types';
import StoreItem from './StoreItem';

type TranslateFn = (key: string) => string;

type StoreListProps = {
    products: Product[];
    t: TranslateFn;
    onPurchase: (productId: number) => void;
    getProductState: (productId: number) => { isLoading: boolean };
};

const StoreList: React.FC<StoreListProps> = ({
    products,
    t,
    onPurchase,
    getProductState
}) => {
    return (
        <>
            {products.map((prod) => {
                const { isLoading } = getProductState(prod.id);

                return (
                    <StoreItem
                        key={prod.id}
                        product={prod}
                        isLoading={isLoading}
                        onPurchase={onPurchase}
                        t={t}
                    />
                );
            })}
        </>
    );
};

export default StoreList;
