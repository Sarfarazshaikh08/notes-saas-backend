import mongoose from 'mongoose';
const NoteSchema = new mongoose.Schema({
  title: String,
  content: String,
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
export default mongoose.models.Note || mongoose.model('Note', NoteSchema);