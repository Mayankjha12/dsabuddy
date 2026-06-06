import { ConsistencyHeatmap } from './components';
import { yearlyActivityData, analyticsStats } from './userData';
import { TrendingUp, Calendar, Target, Award } from 'lucide-react';

const iconMap = {
  'Avg. Daily Problems': TrendingUp,
  'Active Days': Calendar,
  'Total Solved': Target,
  'Best Streak': Award,
};

export function Analytics({ analytics }) {
  const displayStats = analytics?.stats || analyticsStats;
  const displayHeatmap = analytics?.heatmap || yearlyActivityData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#E5E7EB] text-4xl font-bold mb-2 font-Spline-Sans">Analytics</h1>
        <p className="text-[#9CA3AF] font-JetBrains-Mono">Deep dive into your coding patterns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {displayStats.map((stat) => {
          const Icon = iconMap[stat.label];
          return (
            <div key={stat.label} className="bg-[#161B22] rounded-xl p-6 border border-[#1F2937]">
              <Icon className="w-6 h-6 mb-3" style={{ color: stat.color }} />
              <p className="text-[#6B7280] text-xs mb-1 font-JetBrains-Mono">{stat.label}</p>
              <p className="text-[#E5E7EB] text-2xl font-bold font-Spline-Sans">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div>
        <ConsistencyHeatmap data={displayHeatmap} />
      </div>

      <div className="bg-[#161B22] rounded-xl p-12 border border-[#1F2937] text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-[#FBBF24]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-[#FBBF24]" />
          </div>
          <h3 className="text-[#E5E7EB] text-xl font-bold mb-2 font-Spline-Sans">More Analytics Coming Soon</h3>
          <p className="text-[#6B7280] font-JetBrains-Mono">
            Advanced insights, topic-wise breakdown, and performance predictions are on the way!
          </p>
        </div>
      </div>
    </div>
  );
}
