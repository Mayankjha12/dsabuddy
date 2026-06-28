import { prisma } from "../config/prismaClient.js";
import {
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
} from "../utils/cache.js";

export const listCompanies = async (req, res) => {
  const take = Number(req.query.take ?? 100);
  const skip = Number(req.query.skip ?? 0);

  const cacheKey = `companies:${take}:${skip}`;

  const cachedCompanies = await getCache(cacheKey);

  if (cachedCompanies) {
    return res.status(200).json(cachedCompanies);
  }
  const companies = await prisma.company.findMany({
    take,
    skip,
    where: {
      OR: [
        {
          questionCount: {
            gt: 0,
          },
        },
        {
          roundsInfo: {
            not: null,
          },
        },
      ],
    },
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      questionCount: true,
      logoUrl: true,
      placements: {
        select: {
          eligibleBranches: true,
          minCgpa: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  const response = { companies };

  await setCache(cacheKey, response, 300);
  
  return res.status(200).json(response);
};

export const getCompanyBySlug = async (req, res) => {
  const { slug } = req.params;

  const cacheKey = `company:${slug}`;

  const cachedCompany = await getCache(cacheKey);

  if (cachedCompany) {
    return res.status(200).json(cachedCompany);
  }

  const company = await prisma.company.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      questionCount: true,
      logoUrl: true,
      interviewSets: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          tag: true,
          lastUpdated: true,
          easyCount: true,
          easyTotal: true,
          mediumCount: true,
          mediumTotal: true,
          hardCount: true,
          hardTotal: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      placements: {
        select: {
          role: true,
          ctcLpa: true,
          stipendMonth: true,
          type: true,
          category: true,
          eligibleBranches: true,
          minCgpa: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!company) {
    return res.status(404).json({ error: "Company not found" });
  }

  const response = { company };

  await setCache(cacheKey, response, 300);

  return res.status(200).json(response);
};

export const createCompany = async (req, res) => {
  const company = await prisma.company.create({
    data: req.body,
    select: {
      id: true,
      name: true,
      slug: true,
      questionCount: true,
      logoUrl: true,
      createdAt: true,
    },
  });

  await deleteCacheByPattern("companies:*");
  return res.status(201).json({ company });
};

export const updateCompany = async (req, res) => {
  const { id } = req.params;

  const company = await prisma.company.update({
    where: { id },
    data: req.body,
    select: {
      id: true,
      name: true,
      slug: true,
      questionCount: true,
      logoUrl: true,
      updatedAt: true,
    },
  });
  await deleteCacheByPattern("companies:*");
  await deleteCache(`company:${company.slug}`);
  return res.status(200).json({ company });
};

export const deleteCompany = async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.company.findUnique({
    where: { id },
    select: {
      slug: true,
    },
  });

  await prisma.company.delete({
    where: { id },
  });

  await deleteCacheByPattern("companies:*");

  if (existing?.slug) {
    await deleteCache(`company:${existing.slug}`);
  }

  return res.status(204).send();
};

export const listCompanyQuestions = async (req, res) => {
  const { slug } = req.params;
  const cacheKey = `companyQuestions:${slug}`;

const cachedQuestions = await getCache(cacheKey);

if (cachedQuestions) {
  return res.status(200).json(cachedQuestions);
}

  const company = await prisma.company.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!company) return res.status(404).json({ error: "Company not found" });

  const companyQuestions = await prisma.companyQuestion.findMany({
    where: { companyId: company.id },
    orderBy: [{ order: "asc" }],
    select: {
      companyId: true,
      questionId: true,
      frequency: true,
      solved: true,
      order: true,
      question: {
        select: {
          id: true,
          title: true,
          displayName: true,
          difficulty: true,
          leetcodeUrl: true,
          tags: {
            select: {
              tag: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const response = { companyQuestions };

await setCache(cacheKey, response, 300);

return res.status(200).json(response);
};

export const upsertCompanyQuestion = async (req, res) => {
  const { companyId, questionId } = req.params;
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { slug: true },
  });

  const record = await prisma.companyQuestion.upsert({
    where: {
      companyId_questionId: { companyId, questionId },
    },
    create: { companyId, questionId, ...req.body },
    update: { ...req.body },
    select: {
      companyId: true,
      questionId: true,
      frequency: true,
      solved: true,
      order: true,
    },
  });
  if (company?.slug) {
    await deleteCache(`companyQuestions:${company.slug}`);
  }
  return res.status(200).json({ companyQuestion: record });
};

export const deleteCompanyQuestion = async (req, res) => {
  const { companyId, questionId } = req.params;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { slug: true },
  });

  await prisma.companyQuestion.delete({
    where: {
      companyId_questionId: {
        companyId,
        questionId,
      },
    },
  });

  if (company?.slug) {
    await deleteCache(`companyQuestions:${company.slug}`);
  }

  return res.status(204).send();
};

