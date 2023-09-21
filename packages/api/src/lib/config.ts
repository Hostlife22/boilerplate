import { z } from "zod"

// Only use on the server
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  RESEND_API_KEY: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PASSWORD: z.string(),
  SMTP_SERVICE: z.string(),
  SMTP_USERNAME: z.string(),
  VERCEL_ENV: z.enum(["development", "production", "preview"]).optional(),
  VERCEL_URL: z.string().optional(),
})

export const { NODE_ENV, RESEND_API_KEY, SMTP_HOST, SMTP_PASSWORD, SMTP_SERVICE, SMTP_USERNAME, VERCEL_ENV, VERCEL_URL } =
  envSchema.parse(process.env)

export const IS_PRODUCTION = VERCEL_ENV === "production"
// WEB URL
export const FULL_WEB_URL = !VERCEL_URL ? "http://localhost:3000" : `https://${VERCEL_URL}`
