import { Camera, Loader2, X } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Avatar } from '@/components/chat/Avatar';
import { useObjectUrl } from '@/hooks/useObjectUrl';
import { ACCEPTED_IMAGE_TYPES, uploadChatImage, validateImageFile } from '@/lib/chatApi';
import { minutesSince } from '@/lib/time';
import type { ActivityStatus, Conversation, ReceiverUpdate } from '@/types/chat';

const MINUTE_MS = 60 * 1000;

const STATUS_OPTIONS: { value: ActivityStatus; label: string }[] = [
  { value: 'active', label: 'Active now' },
  { value: 'away', label: 'Active recently' },
  { value: 'offline', label: 'Offline' },
];

const INPUT_CLASS =
  'w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-shadow focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100';

interface EditReceiverModalProps {
  conversation: Conversation;
  onClose: () => void;
  onSave: (update: ReceiverUpdate) => Promise<void>;
}

export function EditReceiverModal({ conversation, onClose, onSave }: EditReceiverModalProps) {
  const [name, setName] = useState(conversation.receiver_name);
  const [username, setUsername] = useState(conversation.receiver_username);
  const [status, setStatus] = useState<ActivityStatus>(conversation.activity_status);
  const [minutesAgo, setMinutesAgo] = useState(() =>
    Math.max(1, minutesSince(conversation.last_active_at))
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarPreview = useObjectUrl(avatarFile);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!selected) return;
    const problem = validateImageFile(selected);
    setError(problem);
    setAvatarFile(problem ? null : selected);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter a name.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const now = Date.now();
      const update: ReceiverUpdate = {
        receiver_name: trimmedName,
        receiver_username: username.trim(),
        activity_status: status,
        last_active_at: new Date(
          status === 'away' ? now - Math.max(1, minutesAgo) * MINUTE_MS : now
        ).toISOString(),
      };
      if (avatarFile) {
        update.receiver_avatar_url = await uploadChatImage(avatarFile);
      }
      await onSave(update);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Changes could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-receiver-title"
        className="w-full max-w-md animate-modal-in rounded-t-3xl bg-white p-6 text-neutral-900 shadow-2xl dark:bg-neutral-900 dark:text-neutral-100 sm:rounded-3xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="edit-receiver-title" className="text-lg font-bold">
            Edit profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile picture"
              className="group relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <Avatar
                src={avatarPreview ?? conversation.receiver_avatar_url}
                alt={name || conversation.receiver_name}
                sizeClass="h-20 w-20"
              />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-6 w-6" aria-hidden="true" />
              </span>
            </button>
            <div className="flex flex-col items-start gap-1">
              <p className="text-sm font-semibold">Profile picture</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Choose new photo
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              required
              className={INPUT_CLASS}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Username</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              maxLength={60}
              className={INPUT_CLASS}
            />
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-semibold">Activity status</legend>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((option) => {
                const isActive = option.value === status;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setStatus(option.value)}
                    className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                      isActive
                        ? 'border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/40 dark:text-primary-200'
                        : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {status === 'away' && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Last active (minutes ago)</span>
              <input
                type="number"
                min={1}
                max={10080}
                value={minutesAgo}
                onChange={(event) => setMinutesAgo(Math.max(1, Number(event.target.value) || 1))}
                className={INPUT_CLASS}
              />
            </label>
          )}

          {error && (
            <p role="alert" className="text-sm font-medium text-error-600 dark:text-error-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
