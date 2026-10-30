import { User } from 'lucide-react';

interface AvatarProps {
  src: string | null;
  alt: string;
  sizeClass: string;
}

export function Avatar({ src, alt, sizeClass }: AvatarProps) {
  return (
    <div className={`${sizeClass} shrink-0 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800`}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-neutral-500 dark:text-neutral-400">
          <User className="h-1/2 w-1/2" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
