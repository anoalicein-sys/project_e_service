import { z } from 'zod';

export const createServiceRequestSchema = z.object({
  body: z.object({
    machineId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Machine ID'),
    issueDescription: z.string().min(10, 'Description must be at least 10 characters long'),
  }),
});

export const assignEngineerSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Request ID'),
  }),
  body: z.object({
    assignedEngineerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Engineer ID'),
  }),
});
