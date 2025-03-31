import { Request } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { User } from '../types';
import { ApiError } from './error.middleware';

// Function for tsoa authentication
export async function expressAuthentication(
  request: Request,
  securityName: string,
): Promise<User> {
  if (securityName === 'bearerAuth') {
    const authHeader = request.headers.authorization;
      
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Unauthorized: No token provided');
    }
      
    const token = authHeader.split(' ')[1];
      
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      
    if (error || !user) {
      throw new ApiError(401, 'Unauthorized: Invalid token');
    }
          
    // Set the authenticated user in the request
    request.user = user;
          
    return user;
  }
  
  throw new ApiError(401, 'Unauthorized: Invalid security name');
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
