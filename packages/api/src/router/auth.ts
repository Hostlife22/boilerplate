import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { createAuthToken, decodeAuthToken } from "../lib/jwt"
import { comparePasswords, hashPassword } from "../lib/password"
import { sendResetPasswordEmail } from "../services/user/user.mailer"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

export const userSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  password: z.string().min(2),
})
export const loginSchema = userSchema.pick({ email: true, password: true })
export const registerSchema = userSchema.pick({ email: true, password: true, firstName: true, lastName: true })
export const updateSchema = userSchema.partial()
export const forgotPasswordSchema = userSchema.pick({ email: true })
export const resetPasswordSchema = userSchema.pick({ password: true }).merge(z.object({ token: z.string() }))
export const checkAuthorizationSchema = z.object({ userId: z.string() })

export const authRouter = createTRPCRouter({
  me: publicProcedure.query(async ({ ctx }) => {
    const users = ctx.prisma.user.findMany()
    return users
  }),
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email } })
    if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect email or password" })
    const isSamePassword = await comparePasswords(input.password, user.password)
    if (!isSamePassword) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect email or password" })
    const token = createAuthToken({ id: user.id })
    return { user, token }
  }),
  register: publicProcedure.input(registerSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email } })
    if (user) throw new TRPCError({ code: "BAD_REQUEST", message: "Email already in use" })
    const hashedPassword = await hashPassword(input.password)
    const newUser = await ctx.prisma.user.create({
      data: { ...input, password: hashedPassword },
    })
    const token = createAuthToken({ id: newUser.id })
    return { user: newUser, token }
  }),
  update: protectedProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.update({
      where: { id: ctx.user.id },
      data: input,
    })
    return user
  }),
  forgotPassword: publicProcedure.input(forgotPasswordSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email } })
    if (!user) return
    const token = createAuthToken({ id: user.id })
    await sendResetPasswordEmail(user, token)
  }),
  resetPassword: publicProcedure.input(resetPasswordSchema).mutation(async ({ ctx, input }) => {
    const payload = decodeAuthToken(input.token)
    const hashedPassword = await hashPassword(input.password)
    await ctx.prisma.user.update({ where: { id: payload.id }, data: { password: hashedPassword } })
  }),
  checkAuthorization: publicProcedure.input(checkAuthorizationSchema).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { id: input.userId }, select: { id: true } })
    if (!user) return false
    return true
  }),
})
