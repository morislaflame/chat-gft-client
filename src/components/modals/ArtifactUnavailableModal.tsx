import React, { useContext, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { Context, type IStoreContext } from '@/store/context';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import type { ProfileInventoryArtifact } from '@/types/types';
import { loadMergedProfileStories } from '@/components/ProfilePageComponents/profileInventoryMocks';
import ArtifactMarketActions, {
  type ArtifactTradeSuccessPayload,
} from '@/components/ProfilePageComponents/ArtifactMarketActions';
import ArtifactPurchaseSuccessModal from '@/components/modals/ArtifactPurchaseSuccessModal';

export type ArtifactUnavailableContext = {
  artifactCode: string;
  artifactMedia?: { id: number; url: string; mimeType: string } | null;
};

export type ArtifactUnavailableModalProps = {
  isOpen: boolean;
  context: ArtifactUnavailableContext | null;
  onClose: () => void;
};

const ArtifactUnavailableModal: React.FC<ArtifactUnavailableModalProps> = observer(
  ({ isOpen, context, onClose }) => {
    const { user } = useContext(Context) as IStoreContext;
    const { t, language } = useTranslate();
    const { hapticImpact } = useHapticFeedback();

    const [catalogArtifact, setCatalogArtifact] = useState<ProfileInventoryArtifact | null>(null);
    const [catalogLoading, setCatalogLoading] = useState(false);
    const [catalogError, setCatalogError] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState<{
      artifact: ProfileInventoryArtifact;
      title: string;
      ownedQty: number;
    } | null>(null);

    const historyName = user.user?.selectedHistoryName?.trim() ?? '';
    const artifactCode = context?.artifactCode?.trim() ?? '';

    useEffect(() => {
      if (!isOpen || !artifactCode || !historyName) {
        setCatalogArtifact(null);
        setCatalogLoading(false);
        setCatalogError(false);
        return;
      }

      let cancelled = false;
      setCatalogLoading(true);
      setCatalogError(false);
      setCatalogArtifact(null);

      void loadMergedProfileStories()
        .then((stories) => {
          if (cancelled) return;
          const story = stories.find((s) => s.historyName === historyName);
          const found = story?.artifacts.find((a) => a.code === artifactCode) ?? null;
          if (!found) {
            setCatalogError(true);
            return;
          }
          if (context?.artifactMedia && !found.media) {
            setCatalogArtifact({
              ...found,
              media: context.artifactMedia,
            });
            return;
          }
          setCatalogArtifact(found);
        })
        .catch((err) => {
          console.error(err);
          if (!cancelled) setCatalogError(true);
        })
        .finally(() => {
          if (!cancelled) setCatalogLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }, [isOpen, artifactCode, historyName, context?.artifactMedia]);

    const artifactTitle = useMemo(() => {
      if (!catalogArtifact) return artifactCode;
      if (language === 'en') {
        return catalogArtifact.nameEn || catalogArtifact.name || catalogArtifact.code;
      }
      return catalogArtifact.name || catalogArtifact.code;
    }, [catalogArtifact, artifactCode, language]);

    const ownedQty =
      user.user?.artifacts?.find((a) => a.code === artifactCode)?.quantity ?? 0;
    const userBalance = user.user?.balance ?? 0;
    const buyPrice = catalogArtifact?.buyPrice;
    const canShowBuy =
      catalogArtifact != null &&
      buyPrice != null &&
      Number.isFinite(Number(buyPrice)) &&
      Number(buyPrice) > 0;

    const handleClose = () => {
      hapticImpact('soft');
      onClose();
    };

    const applyBuySuccess = (payload: ArtifactTradeSuccessPayload) => {
      user.setBalance(payload.newBalance);
      const prevArtifacts = user.user?.artifacts ?? [];
      const idx = prevArtifacts.findIndex((a) => a.code === payload.artifactCode);
      let nextArtifacts;
      if (payload.ownedQty > 0) {
        if (idx >= 0) {
          nextArtifacts = prevArtifacts.map((a, i) =>
            i === idx ? { ...a, quantity: payload.ownedQty } : a,
          );
        } else {
          nextArtifacts = [
            ...prevArtifacts,
            {
              code: payload.artifactCode,
              name: catalogArtifact?.name || payload.artifactCode,
              quantity: payload.ownedQty,
            },
          ];
        }
      } else if (idx >= 0) {
        nextArtifacts = prevArtifacts.filter((a) => a.code !== payload.artifactCode);
      } else {
        nextArtifacts = prevArtifacts;
      }
      user.setArtifacts(nextArtifacts);
    };

    const handleBuySuccess = (payload: ArtifactTradeSuccessPayload) => {
      if (!catalogArtifact) return;
      applyBuySuccess(payload);
      onClose();
      setPurchaseSuccess({
        artifact: catalogArtifact,
        title: artifactTitle,
        ownedQty: payload.ownedQty,
      });
    };

    const previewUrl =
      catalogArtifact?.media?.url || context?.artifactMedia?.url || null;
    const previewMime =
      catalogArtifact?.media?.mimeType || context?.artifactMedia?.mimeType || '';
    const isImage = Boolean(previewUrl && previewMime.startsWith('image/'));

    return (
      <>
        <Modal
          isOpen={isOpen}
          onClose={handleClose}
          closeAriaLabel={t('close')}
          title={t('artifactMissingTitle')}
          description={t('artifactMissingDescription')}
          footer={
            <div className="flex flex-col gap-2 w-full">
              {catalogLoading ? (
                <Button variant="secondary" size="lg" className="w-full" disabled state="loading">
                  {t('loading')}
                </Button>
              ) : canShowBuy && catalogArtifact ? (
                <ArtifactMarketActions
                  artifact={catalogArtifact}
                  historyName={historyName}
                  ownedQty={ownedQty}
                  userBalance={userBalance}
                  layout="modal"
                  showSell={false}
                  onSuccess={handleBuySuccess}
                />
              ) : null}
              <Button onClick={handleClose} variant="outline" size="lg" className="w-full">
                {t('gotIt')}
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            {isImage ? (
              <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-black/30">
                <img src={previewUrl!} alt="" className="max-h-full max-w-full object-contain" />
              </div>
            ) : null}
            {artifactCode ? (
              <p className="text-center text-lg font-semibold text-white">{artifactTitle}</p>
            ) : null}
            <div className="text-zinc-200 text-md leading-relaxed space-y-2 list-disc pl-2">
              <p>- {t('artifactMissingHintLine1')}</p>
              <p>- {t('artifactMissingHintLine2')}</p>
            </div>
            {catalogError ? (
              <p className="text-sm text-amber-200/90 text-center">{t('artifactMarketError')}</p>
            ) : null}
            {!catalogLoading && catalogArtifact && !canShowBuy ? (
              <p className="text-sm text-zinc-400 text-center">{t('artifactNotPurchasable')}</p>
            ) : null}
          </div>
        </Modal>

        <ArtifactPurchaseSuccessModal
          isOpen={purchaseSuccess != null}
          artifact={purchaseSuccess?.artifact ?? null}
          title={purchaseSuccess?.title ?? ''}
          ownedQty={purchaseSuccess?.ownedQty ?? 0}
          onClose={() => setPurchaseSuccess(null)}
        />
      </>
    );
  },
);

export default ArtifactUnavailableModal;
