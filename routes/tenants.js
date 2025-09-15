import express from 'express';
import Tenant from '../models/Tenant.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.post('/:slug/upgrade', authMiddleware, requireRole('Admin'), async (req, res) => {
  const { slug } = req.params;
  const tenant = await Tenant.findOne({ slug });
  if(!tenant) return res.status(404).json({ error: 'Tenant not found' });
  if(String(req.user.tenantId) !== String(tenant._id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  tenant.plan = 'pro';
  await tenant.save();
  res.json({ ok: true });
});

// Invite user - Admin only (creates with password 'password')
router.post('/:slug/invite', authMiddleware, requireRole('Admin'), async (req, res) => {
  const { slug } = req.params;
  const { email, role } = req.body;
  const tenant = await Tenant.findOne({ slug });
  if(!tenant) return res.status(404).json({ error: 'Tenant not found' });
  if(String(req.user.tenantId) !== String(tenant._id)) return res.status(403).json({ error: 'Forbidden' });

  const hashed = await bcrypt.hash('password', 8);
  const user = await User.create({ email, role, password: hashed, tenantId: tenant._id });
  res.json({ ok: true, userId: user._id });
});

export default router;