import { prisma } from "../config/prismaClient.js";

const getAuthUserId = (req) => req.user?.userId ?? req.user?._id ?? null;

export const listQuestions = async (req, res) => {
  const { q, difficulty, tagId, companyId } = req.query;
  const take = Number(req.query.take ?? 50);
  const skip = Number(req.query.skip ?? 0);

  const userId = getAuthUserId(req);

  const where = {
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { displayName: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(tagId ? { tags: { some: { tagId } } } : {}),
    ...(companyId ? { companies: { some: { companyId } } } : {}),
  };

  const questions = await prisma.question.findMany({
    where,
    take,
    skip,
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      displayName: true,
      difficulty: true,
      leetcodeUrl: true,
      sourcePlatform: true,
      sourceId: true,
      sourceSlug: true,
      sourceUrl: true,
      sourceRating: true,
      paidOnly: true,
      acceptanceRate: true,
      frequency: true,
      acceptedCount: true,
      submissionCount: true,
      tags: {
        select: { tag: { select: { id: true, name: true } } },
      },
      companies: {
        select: { company: { select: { id: true, name: true, slug: true } } },
      },
      ...(userId
        ? {
            userStatuses: {
              where: { userId },
              select: { status: true, solvedAt: true, updatedAt: true },
            },
          }
        : {}),
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(200).json({ questions });
};

export const getQuestionById = async (req, res) => {
  const { id } = req.params;
  const userId = getAuthUserId(req);

  const question = await prisma.question.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      displayName: true,
      difficulty: true,
      leetcodeUrl: true,
      sourcePlatform: true,
      sourceId: true,
      sourceSlug: true,
      sourceUrl: true,
      sourceRating: true,
      paidOnly: true,
      acceptanceRate: true,
      frequency: true,
      statement: true,
      examples: true,
      constraints: true,
      acceptedCount: true,
      submissionCount: true,
      tags: {
        select: { tag: { select: { id: true, name: true } } },
      },
      companies: {
        select: {
          company: {
            select: { id: true, name: true, slug: true, logoUrl: true },
          },
          frequency: true,
          order: true,
        },
      },
      relatedFrom: {
        select: {
          to: { select: { id: true, title: true, difficulty: true } },
        },
      },
      relatedTo: {
        select: {
          from: { select: { id: true, title: true, difficulty: true } },
        },
      },
      ...(userId
        ? {
            userStatuses: {
              where: { userId },
              select: { status: true, solvedAt: true, updatedAt: true },
            },
          }
        : {}),
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!question) return res.status(404).json({ error: "Question not found" });
  return res.status(200).json({ question });
};

export const createQuestion = async (req, res) => {
  const { tagIds, companyIds, relatedQuestionIds, ...data } = req.body;

  const created = await prisma.question.create({
    data: {
      ...data,
      ...(tagIds?.length
        ? {
            tags: {
              create: tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            },
          }
        : {}),
      ...(companyIds?.length
        ? {
            companies: {
              create: companyIds.map((companyId) => ({
                company: { connect: { id: companyId } },
              })),
            },
          }
        : {}),
      ...(relatedQuestionIds?.length
        ? {
            relatedFrom: {
              create: relatedQuestionIds.map((toId) => ({
                to: { connect: { id: toId } },
              })),
            },
          }
        : {}),
    },
    select: { id: true },
  });

  return res.status(201).json({ question: created });
};

export const updateQuestion = async (req, res) => {
  const { id } = req.params;
  const { tagIds, companyIds, relatedQuestionIds, ...data } = req.body;

  const updated = await prisma.question.update({
    where: { id },
    data: {
      ...data,
      ...(Array.isArray(tagIds)
        ? {
            tags: {
              deleteMany: {},
              create: tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            },
          }
        : {}),
      ...(Array.isArray(companyIds)
        ? {
            companies: {
              deleteMany: {},
              create: companyIds.map((companyId) => ({
                company: { connect: { id: companyId } },
              })),
            },
          }
        : {}),
      ...(Array.isArray(relatedQuestionIds)
        ? {
            relatedFrom: {
              deleteMany: {},
              create: relatedQuestionIds.map((toId) => ({
                to: { connect: { id: toId } },
              })),
            },
          }
        : {}),
    },
    select: { id: true, updatedAt: true },
  });

  return res.status(200).json({ question: updated });
};

export const deleteQuestion = async (req, res) => {
  const { id } = req.params;
  await prisma.question.delete({ where: { id } });
  return res.status(204).send();
};

