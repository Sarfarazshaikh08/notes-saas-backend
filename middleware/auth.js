import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function authMiddleware(req, res, next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if(!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = { id: user._id, role: user.role, tenantId: user.tenantId };
    next();
  } catch(err){
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(role){
  return (req, res, next) => {
    if(!req.user) return res.status(401).json({ error: 'Auth required' });
    if(req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}