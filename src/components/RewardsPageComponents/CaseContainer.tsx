import React, { useContext, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useParams } from 'react-router-dom';

import { Context, type IStoreContext } from '@/store/StoreProvider';
import LoadingIndicator from '@/components/CoreComponents/LoadingIndicator';
import EmptyPage from '@/components/CoreComponents/EmptyPage';
import { useTranslate } from '@/utils/useTranslate';
import { REWARDS_ROUTE } from '@/utils/consts';

import CaseRoulette from '@/components/RewardsPageComponents/CaseRoulette';
import Button from '@/components/CoreComponents/Button';
import { useHapticFeedback } from '@/utils/useHapticFeedback';

const CaseContainer: React.FC = observer(() => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { cases, user } = useContext(Context) as IStoreContext;
  const { t } = useTranslate();
  const { hapticImpact } = useHapticFeedback();
  const [qty, setQty] = useState(1);
  const caseId = useMemo(() => (id ? Number(id) : NaN), [id]);
  const box = useMemo(
    () => cases.activeCases.find((c) => c.id === caseId),
    [cases.activeCases, caseId]
  );

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

  const handleMinus = () => {
    hapticImpact('soft');
    setQty((q) => Math.max(1, q - 1));
  };
  const handlePlus = () => {
    hapticImpact('soft');
    setQty((q) => Math.min(50, q + 1));
  };

  const handlePurchase = async () => {
    if (!canAfford || cases.loading) return;
    await cases.purchaseCase(box.id, qty);
    // Keep qty as-is; user might want to buy same amount again.
    // Refresh list to ensure backend truth (optional)
    cases.fetchMyUnopenedCases(true);
  };

  return (
    <div
      className="p-4 overflow-y-auto flex w-full flex-col hide-scrollbar ios-scroll"
      // style={{ marginTop: isMobile ? '148px' : '48px' }}
    >
      <div className='w-full' style={{ marginTop: isMobile ? '148px' : '48px' }}></div>
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => {
            hapticImpact('soft');
            navigate(REWARDS_ROUTE);
          }}
          className="w-9 h-9 rounded-lg bg-primary-800 hover:bg-primary-700 border border-primary-700 flex items-center justify-center cursor-pointer"
          aria-label="Go back"
        >
          <i className="fa-solid fa-chevron-left text-white" />
        </button>
        <h1 className="text-white text-2xl font-bold">{box.name}</h1>
      </div>
      <CaseRoulette caseBox={box} />

      {/* Purchase card */}
      <div className="bg-primary-800 border border-primary-700 rounded-2xl p-4 flex flex-col gap-2 items-center">
        
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMinus}
              className="w-6 h-6 rounded-lg text-xs bg-primary-700 hover:bg-primary-600 border border-primary-600 text-white flex items-center justify-center cursor-pointer"
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
              className="w-6 h-6 rounded-lg text-xs bg-primary-700 hover:bg-primary-600 border border-primary-600 text-white flex items-center justify-center cursor-pointer"
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
            icon={cases.loading ? 'fas fa-spinner fa-spin' : !canAfford ? 'fas fa-lock' : ''}
          >
            {cases.loading ? t('purchasing') : canAfford ? `${t('buyFor')}` : `${t('insufficientBalance')}`} {total} <i className="fa-solid fa-gem text-white"></i>
          </Button>
          {cases.error ? <div className="text-xs text-red-400 mt-2">{cases.error}</div> : null}
        </div>

        
        
    </div>
  );
});

export default CaseContainer;

