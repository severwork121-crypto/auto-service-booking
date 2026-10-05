import { z } from 'zod';

export const bookingSchema = z.object({
  serviceId: z.string().uuid('Выберите услугу'),
  startAt: z
    .string()
    .min(1, 'Выберите дату и время')
    .refine(
      (val) => !isNaN(new Date(val).getTime()),
      'Неверный формат даты и времени'
    ),
  clientName: z.string().min(2, 'Введите имя').max(100),
  clientPhone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{10,20}$/, 'Введите корректный номер телефона'),
  clientCar: z.string().min(2, 'Укажите автомобиль').max(200),
});

export type BookingForm = z.infer<typeof bookingSchema>;

export const serviceSchema = z.object({
  name: z.string().min(1, 'Введите название').max(200),
  price: z.coerce.number().positive('Цена должна быть положительной'),
  durationMinutes: z.coerce.number().int().min(15).max(1440),
  prepTimeMinutes: z.coerce.number().int().min(0).max(240).default(15),
  bayCount: z.coerce.number().int().min(1).max(10).default(1),
  isActive: z.boolean().default(true),
});

export type ServiceForm = z.infer<typeof serviceSchema>;

export const workingDaySchema = z
  .object({ start: z.string(), end: z.string() })
  .nullable();

export const tenantSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().default(''),
  address: z.string().min(1),
  phone: z.string().min(5),
  timezone: z.string(),
  workingHours: z.record(workingDaySchema),
  services: z.array(serviceSchema).min(1),
  infoCards: z
    .array(z.object({ title: z.string(), text: z.string() }))
    .max(3)
    .default([]),
});

export type TenantSettings = z.infer<typeof tenantSchema>;

export const assistantMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export type AssistantMessage = z.infer<typeof assistantMessageSchema>;