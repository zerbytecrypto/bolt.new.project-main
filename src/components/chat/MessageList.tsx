import { Fragment, useEffect, useRef } from 'react';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ProfileIntro } from '@/components/chat/ProfileIntro';
import { formatMessageTime } from '@/lib/time';
import type { Conversation, Message } from '@/types/chat';

const TIME_DIVIDER_GAP_MS = 30 * 60 * 1000;

interface MessageListProps {
  conversation: Conversation;
  messages: Message[];
  onEditProfile: () => void;
}

export function MessageList({ conversation, messages, onEditProfile }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
      <ProfileIntro conversation={conversation} onEditProfile={onEditProfile} />
      <div className="flex flex-col gap-1 px-3 pb-6">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
            No messages yet. Send the first one above.
          </p>
        )}
        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const next = messages[index + 1];
          const showTime =
            !previous ||
            new Date(message.created_at).getTime() - new Date(previous.created_at).getTime() > TIME_DIVIDER_GAP_MS;
          const startsGroup = showTime || previous.sender_role !== message.sender_role;
          const isLastInGroup = !next || next.sender_role !== message.sender_role;

          return (
            <Fragment key={message.id}>
              {showTime && (
                <p className="pb-1 pt-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
                  {formatMessageTime(message.created_at)}
                </p>
              )}
              <MessageBubble
                message={message}
                showAvatar={isLastInGroup}
                avatarSrc={conversation.receiver_avatar_url}
                avatarAlt={conversation.receiver_name}
                spacingClass={startsGroup && !showTime ? 'mt-3' : ''}
              />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
