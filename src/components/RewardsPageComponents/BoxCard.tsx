import React from 'react';
import { type CaseBox } from '@/http/caseAPI';
import { LazyMediaRenderer } from '@/utils/lazy-media-renderer';
import { getCaseBoxBackdropSrc } from '@/utils/caseBoxBackdrop';
import Button from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type BoxCardProps = {
  box: CaseBox;
  animations: { [url: string]: Record<string, unknown> };
  onClick: (box: CaseBox) => void;
  onPurchase: (box: CaseBox) => void;
  onOpen?: (box: CaseBox) => void;
  isPurchasing: boolean;
  isDisabled?: boolean;
  canAfford: boolean;
  hasUnopenedCase?: boolean;
  unopenedCount?: number;
  t: (key: string) => string;
  language: 'ru' | 'en';
};

const BoxCard: React.FC<BoxCardProps> = ({
  box,
  animations,
  onClick,
  onPurchase,
  onOpen,
  isPurchasing,
  isDisabled = false,
  canAfford,
  hasUnopenedCase = false,
  unopenedCount = 0,
  t,
  language,
}) => {
  const title = (language === 'en' ? (box.nameEn || box.name) : box.name) || box.name;
  const description =
    ((language === 'en' ? (box.descriptionEn || box.description) : box.description) ?? null) ||
    null;

  const boxBackdropSrc = getCaseBoxBackdropSrc(title || box.name || '');

  return (
    <Card
      onClick={() => onClick(box)}
      className="quest-item hover:bg-primary-700/50 relative cursor-pointer overflow-hidden transition"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <img
          src={boxBackdropSrc}
          alt=""
          className="absolute top-0 left-0 h-[100%] w-full object-cover object-top opacity-20"
        />
      </div>
      <div className="mb-2 flex items-center justify-center">
        <LazyMediaRenderer
          mediaFile={box.mediaFile}
          animations={animations}
          name={title}
          className="w-26 h-26 object-contain"
          loop={false}
          loadOnIntersect
        />
      </div>

      <div className="text-center flex-1">
        <div className="text-md text-white mb-1 font-semibold">{title}</div>
        {description && (
          <div className="text-xs text-gray-300 line-clamp-2">{description}</div>
        )}
      </div>

      <div
        className="w-full mt-3"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {hasUnopenedCase && onOpen ? (
          <Button
            onClick={() => onOpen(box)}
            variant="default"
            size="sm"
            className="w-full"
            icon="fas fa-arrow-right"
          >
            {unopenedCount > 1 ? `${t('open')} x ${unopenedCount}` : t('open')}
          </Button>
        ) : (
          <Button
            onClick={() => onPurchase(box)}
            disabled={isPurchasing || isDisabled || !canAfford}
            variant={canAfford && !isPurchasing ? 'gradient' : 'default'}
            size="sm"
            className="w-full"
            state={isPurchasing ? 'loading' : 'default'}
            icon={!canAfford ? 'fas fa-lock' : undefined}
          >
            <span className="flex items-center gap-1 justify-center">
              {box.price} <i className="fa-solid fa-gem text-white"></i>
            </span>
          </Button>
        )}
      </div>
    </Card>
  );
};

export default BoxCard;
