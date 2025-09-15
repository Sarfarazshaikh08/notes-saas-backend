// routes/test.js
import express from 'express';
const router = express.Router();

router.get('/env', (req, res) => {
  res.json({
    MONGODB_URI: process.env.MONGODB_URI ? "Set ✅" : "Not Set ❌",
    JWT_SECRET: process.env.JWT_SECRET ? "Set ✅" : "Not Set ❌",
    VERCEL: process.env.VERCEL === '1' ? "Set ✅" : "Not Set ❌"
  });
});

export default router;
