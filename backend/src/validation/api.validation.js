import { z } from "zod";

export const cuidSchema = z.string().min(1);

export const idParamSchema = z.object({
  id: cuidSchema,
});

export const paginationQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(100).optional(),
  skip: z.coerce.number().int().min(0).optional(),
});

export const userNameParamSchema = z.object({
  userName: z.string().min(1),
});

export const updateMeBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    avatarUrl: z.string().url().optional().nullable(),
    college: z.string().min(1).optional().nullable(),
    branch: z.string().min(1).optional().nullable(),
    year: z.string().min(1).optional().nullable(),
  })
  .strict();

export const companyIdParamSchema = z.object({
  companyId: cuidSchema,
});

export const companySlugParamSchema = z.object({
  slug: z.string().min(1),
});

export const createCompanyBodySchema = z
  .object({
    name: z.string().min(1),
    slug: z.string().min(1),
    logoUrl: z.string().url().optional().nullable(),
  })
  .strict();

export const updateCompanyBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    logoUrl: z.string().url().optional().nullable(),
    questionCount: z.number().int().min(0).optional(),
  })
  .strict();

export const interviewSetIdParamSchema = z.object({
  id: cuidSchema,
});

export const createInterviewSetBodySchema = z
  .object({
    name: z.string().min(1),
    tag: z.string().optional().nullable(),
    lastUpdated: z.string().optional().nullable(),
    easyCount: z.number().int().min(0).optional(),
    easyTotal: z.number().int().min(0).optional(),
    mediumCount: z.number().int().min(0).optional(),
    mediumTotal: z.number().int().min(0).optional(),
    hardCount: z.number().int().min(0).optional(),
    hardTotal: z.number().int().min(0).optional(),
  })
  .strict();

export const updateInterviewSetBodySchema = createInterviewSetBodySchema
  .partial()
  .strict();

export const questionIdParamSchema = z.object({
  id: cuidSchema,
});

export const companyQuestionParamsSchema = z.object({
  companyId: cuidSchema,
  questionId: cuidSchema,
});

export const upsertCompanyQuestionBodySchema = z
  .object({
    frequency: z.enum(["VERY_HIGH", "HIGH", "OCCASIONAL"]).optional().nullable(),
    solved: z.boolean().optional().nullable(),
    order: z.number().int().min(0).optional().nullable(),
  })
  .strict();

export const createQuestionBodySchema = z
  .object({
    title: z.string().min(1),
    displayName: z.string().optional().nullable(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    leetcodeUrl: z.string().url().optional().nullable(),
    acceptanceRate: z.number().optional().nullable(),
    frequency: z.enum(["VERY_HIGH", "HIGH", "OCCASIONAL"]).optional().nullable(),
    statement: z.string().optional().nullable(),
    examples: z.any().optional().nullable(),
    constraints: z.any().optional().nullable(),
    acceptedCount: z.number().int().min(0).optional().nullable(),
    submissionCount: z.number().int().min(0).optional().nullable(),
    tagIds: z.array(cuidSchema).optional(),
    companyIds: z.array(cuidSchema).optional(),
    relatedQuestionIds: z.array(cuidSchema).optional(),
  })
  .strict();

export const updateQuestionBodySchema = createQuestionBodySchema.partial().strict();

export const listQuestionsQuerySchema = z
  .object({
    q: z.string().optional(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
    tagId: cuidSchema.optional(),
    companyId: cuidSchema.optional(),
    take: z.coerce.number().int().min(1).max(100).optional(),
    skip: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const tagIdParamSchema = z.object({
  id: cuidSchema,
});

export const createTagBodySchema = z
  .object({
    name: z.string().min(1),
  })
  .strict();

export const userQuestionIdParamSchema = z.object({
  questionId: cuidSchema,
});

export const upsertUserQuestionBodySchema = z
  .object({
    status: z.enum(["UNSOLVED", "IN_PROGRESS", "SOLVED"]),
  })
  .strict();

export const listUserQuestionsQuerySchema = z
  .object({
    status: z.enum(["UNSOLVED", "IN_PROGRESS", "SOLVED"]).optional(),
    take: z.coerce.number().int().min(1).max(200).optional(),
    skip: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const platformParamSchema = z.object({
  platform: z.enum(["LEETCODE", "CODECHEF", "CODEFORCES", "GFG"]),
});

export const upsertPlatformConnectionBodySchema = z
  .object({
    username: z.string().min(1),
    rating: z.number().int().optional().nullable(),
    stars: z.number().int().optional().nullable(),
    problemsSolved: z.number().int().optional().nullable(),
    rankLabel: z.string().optional().nullable(),
    synced: z.boolean().optional(),
    lastSyncedAt: z.coerce.date().optional().nullable(),
  })
  .strict();

export const listDailyActivityQuerySchema = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    take: z.coerce.number().int().min(1).max(366).optional(),
    skip: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const incrementDailyActivityBodySchema = z
  .object({
    date: z.coerce.date().optional(),
    incrementBy: z.number().int().min(1).max(1000).optional(),
  })
  .strict();

export const syncProblemsBodySchema = z
  .object({
    platforms: z.array(z.enum(["codeforces", "leetcode"])).optional(),
    tags: z.array(z.string().min(1)).optional(),
    dryRun: z.boolean().optional(),
    maxItems: z.coerce.number().int().min(1).max(5000).optional(),
  })
  .strict();

