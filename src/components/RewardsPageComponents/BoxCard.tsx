import React from 'react';
import { type CaseBox } from '@/http/caseAPI';
import { LazyMediaRenderer } from '@/utils/lazy-media-renderer';
import Button from '../CoreComponents/Button';

type BoxCardProps = {
  box: CaseBox;
  animations: { [url: string]: Record<string, unknown> };
  onClick: (box: CaseBox) => void;
  onPurchase: (box: CaseBox) => void;
  isPurchasing: boolean;
  canAfford: boolean;
  t: (key: string) => string;
};

const BoxCard: React.FC<BoxCardProps> = ({
  box,
  animations,
  onClick,
  onPurchase,
  isPurchasing,
  canAfford,
  t,
}) => {
  return (
    <div
      className="bg-primary-800 border border-primary-700 rounded-xl p-4 flex flex-col items-center hover:bg-primary-700/50 transition cursor-pointer"
      onClick={() => onClick(box)}
    >
      <div className="mb-2 flex items-center justify-center">
        <LazyMediaRenderer
          mediaFile={box.mediaFile}
          animations={animations}
          name={box.name}
          className="w-26 h-26 object-contain"
          loop={false}
          loadOnIntersect
        />
      </div>

      <div className="text-center flex-1">
        <div className="text-md text-white mb-1 font-semibold">{box.name}</div>
        {box.description && (
          <div className="text-xs text-gray-300 line-clamp-2">{box.description}</div>
        )}
      </div>

      <div
        className="w-full mt-3"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Button
          onClick={() => onPurchase(box)}
          disabled={isPurchasing || !canAfford}
          variant={canAfford && !isPurchasing ? 'secondary' : 'primary'}
          size="sm"
          className="w-full"
          icon={isPurchasing ? 'fas fa-spinner fa-spin' : !canAfford ? 'fas fa-lock' : undefined}
        >
          {isPurchasing ? t('purchasing') : (
            <span className="flex items-center gap-1 justify-center">
              {box.price} <i className="fa-solid fa-gem text-white"></i>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BoxCard;
