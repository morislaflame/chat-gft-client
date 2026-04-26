import React, { memo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import Button from '@/components/ui/button';
import FormattedText from '../FormattedText';
import SuggestionButtons from './SuggestionButtons';
import type { ChatRetryPayload, ChatSuggestion, ClientErrorReportPayload, Message } from '@/types/types';
import { useTranslate } from '@/utils/useTranslate';

interface MessageItemProps {
  message: Message;
  suggestions: ChatSuggestion[];
  showSuggestions: boolean;
  avatarUrl?: string;
  onArtifactDisabledClick?: () => void;
  onSelectSuggestion: (text: string, suggestionId?: string | null, payGemsForSuggestionId?: string | null) => void;
  onRetryLlmFormat?: (payload: ChatRetryPayload) => void;
  onReloadApp?: () => void;
  onSubmitErrorReport?: (payload: ClientErrorReportPayload) => Promise<void>;
}

const MessageItem: React.FC<MessageItemProps> = memo(({
  message,
  suggestions,
  showSuggestions,
  avatarUrl,
  onArtifactDisabledClick,
  onSelectSuggestion,
  onRetryLlmFormat,
  onReloadApp,
  onSubmitErrorReport,
}) => {
  const { t } = useTranslate();
  const [reportStatus, setReportStatus] = useState<'idle' | 'loading' | 'sent'>('idle');

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
          <Button
            type="button"
            variant="gradient"
            size="sm"
            className="w-full ring-1 ring-amber-400/50"
            onClick={() => onRetryLlmFormat?.(message.chatRetryPayload!)}
          >
            {t('chatSendMessageAgain')}
          </Button>
        </div>
      ) : message.chatErrorKind === 'reload_app' ? (
        <div className="btn-default-silver-border rounded-xl rounded-tl-none px-4 py-3 max-w-sm">
          <p className="text-md text-zinc-200 whitespace-pre-wrap mb-3">{message.text}</p>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="w-full"
            onClick={() => onReloadApp?.()}
          >
            {t('chatReloadApp')}
          </Button>
          {message.errorReportContext ? (
            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-xs text-zinc-400 leading-snug mb-2">{t('chatErrorReportHint')}</p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="w-full btn-destructive-gradient-border"
                state={
                  reportStatus === 'loading'
                    ? 'loading'
                    : reportStatus === 'sent'
                      ? 'success'
                      : 'default'
                }
                disabled={reportStatus === 'sent' || reportStatus === 'loading'}
                onClick={async () => {
                  if (!message.errorReportContext || !onSubmitErrorReport) return;
                  if (reportStatus === 'sent') return;
                  setReportStatus('loading');
                  try {
                    await onSubmitErrorReport(message.errorReportContext);
                    setReportStatus('sent');
                  } catch {
                    setReportStatus('idle');
                  }
                }}
              >
                {reportStatus === 'sent'
                  ? t('chatErrorReportSuccessful')
                  : reportStatus === 'loading'
                    ? t('chatErrorReportSending')
                    : t('chatSendErrorReport')}
              </Button>
            </div>
          ) : null}
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

