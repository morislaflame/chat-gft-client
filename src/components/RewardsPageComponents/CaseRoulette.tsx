import { useMemo } from 'react';
import RoulettePro, { type RouletteType } from 'react-roulette-pro';
import 'react-roulette-pro/dist/index.css';
import type { CaseBox, CaseItem } from '@/http/caseAPI';
import { useTranslate } from '@/utils/useTranslate';

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

const PrizeIcon: React.FC<{ item: CaseItem }> = ({ item }) => {
  if (item.type === 'gems') {
    return <i className="fa-solid fa-gem text-amber-400 text-2xl" />;
  }
  if (item.type === 'energy') {
    return <i className="fa-solid fa-bolt text-purple-400 text-2xl" />;
  }
  return <i className="fas fa-gift text-white text-2xl" />;
};

const CaseRoulette: React.FC<{ caseBox: CaseBox }> = ({ caseBox }) => {
  const { t } = useTranslate();

  const prizes = useMemo(() => {
    const items = caseBox.items || [];
    const base: RoulettePrize[] = items.map((item) => {
      if (item.type === 'reward') {
        return {
          id: String(item.id),
          image: '',
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

  const customPrizeItemRender = (item: RoulettePrize) => {
    return (
      <div className="roulette-pro-regular-prize-item">
        <div className="roulette-pro-regular-prize-item-wrapper">
          <div className="roulette-pro-regular-image-wrapper">
            <div className="roulette-pro-regular-prize-item-image w-30 h-30 flex items-center justify-center">
              <PrizeIcon item={item.caseItem} />
            </div>
          </div>
          <p className="roulette-pro-regular-prize-item-text">{item.text}</p>
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
    <div className="w-full flex flex-col items-center gap-6">
      <div className="top-40 w-full overflow-hidden">
        <div className="roulette horizontal relative">
          <div className="roulette-center-target" style={rouletteCenterStyle} />
          <RoulettePro
            type={'horizontal' as RouletteType}
            prizes={prizes}
            start={false}
            prizeIndex={0}
            onPrizeDefined={() => {}}
            spinningTime={1}
            classes={{
              wrapper: 'roulette-pro-wrapper-additional-styles',
            }}
            options={{ stopInCenter: true, withoutAnimation: false }}
            defaultDesignOptions={{ prizesWithText: true, hideCenterDelimiter: false }}
            prizeItemRenderFunction={customPrizeItemRender}
          />
        </div>
      </div>
    </div>
  );
};

export default CaseRoulette;

