import React, { useRef, useState } from 'react';
import Button from '@/components/ui/button';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import type { ProfileInventoryArtifact } from '@/types/types';
import { buyArtifact, sellArtifact } from '@/http/artifactMarketAPI';

export type ArtifactTradeSuccessPayload = {
    action: 'buy' | 'sell';
    ownedQty: number;
    newBalance: number;
    artifactCode: string;
    price: number;
    sourceRect?: DOMRect;
};

export type ArtifactMarketActionsProps = {
    artifact: ProfileInventoryArtifact;
    historyName: string;
    ownedQty: number;
    userBalance: number;
    layout?: 'card' | 'modal';
    onSuccess: (payload: ArtifactTradeSuccessPayload) => void;
};

function tradablePrice(value: number | null | undefined): number | null {
    if (value == null) return null;
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
}

const ArtifactMarketActions: React.FC<ArtifactMarketActionsProps> = ({
    artifact,
    historyName,
    ownedQty,
    userBalance,
    layout = 'card',
    onSuccess,
}) => {
    const { t } = useTranslate();
    const { hapticImpact, hapticNotification } = useHapticFeedback();
    const [loadingAction, setLoadingAction] = useState<'buy' | 'sell' | null>(null);
    const sellButtonRef = useRef<HTMLButtonElement>(null);

    const buyPrice = tradablePrice(artifact.buyPrice);
    const sellPrice = tradablePrice(artifact.sellPrice);
    const isCompanion = artifact.boostType === 'COMPANION';

    const canBuy = buyPrice != null && userBalance >= buyPrice;
    const canSell = sellPrice != null && ownedQty > 0 && !isCompanion;

    const buyDisabledReason =
        buyPrice == null
            ? undefined
            : userBalance < buyPrice
              ? t('artifactInsufficientBalance')
              : undefined;

    const sellDisabledReason = (() => {
        if (isCompanion) return t('artifactCompanionNotSellable');
        if (sellPrice == null) return undefined;
        if (ownedQty < 1) return t('artifactNothingToSell');
        return undefined;
    })();

    const showBuy = buyPrice != null;
    const showSell = sellPrice != null && !isCompanion;

    if (!showBuy && !showSell) return null;

    const runTrade = async (action: 'buy' | 'sell') => {
        if (loadingAction) return;
        hapticImpact('soft');
        setLoadingAction(action);
        try {
            const sourceRect =
                action === 'sell' ? sellButtonRef.current?.getBoundingClientRect() : undefined;
            const response =
                action === 'buy'
                    ? await buyArtifact(artifact.id, historyName)
                    : await sellArtifact(artifact.id, historyName);
            hapticNotification('success');
            onSuccess({
                action,
                ownedQty: response.ownedQty,
                newBalance: response.newBalance,
                artifactCode: response.artifactCode,
                price: action === 'buy' ? buyPrice! : sellPrice!,
                sourceRect,
            });
        } catch (err: unknown) {
            console.error(err);
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                t('artifactMarketError');
            window.alert(message);
        } finally {
            setLoadingAction(null);
        }
    };

    const isCard = layout === 'card';
    const buttonSize = isCard ? 'sm' : 'lg';
    const buttonClass = isCard ? 'min-h-7 px-2 text-[10px]' : 'w-full';

    return (
        <div
            className={
                isCard
                    ? 'flex flex-col gap-1 w-full relative z-[2]'
                    : 'flex flex-row gap-2 w-full'
            }
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
        >
            {showBuy ? (
                <Button
                    type="button"
                    variant="secondary"
                    size={buttonSize}
                    className={buttonClass}
                    disabled={!canBuy || loadingAction !== null}
                    state={loadingAction === 'buy' ? 'loading' : 'default'}
                    onClick={() => void runTrade('buy')}
                    title={buyDisabledReason}
                >
                    {t('artifactBuyFor').replace('{price}', String(buyPrice))} <i className="fa-solid fa-gem text-white"></i>
                </Button>
            ) : null}
            {showSell ? (
                <Button
                    ref={sellButtonRef}
                    type="button"
                    variant="gradient"
                    size={buttonSize}
                    className={buttonClass}
                    disabled={!canSell || loadingAction !== null}
                    state={loadingAction === 'sell' ? 'loading' : 'default'}
                    onClick={() => void runTrade('sell')}
                    title={sellDisabledReason}
                >
                    {t('artifactSellFor').replace('{price}', String(sellPrice))} <i className="fa-solid fa-gem text-white"></i>
                </Button>
            ) : null}
        </div>
    );
};

export default ArtifactMarketActions;
