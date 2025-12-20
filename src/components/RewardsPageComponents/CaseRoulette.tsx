import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import RoulettePro, { type RouletteType } from 'react-roulette-pro';
import 'react-roulette-pro/dist/index.css';
import { observer } from 'mobx-react-lite';

import type { CaseBox, CaseItem, OpenCaseResponse } from '@/http/caseAPI';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import { useAnimationLoader } from '@/utils/useAnimationLoader';

import RouletteButton from './RouletteButton';
import RouletteLottie from './RouletteLottie';
import CaseOpenResultModal from '@/components/modals/CaseOpenResultModal';
import CaseItemsRibbon from '@/components/RewardsPageComponents/CaseItemsRibbon';

type RoulettePrize = {
  id: string;
  image: string;
  text: string;
  caseItem: CaseItem;
};

const createId = () => {
  // No external deps: prefer crypto.randomUUID, fallback to Math.random.
  const cryptoAny = crypto as unknown as { randomUUID?: () => string } | undefined;
  return cryptoAny?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const reproductionArray = (array: RoulettePrize[] = [], length = 0) => [
  ...Array(length)
    .fill('_')
    .map(() => array[Math.floor(Math.random() * array.length)]),
];

const createPrizeList = (prizeItems: RoulettePrize[]) => {
  const reproducedArray = [
    ...prizeItems,
    ...reproductionArray(prizeItems, Math.max(prizeItems.length * 3, 1)),
    ...prizeItems,
    ...reproductionArray(prizeItems, Math.max(prizeItems.length, 1)),
  ];

  return reproducedArray.map((item) => ({
    ...item,
    id: `${item.id}--${createId()}`,
  }));
};

const PrizeIcon: React.FC<{ item: CaseItem; className?: string }> = ({ item, className = '' }) => {
  if (item.type === 'gems') {
    return <i className={`fa-solid fa-gem text-amber-400 ${className}`} />;
  }
  if (item.type === 'energy') {
    return <i className={`fa-solid fa-bolt text-purple-400 ${className}`} />;
  }
  return <i className={`fas fa-gift text-white ${className}`} />;
};

const findPrizeIndex = (prizesList: RoulettePrize[], caseItemId: number): number => {
  const list = [...prizesList];
  const half = Math.floor(list.length / 2);
  const lastSection = list.slice(half);

  const indexInLast = lastSection.findIndex((p) => Number(p.caseItem.id) === caseItemId);
  if (indexInLast === -1) {
    return half + Math.floor(Math.random() * Math.max(lastSection.length, 1));
  }
  return half + indexInLast;
};

const CaseRoulette: React.FC<{ caseBox: CaseBox }> = observer(({ caseBox }) => {
  const { t } = useTranslate();
  const { cases } = useContext(Context) as IStoreContext;

  const [start, setStart] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(0);

  const [openResult, setOpenResult] = useState<OpenCaseResponse | null>(null);
  const [showResult, setShowResult] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserCaseId, setSelectedUserCaseId] = useState<number | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const openRequestUserCaseIdRef = useRef<number | null>(null);

  const isSpinning = spinning || start;
  const availableCasesCount = useMemo(
    () => cases.myUnopenedCases.filter((uc) => uc.caseId === caseBox.id).length,
    [cases.myUnopenedCases, caseBox.id]
  );

  // Load reward animations (Lottie JSON) if reward.mediaFile is application/json
  const [animations, isLoadingAnimations] = useAnimationLoader(
    caseBox.items || [],
    (item) => (item.type === 'reward' ? item.reward?.mediaFile : null),
    [caseBox.id]
  );

  const prizes = useMemo(() => {
    const items = caseBox.items || [];
    const base: RoulettePrize[] = items.map((item) => {
      if (item.type === 'reward') {
        return {
          id: String(item.id),
          image: item.reward?.mediaFile?.url || '',
          text: item.reward?.name || 'Reward',
          caseItem: item,
        };
      }

      if (item.type === 'gems') {
        const amount = item.amount ?? 0;
        return {
          id: String(item.id),
          image: '',
          text: `+${amount} ${t('gems')}`,
          caseItem: item,
        };
      }

      const amount = item.amount ?? 0;
      return {
        id: String(item.id),
        image: '',
        text: `+${amount} ${t('energy')}`,
        caseItem: item,
      };
    });

    return createPrizeList(base);
  }, [caseBox.items, t]);

  useEffect(() => {
    if (!spinning || !selectedUserCaseId || !prizes.length) return;
    // Guard against repeated effect runs (e.g. re-renders while spinning=true)
    if (openRequestUserCaseIdRef.current === selectedUserCaseId) return;
    openRequestUserCaseIdRef.current = selectedUserCaseId;

    const run = async () => {
      try {
        const response = await cases.openCase(selectedUserCaseId);
        if (!response) {
          setLocalError(cases.error || 'Failed to open case');
          setSpinning(false);
          setIsLoading(false);
          openRequestUserCaseIdRef.current = null;
          return;
        }

        setOpenResult(response);
        const idx = findPrizeIndex(prizes, response.result.caseItemId);
        setPrizeIndex(idx);
        setStart(true);
        setIsLoading(false);
      } catch (e) {
        console.error('openCase failed', e);
        setLocalError('Failed to open case');
        setSpinning(false);
        setIsLoading(false);
        openRequestUserCaseIdRef.current = null;
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, selectedUserCaseId, prizes]);

  const handleStart = () => {
    if (isSpinning) return;
    if (availableCasesCount <= 0) return;

    setLocalError(null);
    setOpenResult(null);
    setShowResult(false);
    setPrizeIndex(0);
    setStart(false);
    openRequestUserCaseIdRef.current = null;

    const userCaseInstance = cases.myUnopenedCases.find((uc) => uc.caseId === caseBox.id);
    if (!userCaseInstance) {
      setLocalError(t('caseNotAvailable'));
      return;
    }

    setSelectedUserCaseId(userCaseInstance.id);
    setIsLoading(true);
    setSpinning(true);
  };

  const handlePrizeDefined = () => {
    setSpinning(false);
    setStart(false);
    setShowResult(true);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setOpenResult(null);
    setPrizeIndex(0);
    setStart(false);
    setSpinning(false);
    setIsLoading(false);
  };

  const renderPrizeItemMedia = (item: RoulettePrize) => {
    const caseItem = item.caseItem;

    if (caseItem.type === 'reward') {
      const media = caseItem.reward?.mediaFile;

      if (media?.mimeType === 'application/json' && animations[media.url]) {
        return (
          <RouletteLottie
            animationData={animations[media.url]}
            className="roulette-pro-regular-prize-item-image w-30 h-30"
            isSpinning={isSpinning}
          />
        );
      }

      if (media?.url && media.mimeType !== 'application/json') {
        return (
          <img
            src={media.url}
            alt={caseItem.reward?.name || 'Reward'}
            className="roulette-pro-regular-prize-item-image w-30 h-30 object-contain"
            loading="lazy"
          />
        );
      }
    }

    return (
      <div className="roulette-pro-regular-prize-item-image w-30 h-30 flex items-center justify-center">
        <PrizeIcon item={caseItem} className="text-6xl" />
      </div>
    );
  };

  const customPrizeItemRender = (item: unknown) => {
    const typed = item as RoulettePrize;
    return (
      <div className="roulette-pro-regular-prize-item">
        <div className="roulette-pro-regular-prize-item-wrapper">
          <div className="roulette-pro-regular-image-wrapper">{renderPrizeItemMedia(typed)}</div>
          <p className="roulette-pro-regular-prize-item-text">{typed.text}</p>
        </div>
      </div>
    );
  };

  if (!caseBox.items?.length) {
    return null;
  }

  const rouletteCenterStyle = {
    position: 'absolute',
    left: '50%',
    top: '0',
    transform: 'translateX(-50%)',
    width: '100px',
    height: '100%',
    background: 'rgba(0, 0, 0, 0)',
    zIndex: 999,
    pointerEvents: 'none',
  } as const;

  return (
    <div className="w-full flex flex-col items-center gap-4 mb-2">
      <div className="top-40 w-full overflow-hidden">
        <div className="roulette horizontal relative">
          <div className="roulette-center-target" style={rouletteCenterStyle} />
          <RoulettePro
            type={'horizontal' as RouletteType}
            prizes={prizes}
            start={start}
            prizeIndex={prizeIndex}
            onPrizeDefined={handlePrizeDefined}
            spinningTime={4}
            classes={{
              wrapper: 'roulette-pro-wrapper-additional-styles',
            }}
            options={{ stopInCenter: true, withoutAnimation: false }}
            defaultDesignOptions={{ prizesWithText: true, hideCenterDelimiter: true }}
            prizeItemRenderFunction={customPrizeItemRender}
          />
        </div>
      </div>

      <div className='flex flex-col gap-2 items-center'>
          <RouletteButton
            onStart={handleStart}
            disabled={isSpinning || isLoadingAnimations || availableCasesCount <= 0}
            isLoading={isLoading}
            label={isLoading ? t('opening') : t('open')}
          />
          <div className="text-xs text-gray-400 text-center">
            {t('boxes')}: {availableCasesCount}
          </div>
      </div>

      {/* Case items ribbon under the button */}
      <CaseItemsRibbon items={caseBox.items} animations={animations} />

      {localError ? <div className="text-sm text-red-400 text-center">{localError}</div> : null}

      <CaseOpenResultModal
        isOpen={showResult}
        onClose={handleCloseResult}
        openResult={openResult}
        animations={animations}
      />
    </div>
  );
});

export default CaseRoulette;
