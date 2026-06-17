import { z } from 'zod';

export const createMachineSchema = z.object({
  body: z.object({
    customerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Customer ID'),
    type: z.string().min(2, 'Machine type is required'),
    model: z.string().min(2, 'Machine model is required'),
    serialNo: z.string().min(3, 'Serial number is required'),
    installDate: z.string().datetime({ message: 'Invalid install date. Must be ISO 8601 string' }),
    status: z.enum(['Active', 'Inactive', 'Under Maintenance', 'Decommissioned']).optional(),
  }),
});

export const updateMachineSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Machine ID'),
  }),
  body: z.object({
    type: z.string().optional(),
    model: z.string().optional(),
    serialNo: z.string().optional(),
    installDate: z.string().datetime().optional(),
    status: z.enum(['Active', 'Inactive', 'Under Maintenance', 'Decommissioned']).optional(),
  }).strict(),
});
