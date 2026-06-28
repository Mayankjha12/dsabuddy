import { prisma } from "../config/prismaClient.js";
import { recalculateUserPoints } from "../utils/points.js";

const getAuthUserId = (req) => req.user?.userId ?? req.user?._id ?? null;

export const listMyQuestionStatuses = async (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { status } = req.query;
  const take = Number(req.query.take ?? 200);
  const skip = Number(req.query.skip ?? 0);

  const items = await prisma.userQuestion.findMany({
    where: { userId, ...(status ? { status } : {}) },
    take,
    skip,
    orderBy: [{ updatedAt: "desc" }],
    select: {
      userId: true,
      questionId: true,
      status: true,
      solvedAt: true,
      updatedAt: true,
      question: {
        select: {
          id: true,
          title: true,
          displayName: true,
          difficulty: true,
          leetcodeUrl: true,
        },
      },
    },
  });

  return res.status(200).json({ userQuestions: items });
};

export const upsertMyQuestionStatus = async (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { questionId } = req.params;
  const { status } = req.body;

  const solvedAt = status === "SOLVED" ? new Date() : null;

  const record = await prisma.userQuestion.upsert({
    where: {
      userId_questionId: { userId, questionId },
    },
    create: { userId, questionId, status, solvedAt },
    update: { status, solvedAt },
    select: {
      userId: true,
      questionId: true,
      status: true,
      solvedAt: true,
      updatedAt: true,
    },
  });

  await recalculateUserPoints(userId);
  return res.status(200).json({ userQuestion: record });
};

export const deleteMyQuestionStatus = async (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { questionId } = req.params;
  await prisma.userQuestion.delete({
    where: { userId_questionId: { userId, questionId } },
  });

  await recalculateUserPoints(userId);
  return res.status(204).send();
};

