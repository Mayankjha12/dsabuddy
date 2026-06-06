import { leetcodeGraphqlRequest, buildLeetCodeCookiesFromEnv, USER_PROFILE_QUERY } from "../ingestion/leetcode.js";

const QUESTION_DATA_QUERY = `
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    questionFrontendId
    title
    titleSlug
    content
    isPaidOnly
    difficulty
    likes
    dislikes
    topicTags { name slug }
    stats
    hints
    similarQuestions
  }
}`;

export const getLeetcodeUser = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username || typeof username !== 'string' || !/^[A-Za-z0-9_-]{1,39}$/.test(username)) {
      return res.status(400).json({ error: "Invalid username parameter" });
    }

    const cookies = buildLeetCodeCookiesFromEnv();

    const data = await leetcodeGraphqlRequest({
      query: USER_PROFILE_QUERY,
      variables: { username },
      cookies,
    });

    if (!data?.matchedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(data.matchedUser);
  } catch (error) {
    console.error("Error in getLeetcodeUser:", error.message);
    return res.status(500).json({ error: "Failed to fetch user data." });
  }
};

export const getLeetcodeQuestion = async (req, res) => {
  try {
    const { titleSlug } = req.params;

    if (!titleSlug || typeof titleSlug !== 'string' || !/^[a-z0-9-]+$/i.test(titleSlug)) {
      return res.status(400).json({ error: "Invalid titleSlug parameter" });
    }

    const cookies = buildLeetCodeCookiesFromEnv();

    const data = await leetcodeGraphqlRequest({
      query: QUESTION_DATA_QUERY,
      variables: { titleSlug },
      cookies,
    });

    if (!data?.question) {
      return res.status(404).json({ error: "Question not found" });
    }

    let stats = data.question.stats;
    try {
      if (stats) stats = JSON.parse(stats);
    } catch (e) { }

    let similarQuestions = data.question.similarQuestions;
    try {
      if (similarQuestions) similarQuestions = JSON.parse(similarQuestions);
    } catch (e) { }

    return res.status(200).json({
      ...data.question,
      stats,
      similarQuestions
    });
  } catch (error) {
    console.error("Error in getLeetcodeQuestion:", error.message);
    return res.status(500).json({ error: "Failed to fetch question data." });
  }
};

