import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).populate('tenantId');
  if(!user) return res.status(401).json({ error: 'Invalid' });
  const valid = await bcrypt.compare(password, user.password);
  if(!valid) return res.status(401).json({ error: 'Invalid' });
  const token = jwt.sign({ userId: user._id, tenantId: user.tenantId._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, tenant: { slug: user.tenantId.slug, plan: user.tenantId.plan } });
});

export default router;