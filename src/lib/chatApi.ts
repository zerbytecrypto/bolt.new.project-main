import { supabase } from '@/lib/supabase';
import type { Conversation, Message, ReceiverUpdate, SenderRole } from '@/types/chat';

const BUCKET = 'chat-images';
const CONVERSATION_COLUMNS =
  'id, receiver_name, receiver_username, receiver_avatar_url, activity_status, last_active_at';
const MESSAGE_COLUMNS = 'id, conversation_id, sender_role, body, image_url, created_at';

export const ACCEPTED_IMAGE_TYPES: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Please choose a JPEG, PNG, GIF, or WebP image.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Images must be 10 MB or smaller.';
  }
  return null;
}

export async function fetchConversation(): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATION_COLUMNS)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Conversation | null) ?? null;
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(MESSAGE_COLUMNS)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Message[];
}

interface NewMessage {
  conversationId: string;
  senderRole: SenderRole;
  body: string | null;
  imageUrl: string | null;
}

export async function insertMessage(input: NewMessage): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: input.conversationId,
      sender_role: input.senderRole,
      body: input.body,
      image_url: input.imageUrl,
    })
    .select(MESSAGE_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return data as Message;
}

export async function updateConversation(
  conversationId: string,
  update: ReceiverUpdate
): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .update(update)
    .eq('id', conversationId)
    .select(CONVERSATION_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return data as Conversation;
}

export async function uploadChatImage(file: File): Promise<string> {
  const extension = IMAGE_EXTENSIONS[file.type];
  if (!extension) throw new Error('Unsupported image type.');
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: '3600' });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
