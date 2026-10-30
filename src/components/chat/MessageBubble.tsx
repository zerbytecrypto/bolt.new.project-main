import { Avatar } from '@/components/chat/Avatar';
import type { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
  showAvatar: boolean;
  avatarSrc: string | null;
  avatarAlt: string;
  spacingClass: string;
}

export function MessageBubble({ message, showAvatar, avatarSrc, avatarAlt, spacingClass }: MessageBubbleProps) {
  const isSender = message.sender_role === 'sender';

  return (
    <div
      className={`flex animate-message-in items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'} ${spacingClass}`}
    >
      {!isSender &&
        (showAvatar ? (
          <Avatar src={avatarSrc} alt={avatarAlt} sizeClass="h-7 w-7" />
        ) : (
          <div className="w-7 shrink-0" aria-hidden="true" />
        ))}
      <div className={`flex max-w-[75%] flex-col gap-1 ${isSender ? 'items-end' : 'items-start'}`}>
        {message.image_url && (
          <img
            src={message.image_url}
            alt="Shared image"
            loading="lazy"
            className="max-h-80 max-w-full rounded-3xl bg-neutral-100 object-cover dark:bg-neutral-900"
          />
        )}
        {message.body && (
          <p
            className={`whitespace-pre-wrap break-words rounded-3xl px-4 py-2 text-[15px] leading-normal ${
              isSender
                ? 'rounded-br-md bg-primary-600 text-white'
                : 'rounded-bl-md bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
            }`}
          >
            {message.body}
          </p>
        )}
      </div>
    </div>
  );
}
