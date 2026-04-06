import { z } from "zod";

//////////////////////////////////////////////////////
// COMMON FIELDS
//////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////
// LOGIN
//////////////////////////////////////////////////////

export const loginSchema = z.object({
  companySlug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Invalid Company Slug"),
  email: z.email("Invalid email"),
  password: z.string().min(6),
});

//////////////////////////////////////////////////////
// REGISTER MANAGER
//////////////////////////////////////////////////////

export const registerManagerSchema = z.object({
  ...baseUserFields,
});

//////////////////////////////////////////////////////
// REGISTER EMPLOYEE
//////////////////////////////////////////////////////

export const registerEmployeeSchema = z.object({
  ...baseUserFields,
  position: z.string().min(2, "Position is required"),
});

//////////////////////////////////////////////////////
// REGISTER CUSTOMER (Keep if needed)
//////////////////////////////////////////////////////

export const registerCustomerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().optional(),
  address: z.string().optional(),
});
//////////////////////////////////////////////////////
// LEAVE REQUEST
//////////////////////////////////////////////////////

export const leaveRequestSchema = z.object({
  type: z.string().min(1, "Leave type is required"),
  employeeID: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  totalDays: z.number().optional(),
  reason: z.string().optional(),
  attachment: z.string().optional(),
});
