import express from 'express';
import Tenant from '../models/Tenant.js';
import Note from '../models/Note.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

/* ------------------------- Tenant Management ------------------------- */

// Upgrade plan (Admin only)
router.post('/:slug/upgrade', authMiddleware, requireRole('Admin'), async (req, res) => {
  const { slug } = req.params;
  const tenant = await Tenant.findOne({ slug });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  if (String(req.user.tenantId) !== String(tenant._id)) {
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
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  if (String(req.user.tenantId) !== String(tenant._id)) return res.status(403).json({ error: 'Forbidden' });

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

/* ------------------------- Tenant Notes ------------------------- */

// Get notes
router.get('/:slug/notes', authMiddleware, async (req, res) => {
  const { slug } = req.params;
  const tenant = await Tenant.findOne({ slug });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  if (String(req.user.tenantId) !== String(tenant._id)) return res.status(403).json({ error: 'Forbidden' });

  const notes = await Note.find({ tenantId: tenant._id });
  res.json(notes);
});

// Create note
router.post('/:slug/notes', authMiddleware, async (req, res) => {
  const { slug } = req.params;
  const { title, content } = req.body;
  const tenant = await Tenant.findOne({ slug });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  if (String(req.user.tenantId) !== String(tenant._id)) return res.status(403).json({ error: 'Forbidden' });

  const note = await Note.create({
    title,
    content,
    tenantId: tenant._id,
    userId: req.user._id,
  });

  res.json(note);
});

// Update note
router.put('/:slug/notes/:id', authMiddleware, async (req, res) => {
  const { slug, id } = req.params;
  const { title, content } = req.body;
  const tenant = await Tenant.findOne({ slug });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  if (String(req.user.tenantId) !== String(tenant._id)) return res.status(403).json({ error: 'Forbidden' });

  const note = await Note.findOneAndUpdate(
    { _id: id, tenantId: tenant._id },
    { title, content },
    { new: true }
  );
  if (!note) return res.status(404).json({ error: 'Note not found' });

  res.json(note);
});

// Delete note
router.delete('/:slug/notes/:id', authMiddleware, async (req, res) => {
  const { slug, id } = req.params;
  const tenant = await Tenant.findOne({ slug });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  if (String(req.user.tenantId) !== String(tenant._id)) return res.status(403).json({ error: 'Forbidden' });

  await Note.findOneAndDelete({ _id: id, tenantId: tenant._id });
  res.json({ ok: true });
});

export default router;
