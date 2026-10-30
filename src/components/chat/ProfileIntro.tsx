import { Avatar } from '@/components/chat/Avatar';
import { formatActivityLabel } from '@/lib/time';
import type { Conversation } from '@/types/chat';

interface ProfileIntroProps {
  conversation: Conversation;
  onEditProfile: () => void;
}

export function ProfileIntro({ conversation, onEditProfile }: ProfileIntroProps) {
  return (
    <section className="flex flex-col items-center px-6 pb-8 pt-10 text-center">
      <Avatar src={conversation.receiver_avatar_url} alt={conversation.receiver_name} sizeClass="h-24 w-24" />
      <h2 className="mt-4 text-xl font-bold leading-tight">{conversation.receiver_name}</h2>
      {conversation.receiver_username && (
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{conversation.receiver_username}</p>
      )}
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        {formatActivityLabel(conversation)}
      </p>
      <button
        type="button"
        onClick={onEditProfile}
        className="mt-5 rounded-lg bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
      >
        Edit profile
      </button>
    </section>
  );
}
