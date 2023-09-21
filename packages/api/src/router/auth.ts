import { TRPCError } from "@trpc/server"
import bcrypt from "bcryptjs"
import { z } from "zod"

import { createAuthToken } from "../lib/jwt"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(2),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
})
export const loginSchema = userSchema.pick({ email: true, password: true })
export const registerSchema = userSchema.pick({ email: true, password: true, firstName: true, lastName: true })
export const updateSchema = userSchema.partial()

export const authRouter = createTRPCRouter({
  me: publicProcedure.query(async ({ ctx }) => {
		const users = ctx.prisma.user.findMany()
		return users
	}),
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email } })
    if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect email or password" })
    const isSamePassword = bcrypt.compareSync(input.password, user.password)
    if (!isSamePassword) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect email or password" })
    const token = createAuthToken({ id: user.id })
    return { user, token }
  }),
  register: publicProcedure.input(registerSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email } })
    if (user) throw new TRPCError({ code: "BAD_REQUEST", message: "Email already in use" })
    const hashedPassword = bcrypt.hashSync(input.password, 10)
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
})
