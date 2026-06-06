import { prisma } from "../config/prismaClient.js";

const getAuthUserId = (req) => req.user?.userId ?? req.user?._id ?? null;

const toMidnightUTC = (d) => {
  const date = new Date(d);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

export const listMyDailyActivity = async (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const take = req.query.take ?? 60;
  const skip = req.query.skip ?? 0;

  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const from = req.query.from ? toMidnightUTC(req.query.from) : toMidnightUTC(defaultFrom);
  const to = req.query.to ? toMidnightUTC(req.query.to) : toMidnightUTC(now);

  const activities = await prisma.dailyActivity.findMany({
    where: {
      userId,
      date: { gte: from, lte: to },
    },
    take,
    skip,
    orderBy: [{ date: "asc" }],
    select: {
      id: true,
      date: true,
      count: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(200).json({ dailyActivity: activities });
};

export const incrementMyDailyActivity = async (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const date = toMidnightUTC(req.body.date ?? new Date());
  const incrementBy = req.body.incrementBy ?? 1;

  const record = await prisma.dailyActivity.upsert({
    where: {
      userId_date: { userId, date },
    },
    create: { userId, date, count: incrementBy },
    update: { count: { increment: incrementBy } },
    select: { id: true, date: true, count: true, updatedAt: true },
  });

  return res.status(200).json({ dailyActivity: record });
};

import { fetchLeetCodeCalendar } from "../ingestion/leetcode.js";
import { fetchCodeforcesCalendar } from "../ingestion/codeforces.js";

export const getUnifiedAnalytics = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Get platform connections
    const connections = await prisma.platformConnection.findMany({
      where: { userId, synced: true }
    });

    const leetcodeConn = connections.find(c => c.platform === "LEETCODE");
    const codeforcesConn = connections.find(c => c.platform === "CODEFORCES");

    const mergedActivity = {}; // timestamp (seconds) -> count

    // 1. Local Activity
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const localActivity = await prisma.dailyActivity.findMany({
      where: { userId, date: { gte: toMidnightUTC(oneYearAgo) } }
    });
    
    localActivity.forEach(act => {
      const ts = Math.floor(act.date.getTime() / 1000);
      mergedActivity[ts] = (mergedActivity[ts] || 0) + act.count;
    });

    // 2. Leetcode Activity
    if (leetcodeConn) {
      try {
        const lcData = await fetchLeetCodeCalendar({ username: leetcodeConn.username });
        if (lcData?.submissionCalendar) {
          for (const [ts, count] of Object.entries(lcData.submissionCalendar)) {
            mergedActivity[ts] = (mergedActivity[ts] || 0) + count;
          }
        }
      } catch (e) { console.error("Error fetching LeetCode calendar:", e); }
    }

    // 3. Codeforces Activity
    if (codeforcesConn) {
      try {
        const cfData = await fetchCodeforcesCalendar({ username: codeforcesConn.username });
        if (cfData?.submissionCalendar) {
          for (const [ts, count] of Object.entries(cfData.submissionCalendar)) {
            mergedActivity[ts] = (mergedActivity[ts] || 0) + count;
          }
        }
      } catch (e) { console.error("Error fetching Codeforces calendar:", e); }
    }

    // Convert to array and filter last 365 days
    const minTs = Math.floor(oneYearAgo.getTime() / 1000);
    const heatmap = [];
    let totalSolved = 0;
    let activeDays = 0;
    
    // Convert map to sorted array
    const sortedTimestamps = Object.keys(mergedActivity).map(Number).sort((a, b) => a - b);
    
    // Stats calculation
    let currentStreak = 0;
    let bestStreak = 0;
    let lastDayTs = 0;

    for (const ts of sortedTimestamps) {
      const count = mergedActivity[ts];
      totalSolved += count;
      activeDays += 1;

      // Calculate streak
      if (lastDayTs === 0 || ts - lastDayTs === 86400) {
        currentStreak += 1;
      } else if (ts - lastDayTs > 86400) {
        currentStreak = 1;
      }
      if (currentStreak > bestStreak) bestStreak = currentStreak;
      lastDayTs = ts;

      // Only add to heatmap if within last year
      if (ts >= minTs) {
        heatmap.push({
          date: new Date(ts * 1000).toISOString().split('T')[0],
          count: count
        });
      }
    }

    const avgDaily = activeDays > 0 ? (totalSolved / activeDays).toFixed(1) : 0;

    const stats = [
      { label: 'Avg. Daily Problems', value: avgDaily.toString(), color: '#10B981' },
      { label: 'Active Days', value: activeDays.toString(), color: '#3B82F6' },
      { label: 'Total Solved', value: totalSolved.toString(), color: '#F59E0B' },
      { label: 'Best Streak', value: `${bestStreak} days`, color: '#8B5CF6' },
    ];

    return res.status(200).json({ heatmap, stats });

  } catch (error) {
    console.error("Error in getUnifiedAnalytics:", error);
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

