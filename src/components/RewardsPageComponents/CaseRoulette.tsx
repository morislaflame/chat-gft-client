import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import RoulettePro, { type RouletteType } from 'react-roulette-pro';
import 'react-roulette-pro/dist/index.css';
import { observer } from 'mobx-react-lite';

import type { CaseBox, CaseItem, OpenCaseResponse } from '@/http/caseAPI';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import { useAnimationLoader } from '@/utils/useAnimationLoader';
import LazyMediaRenderer from '@/utils/lazy-media-renderer';

import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/CoreComponents/Button';
import RouletteButton from './RouletteButton';
import RouletteLottie from './RouletteLottie';

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
        <PrizeIcon item={caseItem} className="text-2xl" />
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

  const sortedItemsForRibbon = useMemo(() => {
    const items = [...(caseBox.items || [])];
    // More probable first (like typical case contents UI)
    items.sort((a, b) => (b.weight || 0) - (a.weight || 0));
    return items;
  }, [caseBox.items]);

  const renderRibbonItem = (item: CaseItem) => {
    const isReward = item.type === 'reward';
    const title = isReward
      ? item.reward?.name || 'Reward'
      : item.type === 'gems'
        ? `+${item.amount ?? 0} ${t('gems')}`
        : `+${item.amount ?? 0} ${t('energy')}`;

    return (
      <div
        key={item.id}
        className="flex-shrink-0 w-28 bg-primary-800 border border-primary-700 rounded-xl p-3"
      >
        <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
          {isReward ? (
            <LazyMediaRenderer
              mediaFile={item.reward?.mediaFile}
              imageUrl={item.reward?.mediaFile?.mimeType !== 'application/json' ? item.reward?.mediaFile?.url : undefined}
              animations={animations}
              name={item.reward?.name || ''}
              className="w-16 h-16 object-contain"
              loop={false}
              loadOnIntersect={true}
            />
          ) : (
            <PrizeIcon item={item} className="text-3xl" />
          )}
        </div>
        <div className="text-xs text-gray-200 text-center font-medium truncate">{title}</div>
        <div className="text-[10px] text-gray-500 text-center mt-1">{item.weight}%</div>
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

  const renderResultBody = () => {
    if (!openResult) return null;

    const result = openResult.result;

    if (result.type === 'reward') {
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="w-28 h-28 flex items-center justify-center">
            <LazyMediaRenderer
              mediaFile={result.reward.mediaFile}
              imageUrl={result.reward.mediaFile?.mimeType !== 'application/json' ? result.reward.mediaFile?.url : undefined}
              animations={animations}
              name={result.reward.name}
              className="w-28 h-28 object-contain"
              loop={false}
              loadOnIntersect={false}
            />
          </div>
          <div className="text-white font-semibold text-lg text-center">{result.reward.name}</div>
        </div>
      );
    }

    const isGems = result.type === 'gems';
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-28 h-28 flex items-center justify-center">
          <i className={`fa-solid ${isGems ? 'fa-gem text-amber-400' : 'fa-bolt text-purple-400'} text-5xl`} />
        </div>
        <div className="text-white font-semibold text-lg text-center">
          +{result.amount} {t(isGems ? 'gems' : 'energy')}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
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
            defaultDesignOptions={{ prizesWithText: true, hideCenterDelimiter: false }}
            prizeItemRenderFunction={customPrizeItemRender}
          />
        </div>
      </div>

      <RouletteButton
        onStart={handleStart}
        disabled={isSpinning || isLoadingAnimations}
        isLoading={isLoading}
        label={isLoading ? t('opening') : t('open')}
      />

      {/* Case items ribbon under the button */}
      <div className="w-full">
        <div className="text-sm text-gray-300 mb-2">{t('caseContents')}</div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {sortedItemsForRibbon.map(renderRibbonItem)}
        </div>
      </div>

      {localError ? <div className="text-sm text-red-400 text-center">{localError}</div> : null}

      <Modal isOpen={showResult} onClose={handleCloseResult} closeOnOverlayClick={true} className="p-6">
        <div className="relative">
          <button
            onClick={handleCloseResult}
            className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-700 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <i className="fas fa-times text-white text-xl"></i>
          </button>

          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-white mb-2">{t('congratulations')}</h2>
            <p className="text-gray-300 text-sm">{t('youWon')}</p>
          </div>

          <div className="flex justify-center mb-6">{renderResultBody()}</div>

          <Button onClick={handleCloseResult} className="w-full" variant="secondary" size="lg">
            {t('close')}
          </Button>
        </div>
      </Modal>
    </div>
  );
});

export default CaseRoulette;
