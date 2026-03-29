import React, { memo, useContext } from 'react';
import { motion } from 'motion/react';
import Button from '@/components/ui/button';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { trackEvent } from '@/utils/analytics';

const PAYABLE_GEMS_COST = 5;

interface SuggestionMeta {
  id: string;
  text: string;
  kind: 'core' | 'detour';
  payable?: boolean;
  artifact_action?: boolean;
  artifact_code?: string;
  artifact_action_type?: 'ACQUIRE' | 'USE';
  artifact_amount?: number;
}

interface SuggestionButtonsProps {
  suggestions: string[];
  suggestionsMeta?: SuggestionMeta[] | null;
  onSelectSuggestion: (
    text: string,
    suggestionId?: string | null,
    payGemsForSuggestionId?: string | null,
  ) => void;
}

const SuggestionButtons: React.FC<SuggestionButtonsProps> = memo(({
  suggestions,
  suggestionsMeta,
  onSelectSuggestion,
}) => {
  const { user, chat } = useContext(Context) as IStoreContext;
  const balance = user?.user?.balance ?? 0;
  const userArtifacts = user?.user?.artifacts ?? [];

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
  ) => {
    if (payGemsForSuggestionId) {
      if (balance < PAYABLE_GEMS_COST) {
        chat.setInsufficientGems(true);
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
      className="mt-3 grid grid-cols-2 gap-2"
    >
      {suggestions.map((suggestion, suggestionIndex) => {
        const sid = `s${suggestionIndex + 1}`;
        const meta = suggestionsMeta?.find((m) => m.id === sid);
        const isPayable = meta?.payable === true;
    const isArtifactAction = meta?.artifact_action === true;
    const isArtifactUse = meta?.artifact_action_type === 'USE';
        const artifactAmount = meta?.artifact_amount ?? 1;
        const artifactCode = (meta?.artifact_code || '').trim();
        const isArtifactDisabled = Boolean(isArtifactUse && artifactCode && !hasArtifact(artifactCode, artifactAmount));
        return (
          <Button
            key={suggestionIndex}
            variant="default"
            size="sm"
            disabled={isArtifactDisabled}
            onClick={() => handleSuggestionClick(
              suggestion,
              sid,
              isPayable ? sid : null,
              isArtifactAction,
              isArtifactUse,
            )}
            className={[
              "rounded-lg px-2 py-auto text-xs whitespace-normal h-full min-h-0 flex items-center text-center gap-2",
              isPayable && "ring-1 ring-amber-400/60 bg-amber-500/20",
              isArtifactAction && "ring-1 ring-yellow-400/70 bg-yellow-500/15",
              isArtifactDisabled && "opacity-60 cursor-not-allowed",
            ].filter(Boolean).join(" ")}
          >
            <span className="flex-1 text-left break-words min-w-0">{suggestion}</span>
            {isPayable && (
              <span className="flex items-center gap-1 shrink-0">
                <i className="fa-solid fa-gem text-secondary-gradient text-sm"></i>
                <span className="font-semibold text-secondary-gradient">{PAYABLE_GEMS_COST}</span>
              </span>
            )}
            {isArtifactAction && !isPayable && (
              <span className={`shrink-0 ${isArtifactDisabled ? 'text-zinc-500' : 'text-yellow-400/90'}`}>
                <i className="fa-solid fa-wand-magic-sparkles text-sm" />
              </span>
            )}
          </Button>
        );
      })}
    </motion.div>
  );
});

SuggestionButtons.displayName = 'SuggestionButtons';

export default SuggestionButtons;

