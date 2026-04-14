import React, { memo } from 'react';
import { AnimatePresence } from 'motion/react';
import FormattedText from '../FormattedText';
import SuggestionButtons from './SuggestionButtons';
import type { ChatRetryPayload, Message } from '@/types/types';
import { useTranslate } from '@/utils/useTranslate';

interface MessageItemProps {
  message: Message;
  suggestions: string[];
  suggestionsMeta?: Array<{
    id: string;
    text: string;
    kind: 'core' | 'detour';
    payable?: boolean;
    artifact_action?: boolean;
    artifact_code?: string;
    artifact_action_type?: 'ACQUIRE' | 'USE';
    artifact_amount?: number;
    artifact_media?: { id: number; url: string; mimeType: string } | null;
  }> | null;
  showSuggestions: boolean;
  avatarUrl?: string;
  onArtifactDisabledClick?: () => void;
  onSelectSuggestion: (text: string, suggestionId?: string | null, payGemsForSuggestionId?: string | null) => void;
  onRetryLlmFormat?: (payload: ChatRetryPayload) => void;
  onReloadApp?: () => void;
}

const MessageItem: React.FC<MessageItemProps> = memo(({
  message,
  suggestions,
  suggestionsMeta,
  showSuggestions,
  avatarUrl,
  onArtifactDisabledClick,
  onSelectSuggestion,
  onRetryLlmFormat,
  onReloadApp,
}) => {
  const { t } = useTranslate();

  return (
  <div className="message-container flex items-start mb-6">
    <div className={`flex-1 ${message.isUser ? 'flex justify-end' : ''}`}>
      {message.isUser ? (
        <div className="rounded-xl px-4 py-3 bg-user-message max-w-xs">
          <div className="text-md text-zinc">
            <span className="whitespace-pre-wrap">{message.text}</span>
          </div>
        </div>
      ) : message.chatErrorKind === 'llm_format' && message.chatRetryPayload ? (
        <div className="bg-[#2a2318] border border-amber-700/40 rounded-xl rounded-tl-none px-4 py-3 max-w-sm">
          <p className="text-md text-amber-100/95 whitespace-pre-wrap mb-3">{message.text}</p>
          <button
            type="button"
            className="w-full rounded-lg bg-amber-600/90 hover:bg-amber-600 text-white text-sm font-medium py-2.5 px-3 transition-colors"
            onClick={() => onRetryLlmFormat?.(message.chatRetryPayload!)}
          >
            {t('chatSendMessageAgain')}
          </button>
        </div>
      ) : message.chatErrorKind === 'reload_app' ? (
        <div className="bg-[#1f2328] border border-red-900/35 rounded-xl rounded-tl-none px-4 py-3 max-w-sm">
          <p className="text-md text-zinc-200 whitespace-pre-wrap mb-3">{message.text}</p>
          <button
            type="button"
            className="w-full rounded-lg bg-zinc-600 hover:bg-zinc-500 text-white text-sm font-medium py-2.5 px-3 transition-colors"
            onClick={() => onReloadApp?.()}
          >
            {t('chatReloadApp')}
          </button>
        </div>
      ) : (
        <div className="bg-[#1f1f1f] rounded-xl rounded-tl-none overflow-hidden px-4 py-3 min-h-[4rem] relative">
          {/* Avatar as background, top-right */}
          <div
            className="absolute inset-0 bg-no-repeat bg-[length:20rem_20rem] bg-[position:top_-5rem_right_-5rem] rounded-xl rounded-tl-none opacity-20"
            style={{
              backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined,
            }}
            aria-hidden
          />
          {!avatarUrl && (
            <div className="absolute top-3 right-3 w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center opacity-20" aria-hidden>
              <i className="fas fa-mask text-lg" />
            </div>
          )}
          {/* Gradient overlay: lighter top-right → darker bottom-left */}
          <div
            className="absolute inset-0 rounded-xl rounded-tl-none agent-message-gradient"
            aria-hidden
          />
          {/* Float spacer so text wraps around avatar area (top-right) */}
          <div className="float-right w-20 h-20 shrink-0 ml-2 mb-1" aria-hidden />
          <div className="relative text-md">
            <FormattedText text={message.text} />
            <AnimatePresence mode="popLayout">
              {showSuggestions && (
                <SuggestionButtons
                  suggestions={suggestions}
                  suggestionsMeta={suggestionsMeta ?? undefined}
                  onArtifactDisabledClick={onArtifactDisabledClick}
                  onSelectSuggestion={onSelectSuggestion}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  </div>
  );
});

MessageItem.displayName = 'MessageItem';

export default MessageItem;

