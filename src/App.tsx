import { Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { Composer } from '@/components/chat/Composer';
import { EditReceiverModal } from '@/components/chat/EditReceiverModal';
import { MessageList } from '@/components/chat/MessageList';
import { useChat } from '@/hooks/useChat';
import { useTheme } from '@/hooks/useTheme';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { conversation, messages, loadState, reload, sendMessage, updateReceiver } = useChat();
  const [isEditing, setIsEditing] = useState(false);
  const openEditor = useCallback(() => setIsEditing(true), []);
  const closeEditor = useCallback(() => setIsEditing(false), []);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-100 dark:bg-neutral-950 md:p-6">
      <div className="flex h-dvh w-full max-w-xl flex-col overflow-hidden bg-white text-neutral-900 transition-colors duration-300 dark:bg-black dark:text-neutral-100 md:h-[860px] md:max-h-[calc(100dvh-48px)] md:rounded-3xl md:border md:border-neutral-200 md:shadow-xl dark:md:border-neutral-800">
        {loadState.status === 'loading' && (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-500" aria-label="Loading chat" />
          </div>
        )}

        {loadState.status === 'error' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm font-medium text-error-600 dark:text-error-400">
              The chat could not be loaded. {loadState.message}
            </p>
            <button
              type="button"
              onClick={reload}
              className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-semibold transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            >
              Try again
            </button>
          </div>
        )}

        {loadState.status === 'ready' && !conversation && (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
            No conversation is available yet.
          </div>
        )}

        {loadState.status === 'ready' && conversation && (
          <>
            <ChatHeader
              conversation={conversation}
              theme={theme}
              onToggleTheme={toggleTheme}
              onEditProfile={openEditor}
            />
            <MessageList conversation={conversation} messages={messages} onEditProfile={openEditor} />
            <Composer receiverName={conversation.receiver_name} onSend={sendMessage} />
          </>
        )}

        {isEditing && conversation && (
          <EditReceiverModal conversation={conversation} onClose={closeEditor} onSave={updateReceiver} />
        )}
      </div>
    </div>
  );
}
