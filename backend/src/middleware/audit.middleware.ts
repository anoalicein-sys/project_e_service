import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import AuditLog from '../models/AuditLog';

/**
 * Middleware to log sensitive actions (POST, PATCH, DELETE) to the database.
 * Requires AuthRequest to capture the user ID.
 */
export const auditLogger = (targetModel: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // We only want to log mutations, not reads
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
      
      // Capture the original send function to execute logic after the response is sent
      const originalSend = res.send;
      
      res.send = function (body): any {
        res.send = originalSend;
        const responseResult = res.send(body);

        // Only log successful mutations
        if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
          try {
            let targetId = null;
            let action = req.method;

            // Attempt to extract target ID from params or response body
            if (req.params.id) {
              targetId = req.params.id;
              action = `UPDATE_${targetModel.toUpperCase()}`;
            } else if (body) {
              try {
                const parsedBody = JSON.parse(body);
                if (parsedBody._id) {
                  targetId = parsedBody._id;
                  action = `CREATE_${targetModel.toUpperCase()}`;
                }
              } catch (e) {
                // Not JSON, ignore
              }
            }

            // Fallback action naming if specific ID isn't found
            if (!targetId) {
                targetId = req.user.id; // Fallback to user ID doing the action
                action = `MUTATE_${targetModel.toUpperCase()}`;
            }

            // Create log asynchronously (fire and forget)
            AuditLog.create({
              userId: req.user.id,
              action,
              targetId,
              targetModel,
              details: {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip
              }
            }).catch(err => console.error('Audit Log Insertion Failed:', err));

          } catch (error) {
            console.error('Audit Logger Execution Failed:', error);
          }
        }
        return responseResult;
      };
    }
    next();
  };
};
