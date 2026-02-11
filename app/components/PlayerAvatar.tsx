import { ChessKnight } from 'lucide-react';

export default function PlayerAvatar({
  photoUrl,
  name,
  className = '',
}: {
  photoUrl?: string | null;
  name: string;
  className?: string;
}) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`h-24 w-24 rounded-full object-cover border border-slate-200 bg-white shadow-sm ${className}`}
      />
    );
  }

  return (
    <div className={`h-24 w-24 rounded-full flex items-center justify-center border border-slate-200 bg-slate-100 shadow-sm ${className}`}>
      <ChessKnight className="w-10 h-10 text-slate-500" />
    </div>
  );
}
