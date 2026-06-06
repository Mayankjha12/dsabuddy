import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { prisma } from "./config/prismaClient.js";
import routes from "./routes/index.js";
import session from "express-session";
import passport from "passport";
import authRoutes from "./routes/authRoutes.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import emailRoutes from "./routes/emailRoutes.js";
import userRoutes from "./routes/user.routes.js";
import companyRoutes from "./routes/company.routes.js";
import questionRoutes from "./routes/question.routes.js";
import tagRoutes from "./routes/tag.routes.js";
import userQuestionRoutes from "./routes/userQuestion.routes.js";
import dailyActivityRoutes from "./routes/dailyActivity.routes.js";
import platformConnectionRoutes from "./routes/platformConnection.routes.js";
import syncRoutes from "./routes/sync.routes.js";
import leetcodeRoutes from "./routes/leetcode.routes.js";

dotenv.config();

const app = express();

async function connectDatabases() {
  await prisma.$connect();
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

import jwt from "jsonwebtoken";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/oauth/google/callback`,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || profile.emails.length === 0) {
          return done(new Error("No email found in Google profile"), null);
        }
        const email = profile.emails[0].value;
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              userName: `user_${profile.id}`,
              avatarUrl: profile.photos[0]?.value || null,
            },
          });
        }

        const token = jwt.sign(
          {
            userId: user.id,
            _id: user.id,
            email: user.email,
            userName: user.userName,
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES || '7d' }
        );

        return done(null, { ...user, token });
      } catch (error) {
        console.error("Google Auth Error:", error);
        return done(error, null);
      }
    }
  )
);

app.use("/api/auth", routes);
app.use("/api/oauth", authRoutes);
app.use('/api/email', emailRoutes);
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/user-questions", userQuestionRoutes);
app.use("/api/daily-activity", dailyActivityRoutes);
app.use("/api/platform-connections", platformConnectionRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/leetcode", leetcodeRoutes);

app.get("/", (req, res) => res.send("Server running"));

const PORT = process.env.PORT || 5000;
connectDatabases()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Failed to connect databases:", err);
    process.exit(1);
  });

