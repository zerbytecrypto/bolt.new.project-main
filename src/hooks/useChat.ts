import { useCallback, useEffect, useState } from 'react';
import {
  fetchConversation,
  fetchMessages,
  insertMessage,
  updateConversation,
  uploadChatImage,
} from '@/lib/chatApi';
import type { Conversation, Message, ReceiverUpdate, SenderRole } from '@/types/chat';

export type LoadState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; message: string };

interface SendInput {
  senderRole: SenderRole;
  body: string | null;
  file: File | null;
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong.';
}

export function useChat() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });

  const load = useCallback(async () => {
    setLoadState({ status: 'loading' });
    try {
      const found = await fetchConversation();
      if (!found) {
        setConversation(null);
        setMessages([]);
        setLoadState({ status: 'ready' });
        return;
      }
      const history = await fetchMessages(found.id);
      setConversation(found);
      setMessages(history);
      setLoadState({ status: 'ready' });
    } catch (err) {
      setLoadState({ status: 'error', message: toErrorMessage(err) });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sendMessage = useCallback(
    async ({ senderRole, body, file }: SendInput) => {
      if (!conversation) throw new Error('No conversation is loaded.');
      const imageUrl = file ? await uploadChatImage(file) : null;
      const message = await insertMessage({
        conversationId: conversation.id,
        senderRole,
        body,
        imageUrl,
      });
      setMessages((previous) => [...previous, message]);
    },
    [conversation]
  );

  const updateReceiver = useCallback(
    async (update: ReceiverUpdate) => {
      if (!conversation) throw new Error('No conversation is loaded.');
      const updated = await updateConversation(conversation.id, update);
      setConversation(updated);
    },
    [conversation]
  );

  return { conversation, messages, loadState, reload: load, sendMessage, updateReceiver };
}
