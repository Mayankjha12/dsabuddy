import { UserSnapshotCard, PlatformCard, ConsistencyHeatmap, LeaderboardRow } from './components';
import { userData, platformsData, yearlyActivityData, leaderboardData, leaderboardFilters } from './userData';

export function Dashboard({ user, platforms, analytics }) {
  const displayUser = user || userData;
  const displayPlatforms = platforms?.length > 0 ? platforms : platformsData;
  const displayHeatmap = analytics?.heatmap || yearlyActivityData;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-[#E5E7EB] text-4xl font-bold mb-2 font-Spline-Sans">
          Welcome back, {displayUser.name?.split(' ')[0] || 'Guest'} 👋
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
            <h2 className="text-[#E5E7EB] text-2xl font-bold font-Spline-Sans flex items-center gap-2">
              ⚡ Platform Tracker
            </h2>
          </div>
          <button className="text-[#9CA3AF] hover:text-[#FBBF24] text-sm font-JetBrains-Mono transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync All Platforms
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayPlatforms.map((platform) => (
            <PlatformCard key={platform.id} platform={platform} />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[#E5E7EB] text-2xl font-bold font-Spline-Sans flex items-center gap-2">
              🏆 Leaderboard Position
            </h2>
          </div>
        </div>

        <div className="bg-[#161B22] rounded-xl p-6 border border-[#1F2937]">
          <div className="flex gap-2 mb-6">
            {leaderboardFilters.map((filter) => (
              <button
                key={filter.id}
                className={`px-4 py-2 rounded-lg text-sm font-JetBrains-Mono transition-colors ${
                  filter.id === 'college'
                    ? 'bg-[#FBBF24] text-[#0D1117]'
                    : 'bg-[#0D1117] text-[#9CA3AF] hover:text-[#E5E7EB]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#0D1117] rounded-lg p-4 text-center">
              <p className="text-[#6B7280] text-xs mb-1 font-JetBrains-Mono">COLLEGE</p>
              <p className="text-[#FBBF24] text-2xl font-bold font-Spline-Sans">#42</p>
            </div>
            <div className="bg-[#0D1117] rounded-lg p-4 text-center">
              <p className="text-[#6B7280] text-xs mb-1 font-JetBrains-Mono">BRANCH</p>
              <p className="text-[#FBBF24] text-2xl font-bold font-Spline-Sans">#12</p>
            </div>
            <div className="bg-[#0D1117] rounded-lg p-4 text-center">
              <p className="text-[#6B7280] text-xs mb-1 font-JetBrains-Mono">YEAR</p>
              <p className="text-[#FBBF24] text-2xl font-bold font-Spline-Sans">#08</p>
            </div>
          </div>

          <div className="space-y-3">
            {leaderboardData.slice(3, 8).map((user) => (
              <LeaderboardRow
                key={user.id}
                user={user}
                rank={user.rank}
                isCurrentUser={user.name === userData.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
