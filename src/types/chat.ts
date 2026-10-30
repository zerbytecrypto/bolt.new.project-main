export type ActivityStatus = 'active' | 'away' | 'offline';
export type SenderRole = 'sender' | 'receiver';

export interface Conversation {
  id: string;
  receiver_name: string;
  receiver_username: string;
  receiver_avatar_url: string | null;
  activity_status: ActivityStatus;
  last_active_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_role: SenderRole;
  body: string | null;
  image_url: string | null;
  created_at: string;
}

export type ReceiverUpdate = Partial<
  Pick<
    Conversation,
    'receiver_name' | 'receiver_username' | 'receiver_avatar_url' | 'activity_status' | 'last_active_at'
  >
>;
