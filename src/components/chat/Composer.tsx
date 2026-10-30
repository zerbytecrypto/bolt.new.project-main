import { ImagePlus, Loader2, Send, X } from 'lucide-react';
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useObjectUrl } from '@/hooks/useObjectUrl';
import { ACCEPTED_IMAGE_TYPES, validateImageFile } from '@/lib/chatApi';
import type { SenderRole } from '@/types/chat';

interface ComposerProps {
  receiverName: string;
  onSend: (input: { senderRole: SenderRole; body: string | null; file: File | null }) => Promise<void>;
}

export function Composer({ receiverName, onSend }: ComposerProps) {
  const [senderRole, setSenderRole] = useState<SenderRole>('sender');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useObjectUrl(file);

  const senderOptions: { value: SenderRole; label: string }[] = [
    { value: 'sender', label: 'You' },
    { value: 'receiver', label: receiverName },
  ];
  const activeLabel = senderOptions.find((option) => option.value === senderRole)?.label ?? 'You';
  const canSend = (text.trim().length > 0 || file !== null) && !sending;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!selected) return;
    const problem = validateImageFile(selected);
    setError(problem);
    setFile(problem ? null : selected);
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSend) return;
    setSending(true);
    setError(null);
    try {
      await onSend({ senderRole, body: text.trim() || null, file });
      setText('');
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Message could not be sent.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-black">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Send as</span>
          <div role="radiogroup" aria-label="Send as" className="flex rounded-full bg-neutral-100 p-1 dark:bg-neutral-900">
            {senderOptions.map((option) => {
              const isActive = option.value === senderRole;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setSenderRole(option.value)}
                  className={`max-w-[10rem] truncate rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    isActive
                      ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-100'
                      : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {previewUrl && (
          <div className="relative w-28 animate-message-in">
            <img src={previewUrl} alt="Selected upload preview" className="h-28 w-28 rounded-2xl object-cover" />
            <button
              type="button"
              onClick={clearFile}
              aria-label="Remove selected image"
              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900/80 text-white transition-colors hover:bg-neutral-900"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach image"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary-600 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-primary-400 dark:hover:bg-neutral-900"
          >
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={`Message as ${activeLabel}...`}
            aria-label={`Message as ${activeLabel}`}
            maxLength={2000}
            className="min-w-0 flex-1 rounded-full bg-neutral-100 px-4 py-2.5 text-[15px] text-neutral-900 placeholder:text-neutral-500 outline-none transition-shadow focus:ring-2 focus:ring-primary-500 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white transition-all hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-400"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {error && (
          <p role="alert" className="text-xs font-medium text-error-600 dark:text-error-400">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
