import { z } from "zod"

// Only use on the server
const envSchema = z.object({
  APP_SECRET: z.string(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  FLASH_SESSION_SECRET: z.string(),
  NODE_ENV: z.enum(["development", "production"]),
  RESEND_API_KEY: z.string(),
  SESSION_SECRET: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PASSWORD: z.string(),
  SMTP_SERVICE: z.string(),
  SMTP_USERNAME: z.string(),
  THEME_SESSION_SECRET: z.string(),
  VERCEL_ENV: z.enum(["development", "production", "preview"]).optional(),
  VERCEL_URL: z.string().optional(),
})

export const {
  APP_SECRET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  FLASH_SESSION_SECRET,
  NODE_ENV,
  RESEND_API_KEY,
  SESSION_SECRET,
  SMTP_HOST,
  SMTP_PASSWORD,
  SMTP_SERVICE,
  SMTP_USERNAME,
  THEME_SESSION_SECRET,
  VERCEL_ENV,
  VERCEL_URL,
} = envSchema.parse(process.env)

export const IS_PRODUCTION = VERCEL_ENV === "production"
// WEB URL
export const FULL_WEB_URL = !VERCEL_URL ? "http://localhost:3000" : `https://${VERCEL_URL}`
