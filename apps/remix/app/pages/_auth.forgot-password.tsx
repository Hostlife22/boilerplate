import { Link } from "@remix-run/react"
import { redirect, type ActionArgs } from "@vercel/remix"
import { z } from "zod"

import { Form, FormButton, FormError, FormField } from "~/components/Form"
import { formError, validateFormData } from "~/lib/form"
import { trpcSsrClient } from "~/lib/providers/TRPCProvider"
import { badRequest } from "~/lib/remix"
import { FlashType, getFlashSession } from "~/services/session/flash.server"

export const headers = () => {
  return {
    "Cache-Control": "max-age=3600, s-maxage=86400",
  }
}

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData()
  const resetSchema = z.object({ email: z.string().email("Invalid email") })
  const result = await validateFormData(resetSchema, formData)
  if (!result.success) return formError(result)
  const { createFlash } = await getFlashSession(request)
  const data = result.data
  try {
    await trpcSsrClient.auth.forgotPassword.mutate(data)
    return redirect("/login", {
      headers: { "Set-Cookie": await createFlash(FlashType.Info, "Reset link sent to your email") },
    })
  } catch (error) {
    return badRequest(error, {
      headers: { "Set-Cookie": await createFlash(FlashType.Error, "Reset password error") },
    })
  }
}

export default function ForgotPassword() {
  return (
    <Form method="post">
      <div className="stack">
        <h1 className="text-4xl font-bold">Forgot password?</h1>
        <p>Enter your email below to receive your password reset instructions.</p>
        <FormField required label="Email address" name="email" placeholder="jim@gmail.com" />
        <FormError />
        <FormButton className="w-full">Send instructions</FormButton>
        <Link to="/login">Login</Link>
      </div>
    </Form>
  )
}
