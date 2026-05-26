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
    /** Уровень миссий открыт — иначе покупка недоступна */
    levelUnlocked?: boolean;
    layout?: 'card' | 'modal';
    /** По умолчанию true; в чате при отсутствии артефакта — только покупка */
    showSell?: boolean;
    /** По умолчанию true; в чате при отсутствии артефакта — только покупка */
    isOwned?: boolean;
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
    levelUnlocked = true,
    layout = 'card',
    showSell = true,
    isOwned = true,
    onSuccess,
}) => {
    const { t } = useTranslate();
    const { hapticImpact, hapticNotification } = useHapticFeedback();
    const [loadingAction, setLoadingAction] = useState<'buy' | 'sell' | null>(null);
    const sellButtonRef = useRef<HTMLButtonElement>(null);

    const buyPrice = tradablePrice(artifact.buyPrice);
    const sellPrice = tradablePrice(artifact.sellPrice);

    const canBuy = buyPrice != null && levelUnlocked && userBalance >= buyPrice;
    const canSell = sellPrice != null && ownedQty >= 2;

    const buyDisabledReason = (() => {
        if (buyPrice == null) return undefined;
        if (!levelUnlocked) return t('artifactLevelNotUnlockedForBuy');
        if (userBalance < buyPrice) return t('artifactInsufficientBalance');
        return undefined;
    })();

    const sellDisabledReason = (() => {
        if (sellPrice == null) return undefined;
        if (ownedQty < 2) return t('artifactSellDuplicatesOnly');
        return undefined;
    })();

    const ownsArtifact = isOwned && ownedQty > 0;
    const showBuy = buyPrice != null;
    const showSellButton = showSell && sellPrice != null && ownsArtifact;

    if (!showBuy && !showSellButton) return null;

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
                    : 'flex flex-col gap-2 w-full'
            }
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
        >
            {!isCard && showSell && sellPrice != null && ownsArtifact && ownedQty < 2 ? (
                <p className="text-md text-zinc-400 text-center mb-2">{t('artifactSellDuplicatesHint')}</p>
            ) : null}
            <div className="flex flex-row gap-2 w-full">
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
                    {t('artifactBuyFor').replace('{price}', String(buyPrice))}{' '}
                    <i className="fa-solid fa-gem text-white"></i>
                </Button>
            ) : null}
            {showSellButton ? (
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
                    {t('artifactSellFor').replace('{price}', String(sellPrice))}{' '}
                    <i className="fa-solid fa-gem text-white"></i>
                </Button>
            ) : null}
            </div>
        </div>
    );
};

export default ArtifactMarketActions;
