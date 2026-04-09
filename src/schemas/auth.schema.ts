import { z } from "zod";

// Common user fields shared by registration schemas.

const baseUserFields = {
  name: z.string().min(2, "Name is required"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  companySlug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Invalid Company Slug"),
  departmentName: z.string().min(2, "Department is required"),
};

// Login payload.

export const loginSchema = z.object({
  companySlug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Invalid Company Slug"),
  email: z.email("Invalid email"),
  password: z.string().min(6),
});

// Manager registration payload.

export const registerManagerSchema = z.object({
  ...baseUserFields,
});

// Employee registration payload.

export const registerEmployeeSchema = z.object({
  ...baseUserFields,
  position: z.string().min(2, "Position is required"),
});

// Customer registration payload (kept for optional flows).

export const registerCustomerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().optional(),
  address: z.string().optional(),
});
// Leave request payload.

export const leaveRequestSchema = z.object({
  type: z.string().min(1, "Leave type is required"),
  employeeID: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  totalDays: z.number().optional(),
  reason: z.string().optional(),
  attachment: z.string().optional(),
});
