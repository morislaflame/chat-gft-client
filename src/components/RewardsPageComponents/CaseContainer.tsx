import React, { useContext, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';

import { Context, type IStoreContext } from '@/store/StoreProvider';
import LoadingIndicator from '@/components/CoreComponents/LoadingIndicator';
import EmptyPage from '@/components/CoreComponents/EmptyPage';
import { useTranslate } from '@/utils/useTranslate';

import CaseRoulette from '@/components/RewardsPageComponents/CaseRoulette';
import Button from '@/components/CoreComponents/Button';

const CaseContainer: React.FC = observer(() => {
  const { id } = useParams();
  const { cases, user } = useContext(Context) as IStoreContext;
  const { t } = useTranslate();
  const [qty, setQty] = useState(1);
  const caseId = useMemo(() => (id ? Number(id) : NaN), [id]);
  const box = useMemo(
    () => cases.activeCases.find((c) => c.id === caseId),
    [cases.activeCases, caseId]
  );
  const myQty = useMemo(() => {
    if (!box) return 0;
    return cases.myUnopenedCases.filter((uc) => uc.caseId === box.id).length;
  }, [cases.myUnopenedCases, box]);

  useEffect(() => {
    // Ensure we have both the case data and user's unopened cases (needed to open).
    cases.fetchActiveCases();
    cases.fetchMyUnopenedCases();
  }, [cases]);

  if (!id) {
    return null;
  }

  if (cases.loading && !box) {
    return <LoadingIndicator />;
  }

  if (!box) {
    return (
      <EmptyPage
        icon="fas fa-box-open"
        title={t('storeUnavailable')}
        description={cases.error || t('storeUnavailableDesc')}
        actionText={t('refresh')}
        onAction={() => {
          cases.fetchActiveCases(true);
          cases.fetchMyUnopenedCases(true);
        }}
      />
    );
  }

  const isMobile = document.body.classList.contains('telegram-mobile');

  const balance = user.user?.balance ?? 0;
  const total = box.price * qty;
  const canAfford = balance >= total;

  const handleMinus = () => setQty((q) => Math.max(1, q - 1));
  const handlePlus = () => setQty((q) => Math.min(50, q + 1));

  const handlePurchase = async () => {
    if (!canAfford || cases.loading) return;
    await cases.purchaseCase(box.id, qty);
    // Keep qty as-is; user might want to buy same amount again.
    // Refresh list to ensure backend truth (optional)
    cases.fetchMyUnopenedCases(true);
  };

  return (
    <div
      className="p-4 overflow-y-auto flex w-full flex-col gap-4"
      style={{ marginTop: isMobile ? '148px' : '48px' }}
    >
      <h1 className="text-white text-2xl font-semibold">{box.name}</h1>
      <CaseRoulette caseBox={box} />

      {/* Purchase card */}
      <div className="bg-primary-800 border border-primary-700 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-gray-300">{t('buy')}</div>
            <div className="text-xs text-gray-500">
              {t('buyFor')} {box.price} <i className="fa-solid fa-gem text-white"></i>
              {myQty > 0 ? <span className="ml-2">• {myQty} {t('boxes')}</span> : null}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">{t('total')}</div>
            <div className={`text-sm font-semibold ${canAfford ? 'text-white' : 'text-red-400'}`}>
              {total} <i className="fa-solid fa-gem text-white"></i>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMinus}
              className="w-10 h-10 rounded-lg bg-primary-700 hover:bg-primary-600 border border-primary-600 text-white flex items-center justify-center cursor-pointer"
              aria-label="Decrease quantity"
            >
              <i className="fa-solid fa-minus" />
            </button>

            <div className="min-w-[52px] h-10 rounded-lg bg-primary-900 border border-primary-700 text-white flex items-center justify-center font-semibold">
              {qty}
            </div>

            <button
              type="button"
              onClick={handlePlus}
              className="w-10 h-10 rounded-lg bg-primary-700 hover:bg-primary-600 border border-primary-600 text-white flex items-center justify-center cursor-pointer"
              aria-label="Increase quantity"
            >
              <i className="fa-solid fa-plus" />
            </button>
          </div>

          <Button
            onClick={handlePurchase}
            disabled={!canAfford || cases.loading}
            variant={canAfford ? 'secondary' : 'primary'}
            size="md"
            className="flex-1"
            icon={cases.loading ? 'fas fa-spinner fa-spin' : !canAfford ? 'fas fa-lock' : 'fas fa-shopping-cart'}
          >
            {cases.loading ? t('purchasing') : t('buy')}
          </Button>
        </div>

        {!canAfford ? <div className="text-xs text-red-400 mt-2">{t('insufficientBalance')}</div> : null}
        {cases.error ? <div className="text-xs text-red-400 mt-2">{cases.error}</div> : null}
      </div>
    </div>
  );
});

export default CaseContainer;

