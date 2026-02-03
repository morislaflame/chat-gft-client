import React from 'react';
import type { CaseBox } from '@/http/caseAPI';
import { LazyMediaRenderer } from '@/utils/lazy-media-renderer';
import Button from '@/components/ui/button';

type OwnedBoxCardProps = {
  box: CaseBox;
  count: number;
  animations: { [url: string]: Record<string, unknown> };
  onOpen: (box: CaseBox) => void;
  t: (key: string) => string;
  language: 'ru' | 'en';
};

const OwnedBoxCard: React.FC<OwnedBoxCardProps> = ({ box, count, animations, onOpen, t, language }) => {
  const openLabel = count > 1 ? `${t('open')} x ${count}` : t('open');
  const title = (language === 'en' ? (box.nameEn || box.name) : box.name) || box.name;
  const description =
    ((language === 'en' ? (box.descriptionEn || box.description) : box.description) ?? null) ||
    null;

  return (
    <div className="bg-card border border-primary-700 rounded-xl p-4 flex flex-col items-center">
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

      <div className="w-full mt-3">
        <Button
          onClick={() => onOpen(box)}
          variant="default"
          size="sm"
          className="w-full"
          icon="fas fa-arrow-right"
        >
          {openLabel}
        </Button>
      </div>
    </div>
  );
};

export default OwnedBoxCard;

