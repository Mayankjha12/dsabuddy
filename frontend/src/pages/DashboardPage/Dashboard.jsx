import { useMemo, useState, useEffect } from 'react';
import { UserSnapshotCard, PlatformCard, ConsistencyHeatmap } from './components';
import { platformService } from '@/api/services';
import { Zap, Smile } from 'lucide-react';

import leetcodeLogo from "@/assets/Leetcode Icon 24 copy.png";
import codeforcesLogo from "@/assets/Codeforces Icon 24.png";
import codechefLogo from "@/assets/Codechef Icon 48.png";
import gfgLogo from "@/assets/Geeksforgeeks Icon 48.png";

const PLATFORMS_CONFIG = [
  { id: "leetcode", name: "LeetCode", logo: leetcodeLogo },
  { id: "codechef", name: "CodeChef", logo: codechefLogo },
  { id: "codeforces", name: "Codeforces", logo: codeforcesLogo },
  { id: "gfg", name: "GFG", logo: gfgLogo },
];

const LEADERBOARD_FILTERS = [
  { id: "college", label: "College" },
  { id: "branch", label: "Branch" },
  { id: "year", label: "Year" },
];

export function Dashboard({ user, platforms, analytics, leaderboard, onUpdate }) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncAll = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const activeConnections = (platforms || []).filter(c => c.username && c.username.trim());
      if (activeConnections.length === 0) {
        alert("No connected platforms to sync. Connect them in Settings.");
        setIsSyncing(false);
        return;
      }
      
      await Promise.allSettled(
        activeConnections.map(c => platformService.syncConnection(c.platform))
      );
      
      if (onUpdate) {
        await onUpdate();
      }
    } catch (err) {
      console.error("Failed to sync platforms:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const displayUser = {
    ...(user || {}),
    name: user?.name || 'Guest',
    email: user?.email || '',
    avatar: user?.avatarUrl || user?.avatar || null,
    rank: user?.overallRank || user?.rank || '-',
    points: user?.points !== undefined && user?.points !== null ? user.points : 0,
  };

  const displayPlatforms = PLATFORMS_CONFIG.map(defaultPlatform => {
    const conn = (platforms || []).find(
      c => c.platform?.toLowerCase() === defaultPlatform.id?.toLowerCase()
    );
    if (conn) {
      return {
        ...defaultPlatform,
        username: conn.username,
        rating: conn.rating ?? 0,
        problemsSolved: conn.problemsSolved ?? 0,
        stars: conn.stars ?? 0,
        rank: conn.rankLabel || conn.rank || '',
        synced: conn.synced,
      };
    }
    return {
      ...defaultPlatform,
      username: 'Not Connected',
      rating: 0,
      problemsSolved: 0,
      stars: 0,
      rank: '',
      synced: false,
    };
  });

  const emptyHeatmap = useMemo(() => {
    const data = [];
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    
    const oldestDateUTC = new Date(todayUTC);
    oldestDateUTC.setUTCDate(oldestDateUTC.getUTCDate() - 364);
    const startDayOfWeek = oldestDateUTC.getUTCDay();
    
    const startDate = new Date(oldestDateUTC);
    startDate.setUTCDate(startDate.getUTCDate() - startDayOfWeek);
    
    const endDate = new Date(todayUTC);
    endDate.setUTCDate(endDate.getUTCDate() + (6 - todayUTC.getUTCDay()));
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const year = currentDate.getUTCFullYear();
      const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getUTCDate()).padStart(2, '0');
      data.push({
        date: `${year}-${month}-${day}`,
        count: 0,
      });
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    return data;
  }, []);

  const displayHeatmap = (analytics?.heatmap && analytics.heatmap.length > 0) ? analytics.heatmap : emptyHeatmap;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-[#E5E7EB] text-4xl font-normal italic mb-2 font-Instrument-Serif flex items-center gap-2">
          Welcome back, {displayUser.name?.split(' ')[0] || 'Guest'} <Smile className="w-7 h-7 text-[#35b9f1] shrink-0" />
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UserSnapshotCard user={displayUser} />
        <div className="lg:col-span-2">
          <ConsistencyHeatmap data={displayHeatmap} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[#E5E7EB] text-3xl font-normal italic font-Instrument-Serif flex items-center gap-2">
              <Zap className="w-5.5 h-5.5 text-[#35b9f1] shrink-0" /> Platform Tracker
            </h2>
          </div>
          <button 
            onClick={handleSyncAll}
            disabled={isSyncing}
            className={`text-[#9CA3AF] hover:text-[#35b9f1] text-sm font-JetBrains-Mono transition-colors flex items-center gap-1 ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isSyncing ? 'Syncing...' : 'Sync All Platforms'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayPlatforms.map((platform) => (
            <PlatformCard key={platform.id} platform={platform} />
          ))}
        </div>
      </div>


    </div>
  );
}
