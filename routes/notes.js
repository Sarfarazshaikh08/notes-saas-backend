import express from 'express';
import Note from '../models/Note.js';
import Tenant from '../models/Tenant.js';
import { authMiddleware } from '../middleware/auth.js';
const router = express.Router();

const FREE_PLAN_LIMIT = 3;

router.use(authMiddleware);

router.post('/', async (req, res) => {
  const { title, content } = req.body;
  const tenantId = req.user.tenantId;
  const tenant = await Tenant.findById(tenantId);
  if(tenant.plan === 'free'){
    const count = await Note.countDocuments({ tenantId });
    if(count >= FREE_PLAN_LIMIT) return res.status(403).json({ error: 'Note limit reached' });
  }
  const note = await Note.create({ title, content, tenantId, ownerId: req.user.id });
  res.json(note);
});

router.get('/', async (req, res) => {
  const notes = await Note.find({ tenantId: req.user.tenantId });
  res.json(notes);
});

router.get('/:id', async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if(!note) return res.status(404).json({ error: 'Not found' });
  res.json(note);
});

router.put('/:id', async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    { title: req.body.title, content: req.body.content },
    { new: true }
  );
  if(!note) return res.status(404).json({ error: 'Not found' });
  res.json(note);
});

router.delete('/:id', async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
  if(!note) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;