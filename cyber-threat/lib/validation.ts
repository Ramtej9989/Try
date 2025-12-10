import { z } from "zod";

/**
 * Login credentials schema
 */
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

/**
 * User registration schema
 */
export const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  role: z.enum(["ADMIN", "ANALYST"], {
    errorMap: () => ({ message: "Role must be either ADMIN or ANALYST" })
  })
});

/**
 * Date range schema for filtering logs and alerts
 */
export const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

/**
 * Alert status update schema
 */
export const alertStatusSchema = z.object({
  alertId: z.string(),
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "FALSE_POSITIVE"], {
    errorMap: () => ({ message: "Invalid alert status" })
  })
});

/**
 * Network log search parameters schema
 */
export const networkLogSearchSchema = z.object({
  src_ip: z.string().optional(),
  dest_ip: z.string().optional(),
  protocol: z.string().optional(),
  action: z.string().optional(),
  label: z.string().optional(),
  limit: z.number().int().positive().optional().default(100),
  skip: z.number().int().nonnegative().optional().default(0),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

/**
 * Authentication log search parameters schema
 */
export const authLogSearchSchema = z.object({
  username: z.string().optional(),
  src_ip: z.string().optional(),
  dest_host: z.string().optional(),
  status: z.string().optional(),
  auth_method: z.string().optional(),
  limit: z.number().int().positive().optional().default(100),
  skip: z.number().int().nonnegative().optional().default(0),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

/**
 * Threat intelligence indicator schema
 */
export const threatIntelSchema = z.object({
  indicator: z.string().min(1),
  type: z.string().min(1),
  threat_level: z.number().int().min(1).max(10),
  source: z.string().min(1),
  first_seen: z.string(),
  last_seen: z.string()
});

/**
 * Helper function to validate data using a Zod schema
 */
export async function validateData<T>(schema: z.ZodType<T>, data: unknown): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Validation error: ${errorMessage}`);
    }
    throw error;
  }
}

/**
 * Helper function to safely parse and validate JSON
 */
export async function parseJson<T>(jsonString: string, schema: z.ZodType<T>): Promise<T> {
  try {
    const data = JSON.parse(jsonString);
    return await validateData(schema, data);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw error;
  }
}
