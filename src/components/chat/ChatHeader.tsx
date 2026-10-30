import { ChevronRight, Moon, Sun } from 'lucide-react';
import { Avatar } from '@/components/chat/Avatar';
import type { Theme } from '@/hooks/useTheme';
import { formatActivityLabel } from '@/lib/time';
import type { Conversation } from '@/types/chat';

interface ChatHeaderProps {
  conversation: Conversation;
  theme: Theme;
  onToggleTheme: () => void;
  onEditProfile: () => void;
}

export function ChatHeader({ conversation, theme, onToggleTheme, onEditProfile }: ChatHeaderProps) {
  const isActive = conversation.activity_status === 'active';
  const isDark = theme === 'dark';

  return (
    <header className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
      <button
        type="button"
        onClick={onEditProfile}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <Avatar src={conversation.receiver_avatar_url} alt={conversation.receiver_name} sizeClass="h-10 w-10" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1">
            <span className="block truncate text-[15px] font-semibold leading-tight">
              {conversation.receiver_name}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
          </span>
          <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            {isActive && <span className="h-2 w-2 shrink-0 rounded-full bg-success-500" aria-hidden="true" />}
            <span className="truncate">{formatActivityLabel(conversation)}</span>
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        {isDark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
      </button>
    </header>
  );
}
