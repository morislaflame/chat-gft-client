import React from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import MissionCard from './MissionCard';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';
import type { ChatRetryPayload, ClientErrorReportPayload } from '@/types/types';
import type { RefObject } from 'react';

interface ChatMessagesProps {
  onStartMission: (orderIndex: number) => void;
  onOpenArtifactsExplainer?: () => void;
  onArtifactDisabledClick?: () => void;
  onSelectSuggestion: (
    text: string,
    suggestionId?: string | null,
    payGemsForSuggestionId?: string | null,
  ) => void;
  onRetryLlmFormat?: (payload: ChatRetryPayload) => void;
  onReloadApp?: () => void;
  onSubmitErrorReport?: (payload: ClientErrorReportPayload) => Promise<void>;
  messageEndRef: RefObject<HTMLDivElement | null>;
}

const ChatMessages: React.FC<ChatMessagesProps> = observer(({
  onStartMission,
  onOpenArtifactsExplainer,
  onArtifactDisabledClick,
  onSelectSuggestion,
  onRetryLlmFormat,
  onReloadApp,
  onSubmitErrorReport,
  messageEndRef,
}) => {
  const { chat } = React.useContext(Context) as IStoreContext;
  const { hapticImpact } = useHapticFeedback();

  const messages = chat.messages ?? [];
  const suggestions = chat.suggestions ?? [];
  const avatarUrl = chat.avatar?.url;

  const handleSelectSuggestion = (
    text: string,
    suggestionId?: string | null,
    payGemsForSuggestionId?: string | null,
  ) => {
    hapticImpact('soft');
    onSelectSuggestion(text, suggestionId ?? null, payGemsForSuggestionId ?? null);
  };

  const isMobile = document.body.classList.contains('telegram-mobile');

  return (
    <div className="space-y-6 pb-8" style={{ marginTop: isMobile ? '166px' : '66px' }}>
      {messages.map((message, index) => {
        if (message.isMissionCard && message.mission) {
          return (
            <MissionCard
              key={message.id}
              message={message}
              onStartMission={onStartMission}
              onOpenArtifactsExplainer={onOpenArtifactsExplainer}
            />
          );
        }

        const isLastAIMessage = !message.isUser && index === messages.length - 1;
        const showSuggestions =
          isLastAIMessage &&
          !message.chatErrorKind &&
          suggestions.length > 0 &&
          !chat.isTyping;

        return (
          <MessageItem
            key={message.id}
            message={message}
            suggestions={suggestions}
            suggestionsFormatError={chat.suggestionsFormatError}
            suggestionsFormatErrorReportContext={chat.suggestionsFormatErrorReportContext}
            showSuggestions={showSuggestions}
            avatarUrl={avatarUrl}
            onArtifactDisabledClick={onArtifactDisabledClick}
            onSelectSuggestion={handleSelectSuggestion}
            onRetryLlmFormat={onRetryLlmFormat}
            onReloadApp={onReloadApp}
            onSubmitErrorReport={onSubmitErrorReport}
          />
        );
      })}

      {/* Typing Indicator */}
      {chat.isTyping && <TypingIndicator avatarUrl={avatarUrl} />}

      <div ref={messageEndRef} />
    </div>
  );
});

export default ChatMessages;

