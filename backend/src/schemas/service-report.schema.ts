import { z } from 'zod';

const workTimeSchema = z.object({
  timeFrom: z.string().datetime(),
  timeUpto: z.string().datetime(),
  workTime: z.number().positive(),
  engineerName: z.string().min(2),
});

export const createServiceReportSchema = z.object({
  body: z.object({
    reportNo: z.string().min(3),
    machineId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    requestId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    jobTitle: z.string().min(3),
    jobCategory: z.string().min(3),
    chargesType: z.enum(['Warranty', 'AMC', 'Chargeable', 'FOC']),
    observation: z.string().min(10),
    causeOfFailure: z.string().min(5),
    actionTaken: z.string().min(5),
    recommendation: z.string().min(5),
    workTime: z.array(workTimeSchema).min(1),
  }),
});

export const updateServiceReportSchema = createServiceReportSchema.deepPartial().merge(
  z.object({
    params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) })
  })
);
