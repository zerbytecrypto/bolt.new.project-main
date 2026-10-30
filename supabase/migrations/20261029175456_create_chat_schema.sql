/*
# Create Instagram-style chat schema

1. New Tables
- `conversations`: the chat thread and the receiver's details.
  - `id` (uuid, primary key)
  - `receiver_name` (text): display name shown in the header and intro.
  - `receiver_username` (text): handle shown under the name in the intro.
  - `receiver_avatar_url` (text, nullable): profile picture for the receiver.
  - `activity_status` (text): one of `active`, `away`, `offline`.
  - `last_active_at` (timestamptz): used to show "Active 5m ago" style labels.
  - `created_at` (timestamptz)
- `messages`: every message in a conversation.
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, foreign key to conversations, cascades on delete)
  - `sender_role` (text): `sender` (the app owner) or `receiver` (the other person).
  - `body` (text, nullable): message text.
  - `image_url` (text, nullable): public URL of an attached image.
  - `created_at` (timestamptz)

2. Storage
- New public bucket `chat-images` for message photos and receiver avatars.
- Accepts only JPEG, PNG, GIF, and WebP files up to 10 MB.

3. Security
- Row level security enabled on both tables.
- The app has no sign-in, so anon and authenticated roles get read/write access to these tables.
- Storage objects in `chat-images` can be uploaded and read by anon and authenticated roles only.

4. Important notes
- A starter conversation is seeded so the chat is not empty on first load.
- Constraints ensure only valid sender roles and activity statuses are stored.
*/

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receiver_name text NOT NULL,
  receiver_username text NOT NULL DEFAULT '',
  receiver_avatar_url text,
  activity_status text NOT NULL DEFAULT 'offline' CHECK (activity_status IN ('active', 'away', 'offline')),
  last_active_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_role text NOT NULL CHECK (sender_role IN ('sender', 'receiver')),
  body text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (body IS NOT NULL OR image_url IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS messages_conversation_created_idx ON messages (conversation_id, created_at);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_conversations" ON conversations;
CREATE POLICY "anon_select_conversations" ON conversations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_conversations" ON conversations;
CREATE POLICY "anon_insert_conversations" ON conversations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_conversations" ON conversations;
CREATE POLICY "anon_update_conversations" ON conversations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_conversations" ON conversations;
CREATE POLICY "anon_delete_conversations" ON conversations FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_messages" ON messages;
CREATE POLICY "anon_select_messages" ON messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_messages" ON messages;
CREATE POLICY "anon_update_messages" ON messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_messages" ON messages;
CREATE POLICY "anon_delete_messages" ON messages FOR DELETE
  TO anon, authenticated USING (true);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-images',
  'chat-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "anon_select_chat_images" ON storage.objects;
CREATE POLICY "anon_select_chat_images" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'chat-images');

DROP POLICY IF EXISTS "anon_insert_chat_images" ON storage.objects;
CREATE POLICY "anon_insert_chat_images" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (bucket_id = 'chat-images');

INSERT INTO conversations (receiver_name, receiver_username, receiver_avatar_url, activity_status, last_active_at)
SELECT 'Ramirez Biaan', 'trust.ramirezbiaan', 'https://images.pexels.com/photos/9060510/pexels-photo-9060510.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'active', now()
WHERE NOT EXISTS (SELECT 1 FROM conversations);
