import express from 'express';
import Tenant from '../models/Tenant.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Upgrade plan (Admin only)
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

// Invite user - Admin only (default password = "password")
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

// List all users in a tenant (Admin only)
router.get('/:slug/users', authMiddleware, requireRole('Admin'), async (req, res) => {
  const { slug } = req.params;
  const tenant = await Tenant.findOne({ slug });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  if (String(req.user.tenantId) !== String(tenant._id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const users = await User.find({ tenantId: tenant._id }).select('-password');
  res.json(users);
});

// Remove a user from a tenant (Admin only)
router.delete('/:slug/users/:userId', authMiddleware, requireRole('Admin'), async (req, res) => {
  const { slug, userId } = req.params;
  const tenant = await Tenant.findOne({ slug });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  if (String(req.user.tenantId) !== String(tenant._id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const user = await User.findOne({ _id: userId, tenantId: tenant._id });
  if (!user) return res.status(404).json({ error: 'User not found' });

  await user.deleteOne();
  res.json({ ok: true });
});

export default router;
