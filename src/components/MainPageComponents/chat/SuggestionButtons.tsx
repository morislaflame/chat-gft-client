import React, { memo, useContext, useState } from 'react';
import { motion } from 'motion/react';
import Button from '@/components/ui/button';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { trackEvent } from '@/utils/analytics';
import type { ChatSuggestion } from '@/types/types';

const PAYABLE_EXTRA_ENERGY_COST = 5;

interface SuggestionButtonsProps {
  suggestions: ChatSuggestion[];
  onArtifactDisabledClick?: () => void;
  onSelectSuggestion: (
    text: string,
    suggestionId?: string | null,
    payGemsForSuggestionId?: string | null,
  ) => void;
  formatError?: boolean;
  onReportFormatError?: () => Promise<void>;
}

const SuggestionButtons: React.FC<SuggestionButtonsProps> = memo(({
  suggestions,
  onArtifactDisabledClick,
  onSelectSuggestion,
  formatError = false,
  onReportFormatError,
}) => {
  const { user, chat } = useContext(Context) as IStoreContext;
  const energy = user?.user?.energy ?? 0;
  const userArtifacts = user?.user?.artifacts ?? [];
  const [reportStatus, setReportStatus] = useState<'idle' | 'loading' | 'sent'>('idle');

  // Для USE: disabled если у юзера нет артефакта или quantity < amount
  const hasArtifact = (code: string, amount: number) => {
    const a = userArtifacts.find((x) => x.code === code);
    return (a?.quantity ?? 0) >= amount;
  };

  const handleSuggestionClick = (
    suggestion: string,
    sid: string,
    payGemsForSuggestionId: string | null,
    isArtifactAction: boolean,
    isArtifactUse: boolean,
    isArtifactDisabled: boolean,
  ) => {
    if (isArtifactDisabled) {
      onArtifactDisabledClick?.();
      return;
    }
    if (payGemsForSuggestionId) {
      // +1 — обычная цена отправки сообщения, +N — доплата за payable.
      const requiredEnergy = 1 + PAYABLE_EXTRA_ENERGY_COST;
      if (energy < requiredEnergy) {
        chat.setInsufficientEnergy(true);
        return;
      }
    }
    if (isArtifactAction && !isArtifactUse) {
      trackEvent('artifact_action_click', { suggestion_id: sid });
    }
    onSelectSuggestion(suggestion, sid, payGemsForSuggestionId);
  };

  return (
    <motion.div
      key="suggestions"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="mt-3"
    >
      {formatError && (
        <p className="mb-2 text-xs leading-snug text-amber-200/90">
          Модель отправила некорректный формат действий, выберите из сервисных.
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {suggestions.map((suggestion, suggestionIndex) => {
          const sid = suggestion.id || `s${suggestionIndex + 1}`;
          const isPayable = suggestion.payable === true;
          const isArtifactAction = suggestion.artifact_action === true;
          const isArtifactUse = suggestion.artifact_action_type === 'USE';
          const artifactAmount = suggestion.artifact_amount ?? 1;
          const artifactCode = (suggestion.artifact_code || '').trim();
          const artifactMedia = suggestion.artifact_media;
          const isArtifactImage =
            Boolean(artifactMedia?.url && artifactMedia.mimeType?.startsWith('image/'));
          const isArtifactDisabled = Boolean(isArtifactUse && artifactCode && !hasArtifact(artifactCode, artifactAmount));
          return (
            <Button
              key={suggestion.id || suggestionIndex}
              variant="default"
              size="sm"
              aria-disabled={isArtifactDisabled}
              onClick={() => handleSuggestionClick(
                suggestion.text,
                sid,
                isPayable ? sid : null,
                isArtifactAction,
                isArtifactUse,
                isArtifactDisabled,
              )}
              className={[
                "px-3 py-auto text-xs whitespace-normal h-full min-h-0 flex items-center text-center gap-2",
                isPayable && "ring-1 ring-[#b249f8]/60 bg-[#b249f8]/20",
                isArtifactAction && "ring-1 ring-amber-400/40 bg-gradient-to-br from-amber-500/20 at-transparent to-transparent",
                isArtifactDisabled && "opacity-60 cursor-not-allowed",
              ].filter(Boolean).join(" ")}
            >
              <span className="flex-1 text-left break-words min-w-0">{suggestion.text}</span>
              {isPayable && (
                <span className="flex items-center gap-1 shrink-0">
                  <i className="fa-solid fa-bolt text-user-message-gradient text-sm"></i>
                  <span className="font-semibold text-user-message-gradient">{PAYABLE_EXTRA_ENERGY_COST}</span>
                </span>
              )}
              {isArtifactAction && !isPayable && (
                <span
                  className={`shrink-0 flex h-12 w-12 items-center justify-center overflow-hidden rounded-md ${
                    isArtifactDisabled ? 'opacity-60' : ''
                  }`}
                >
                  {isArtifactImage ? (
                    <img
                      src={artifactMedia!.url}
                      alt=""
                      className={`h-full w-full object-contain ${
                        isArtifactDisabled ? 'grayscale brightness-[0.75]' : ''
                      }`}
                    />
                  ) : (
                    <i
                      className={`fa-solid fa-wand-magic-sparkles text-sm ${
                        isArtifactDisabled ? 'text-zinc-500' : 'text-amber-400/90'
                      }`}
                    />
                  )}
                </span>
              )}
            </Button>
          );
        })}
        {formatError && onReportFormatError && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="px-3 py-auto text-xs whitespace-normal h-full min-h-0 btn-destructive-gradient-border"
            state={
              reportStatus === 'loading'
                ? 'loading'
                : reportStatus === 'sent'
                  ? 'success'
                  : 'default'
            }
            disabled={reportStatus === 'loading' || reportStatus === 'sent'}
            onClick={async () => {
              if (reportStatus !== 'idle') return;
              setReportStatus('loading');
              try {
                await onReportFormatError();
                setReportStatus('sent');
              } catch {
                setReportStatus('idle');
              }
            }}
          >
            {reportStatus === 'sent' ? 'Репорт отправлен' : 'Репорт'}
          </Button>
        )}
      </div>
    </motion.div>
  );
});

SuggestionButtons.displayName = 'SuggestionButtons';

export default SuggestionButtons;

