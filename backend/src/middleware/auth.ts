import { Request, Response, NextFunction } from 'express';
import { DB, findById } from '../database';

// Extend Express Request to include user context
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        institutionId?: string;
      };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const user = findById(DB.users, userId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid user' });
  }

  req.user = {
    id: user.id,
    role: user.role,
    institutionId: user.institutionId
  };

  next();
};

export const requireRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    
    next();
  };
};

export const requireInstitutionMatch = (getInstitutionId: (req: Request) => string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Super Admin and Inspection members can access any institution (if permitted)
    if (['SUPER_ADMIN', 'INSPECTION_ADMIN', 'INSPECTION_MEMBER'].includes(req.user.role)) {
      return next();
    }

    const targetInstitutionId = getInstitutionId(req);
    
    if (req.user.institutionId !== targetInstitutionId) {
      return res.status(403).json({ error: 'Access denied: unauthorized institution' });
    }

    next();
  };
};
