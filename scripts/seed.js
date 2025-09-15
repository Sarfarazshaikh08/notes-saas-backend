import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
dotenv.config();

async function main(){
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  await Tenant.deleteMany({});
  await User.deleteMany({});

  const acme = await Tenant.create({ name: 'Acme', slug: 'acme', plan: 'free' });
  const globex = await Tenant.create({ name: 'Globex', slug: 'globex', plan: 'free' });

  const pw = await bcrypt.hash('password', 8);

  await User.create({ email: 'admin@acme.test', password: pw, role: 'Admin', tenantId: acme._id });
  await User.create({ email: 'user@acme.test', password: pw, role: 'Member', tenantId: acme._id });
  await User.create({ email: 'admin@globex.test', password: pw, role: 'Admin', tenantId: globex._id });
  await User.create({ email: 'user@globex.test', password: pw, role: 'Member', tenantId: globex._id });

  console.log('Seeded tenants and users');
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });