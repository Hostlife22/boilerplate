import { Resend } from "resend"

import { RESEND_API_KEY } from "./config"

export const resend = new Resend(RESEND_API_KEY)
