import React, { memo } from 'react';
import { AnimatePresence } from 'motion/react';
import FormattedText from '../FormattedText';
import SuggestionButtons from './SuggestionButtons';
import type { Message } from '@/types/types';

interface MessageItemProps {
  message: Message;
  suggestions: string[];
  showSuggestions: boolean;
  avatarUrl?: string;
  onSelectSuggestion: (text: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = memo(({
  message,
  suggestions,
  showSuggestions,
  avatarUrl,
  onSelectSuggestion,
}) => (
  <div className="message-container flex items-start mb-6">
    {!message.isUser && (
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mr-2 overflow-hidden p-1">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <i className="fas fa-mask text-xs"></i>
        )}
      </div>
    )}
    <div className={`flex-1 ${message.isUser ? 'flex justify-end' : ''}`}>
      <div className={`rounded-xl px-4 py-3 ${
        message.isUser
          ? 'bg-secondary-500 max-w-xs'
          : 'bg-primary-800 rounded-tl-none'
      }`}>
        <div className="text-sm">
          {message.isUser ? (
            <span className="whitespace-pre-wrap">{message.text}</span>
          ) : (
            <>
              <FormattedText text={message.text} />
              <AnimatePresence mode="popLayout">
                {showSuggestions && (
                  <SuggestionButtons
                    suggestions={suggestions}
                    onSelectSuggestion={onSelectSuggestion}
                  />
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
));

MessageItem.displayName = 'MessageItem';

export default MessageItem;

