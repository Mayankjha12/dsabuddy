export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  ONBOARDING: '/onboarding',
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001/api';

/**
 * Full branch names — used in onboarding & settings dropdowns.
 * Keep sorted alphabetically by display name.
 */
export const BRANCHES = [
  "Bio-Technology (BT)",
  "Civil Engineering (CE)",
  "Computer Science and Engineering (Artificial Intelligence) (CSAI)",
  "Computer Science and Engineering (Big Data Analytics) (CSDA)",
  "Computer Science and Engineering (CSE)",
  "Computer Science and Engineering (Data Science) (CSDS)",
  "Computer Science and Engineering (Internet of Things) (CIOT)",
  "Electrical Engineering (EE)",
  "Electronics and Communication Engineering (Artificial Intelligence and Machine Learning) (ECAM)",
  "Electronics and Communication Engineering (ECE)",
  "Electronics Engineering (VLSI Design and Technology) (EVDT)",
  "Geoinformatics (GI)",
  "Information Technology (IT)",
  "Information Technology (Network and Information Security) (ITNS)",
  "Instrumentation and Control Engineering (ICE)",
  "Mathematics and Computing (MAC)",
  "Mechanical Engineering (Electric Vehicles) (MEEV)",
  "Mechanical Engineering (ME)",
];

/**
 * Short-name mapping for branch keys returned by the backend
 * (e.g. company placement data). Used primarily in PYQs page.
 */
export const BRANCH_SHORT_NAMES = {
  cs: "CSE",
  it: "IT",
  mac: "M&C",
  ece: "ECE",
  ee: "EE",
  ice: "ICE",
  me: "ME",
};

/**
 * Branches commonly grouped under "circuital" in placement eligibility.
 */
export const CIRCUITAL_BRANCHES = [
  "CSE", "CSAI", "CSDS", "CSDA", "CIOT",
  "IT", "ITNS",
  "ECE", "ECAM", "EVDT",
  "EE",
  "ICE",
];

/** Ready-to-use display label for circuital eligibility text. */
export const CIRCUITAL_BRANCHES_LABEL = "CSE, IT, ECE, EE, ICE, and related branches";
