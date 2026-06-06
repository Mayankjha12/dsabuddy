import express from "express";
import passport from "passport";

const router = express.Router();

// Start Google Login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/api/oauth/fail" }),
  (req, res) => {
    const token = req.user?.token;
    if (!token) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_token_missing`);
    }
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  }
);

// Failed login
router.get("/fail", (req, res) => {
  res.send("❌ Failed to authenticate");
});

// Logout
router.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect(process.env.FRONTEND_URL);
  });
});



export default router;
