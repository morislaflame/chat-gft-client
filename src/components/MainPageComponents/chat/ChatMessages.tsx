import React from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import MissionCard from './MissionCard';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';
import type { RefObject } from 'react';

interface ChatMessagesProps {
  onStartMission: (orderIndex: number) => void;
  onSelectSuggestion: (text: string) => void;
  messageEndRef: RefObject<HTMLDivElement | null>;
}

const ChatMessages: React.FC<ChatMessagesProps> = observer(({
  onStartMission,
  onSelectSuggestion,
  messageEndRef,
}) => {
  const { chat } = React.useContext(Context) as IStoreContext;
  const { hapticImpact } = useHapticFeedback();

  const messages = chat.messages ?? [];
  const suggestions = chat.suggestions ?? [];
  const avatarUrl = chat.avatar?.url;

  const handleSelectSuggestion = (text: string) => {
    hapticImpact('soft');
    onSelectSuggestion(text);
  };

  const isMobile = document.body.classList.contains('telegram-mobile');

  return (
    <div className="space-y-6" style={{ marginTop: isMobile ? '156px' : '56px' }}>
      {messages.map((message, index) => {
        if (message.isMissionCard && message.mission) {
          return (
            <MissionCard
              key={message.id}
              message={message}
              onStartMission={onStartMission}
            />
          );
        }

        const isLastAIMessage = !message.isUser && index === messages.length - 1;
        const showSuggestions = isLastAIMessage && suggestions.length > 0 && !chat.isTyping;

        return (
          <MessageItem
            key={message.id}
            message={message}
            suggestions={suggestions}
            showSuggestions={showSuggestions}
            avatarUrl={avatarUrl}
            onSelectSuggestion={handleSelectSuggestion}
          />
        );
      })}

      {/* Typing Indicator */}
      {chat.isTyping && <TypingIndicator avatarUrl={avatarUrl} />}

      <div ref={messageEndRef} className="mb-[128px]" />
    </div>
  );
});

export default ChatMessages;

