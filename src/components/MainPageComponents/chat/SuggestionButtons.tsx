import React, { memo, useContext } from 'react';
import { motion } from 'motion/react';
import Button from '@/components/ui/button';
import { Context, type IStoreContext } from '@/store/StoreProvider';

const PAYABLE_GEMS_COST = 5;

interface SuggestionMeta {
  id: string;
  text: string;
  kind: 'core' | 'detour';
  payable?: boolean;
}

interface SuggestionButtonsProps {
  suggestions: string[];
  suggestionsMeta?: SuggestionMeta[] | null;
  artifactAction?: {
    id: number;
    ui_label?: string | null;
    enabled: boolean;
    missing_reason?: string | null;
  } | null;
  onSelectSuggestion: (
    text: string,
    suggestionId?: string | null,
    payGemsForSuggestionId?: string | null,
  ) => void;
  onSelectArtifactAction: (action: { id: number; ui_label?: string | null; enabled: boolean }) => void;
}

const SuggestionButtons: React.FC<SuggestionButtonsProps> = memo(({
  suggestions,
  suggestionsMeta,
  artifactAction,
  onSelectSuggestion,
  onSelectArtifactAction,
}) => {
  const { user, chat } = useContext(Context) as IStoreContext;
  const balance = user?.user?.balance ?? 0;

  const handleSuggestionClick = (
    suggestion: string,
    sid: string,
    payGemsForSuggestionId: string | null,
  ) => {
    if (payGemsForSuggestionId) {
      if (balance < PAYABLE_GEMS_COST) {
        chat.setInsufficientGems(true);
        return;
      }
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
      {artifactAction && (
        <Button
          key="artifact-action"
          variant="default"
          size="sm"
          disabled={!artifactAction.enabled}
          onClick={() => onSelectArtifactAction({ id: artifactAction.id, ui_label: artifactAction.ui_label, enabled: artifactAction.enabled })}
          className={[
            "col-span-2 rounded-lg px-2 py-auto text-xs text-center whitespace-normal h-full min-h-0",
            artifactAction.enabled ? "ring-1 ring-yellow-400/70 bg-yellow-500/15" : "opacity-60",
          ].join(" ")}
          title={artifactAction.missing_reason || undefined}
        >
          {artifactAction.ui_label || 'Artifact action'}
        </Button>
      )}
      {suggestions.map((suggestion, suggestionIndex) => {
        const sid = `s${suggestionIndex + 1}`;
        const meta = suggestionsMeta?.find((m) => m.id === sid);
        const isPayable = meta?.payable === true;
        return (
          <Button
            key={suggestionIndex}
            variant="default"
            size="sm"
            onClick={() => handleSuggestionClick(
              suggestion,
              sid,
              isPayable ? sid : null,
            )}
            className={[
              "rounded-lg px-2 py-auto text-xs whitespace-normal h-full min-h-0 flex items-center text-center gap-2",
              isPayable && "ring-1 ring-amber-400/60 bg-amber-500/20",
            ].filter(Boolean).join(" ")}
          >
            <span className="flex-1 text-left break-words min-w-0">{suggestion}</span>
            {isPayable && (
              <span className="flex items-center gap-1 shrink-0">
                <i className="fa-solid fa-gem text-secondary-gradient text-sm"></i>
                <span className="font-semibold text-secondary-gradient">{PAYABLE_GEMS_COST}</span>
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

