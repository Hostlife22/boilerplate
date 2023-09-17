import { render } from "@react-email/render"
import type { Transporter } from "nodemailer"
import { createTransport } from "nodemailer"
import type { SentMessageInfo } from "nodemailer/lib/smtp-transport"
import type { CreateEmailOptions } from "resend/build/src/emails/interfaces"

import { IS_PRODUCTION, SMTP_HOST, SMTP_PASSWORD, SMTP_SERVICE, SMTP_USERNAME } from "./config.server"
import { resend } from "./resend.server"

type Props = CreateEmailOptions & {
  react: React.ReactElement
}

class Mailer {
  private readonly transporter: Transporter<SentMessageInfo>
  constructor() {
    this.transporter = createTransport({
      host: SMTP_HOST,
      service: SMTP_SERVICE || "",
      auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD,
      },
    })
  }

  async send(args: Props) {
    try {
      if (IS_PRODUCTION) {
        await this.sendProd(args)
      } else {
        await resend.sendEmail(args)
      }
    } catch (err) {
      // Sentry.captureException(err)
      console.log("Error sending mail:", err)
    }
  }

  private async sendProd(args: Props) {
    const html = render(args.react, { pretty: true })
    const text = render(args.react, { plainText: true })
    return this.transporter.sendMail({
      ...args,
      html,
      text,
    })
  }
}

export const mailer = new Mailer()
