import { useState } from 'react';
import { Trophy } from 'lucide-react';

export function getInitials(name) {
  if (!name) return '?';
  const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function LeaderboardRow({ user, rank, isCurrentUser, onClick }) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = user?.avatarUrl || user?.avatar;
  const showInitials = imgError || !avatarUrl;
  const numericRank = Number(rank);

  const renderRankBadge = () => {
    if (numericRank === 1) {
      return (
        <div className="w-12 h-10 rounded-lg flex items-center justify-center bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Trophy className="w-5 h-5" />
        </div>
      );
    }
    if (numericRank === 2) {
      return (
        <div className="w-12 h-10 rounded-lg flex items-center justify-center bg-slate-400/10 border border-slate-400/30 text-slate-300">
          <Trophy className="w-5 h-5" />
        </div>
      );
    }
    if (numericRank === 3) {
      return (
        <div className="w-12 h-10 rounded-lg flex items-center justify-center bg-amber-700/10 border border-amber-700/30 text-amber-600">
          <Trophy className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-12 h-10 rounded-lg flex items-center justify-center bg-[#161B22] border border-[#1F2937]/50 text-[#9CA3AF] font-bold text-sm font-Spline-Sans">
        #{rank}
      </div>
    );
  };

  return (
    <div 
      onClick={onClick}
      className={`
        flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer select-none border
        ${isCurrentUser 
          ? 'bg-[#35b9f1]/5 border-[#35b9f1] hover:bg-[#35b9f1]/10' 
          : 'bg-[#161B22]/30 border-[#1F2937]/50 hover:border-[#35b9f1]/30 hover:bg-[#1C232E]/40'
        }
      `}
    >
      <div className="flex items-center gap-4 flex-1">
        {renderRankBadge()}

        {showInitials ? (
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#161B22] border border-[#1F2937] text-[#9CA3AF] font-bold text-sm font-Spline-Sans select-none">
            {getInitials(user?.name)}
          </div>
        ) : (
          <img
            src={avatarUrl}
            alt={user?.name}
            onError={() => setImgError(true)}
            className="w-10 h-10 rounded-full object-cover border border-[#1F2937]"
          />
        )}
        <div>
          <p className="text-[#E5E7EB] font-semibold font-Spline-Sans">
            {user?.name}
            {isCurrentUser && <span className="ml-2 text-[#35b9f1] text-xs font-JetBrains-Mono">(You)</span>}
          </p>
          {user?.branch && (
            <p className="text-[#6B7280] text-xs font-JetBrains-Mono mt-0.5">{user.branch}</p>
          )}
        </div>
      </div>

      <div className="text-right">
        <p className="text-[#35b9f1] text-xl font-bold font-Spline-Sans">
          {(() => {
            if (user?.displayLabel && user.displayLabel !== 'points') {
              if (user.displayValue === undefined || user.displayValue === null) {
                return 'N/A';
              }
              return typeof user.displayValue === 'number' ? user.displayValue.toLocaleString() : String(user.displayValue);
            }
            const val = (user?.displayValue !== undefined && user?.displayValue !== null) ? user.displayValue : (user?.points || 0);
            return typeof val === 'number' ? val.toLocaleString() : String(val);
          })()}
        </p>
        <p className="text-[#6B7280] text-[10px] tracking-wider uppercase font-JetBrains-Mono mt-0.5">
          {user?.displayLabel || 'points'}
        </p>
      </div>
    </div>
  );
}
