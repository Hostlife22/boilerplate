import { Link, useParams } from "@remix-run/react"
import type { ActionArgs } from "@vercel/remix"
import { redirect } from "@vercel/remix"
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
  const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(8, "Must be at least 8 characters"),
  })
  const result = await validateFormData(resetPasswordSchema, formData)
  if (!result.success) return formError(result)
  const data = result.data
  const { createFlash } = await getFlashSession(request)
  try {
    await trpcSsrClient.auth.resetPassword.mutate(data)
    return redirect("/login", {
      headers: { "Set-Cookie": await createFlash(FlashType.Info, "Password changed") },
    })
  } catch (error) {
    return badRequest(error, {
      headers: { "Set-Cookie": await createFlash(FlashType.Error, "Change password error") },
    })
  }
}

export default function ResetPassword() {
  const { token } = useParams()

  return (
    <Form method="post">
      <div className="stack">
        <div>
          <h1 className="text-4xl font-bold">Reset password</h1>
          <p>Enter a new password below.</p>
        </div>
        <input name="token" type="hidden" value={token} />
        <FormField required label="Password" name="password" type="password" placeholder="********" />
        <FormError />
        <FormButton className="w-full">Reset</FormButton>
        <Link to="/login">Login</Link>
      </div>
    </Form>
  )
}
