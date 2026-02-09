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
    <div className={`flex-1 ${message.isUser ? 'flex justify-end' : ''}`}>
      {message.isUser ? (
        <div className="rounded-xl px-4 py-3 bg-user-message max-w-xs">
          <div className="text-md text-zinc">
            <span className="whitespace-pre-wrap">{message.text}</span>
          </div>
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
                  onSelectSuggestion={onSelectSuggestion}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  </div>
));

MessageItem.displayName = 'MessageItem';

export default MessageItem;

