import { Task } from "@plural-town/queue-core";
import { createTransport } from "nodemailer";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";

export class SendEmailConfirmationCode extends Task<SendEmailConfirmationCode> {

  public override async execute(
    emailAddress: string,
    code: string,
    href: string,
  ) {
    if(process.env["EMAIL_ENABLED"] !== "true") {
      throw new Error("Email is not enabled.");
    }

    const smtpOptions: SMTPTransport.Options = {
      host: process.env["EMAIL_HOST"],
      port: parseInt(process.env["EMAIL_PORT"] ?? "", 10),
      auth: {
        user: process.env["EMAIL_USER"],
        pass: process.env["EMAIL_PASS"],
      },
      tls: {
        ciphers: process.env["EMAIL_TLS_CIPHERS"],
      },
      secure: process.env["EMAIL_SECURE"] === "true",
    };

    const transporter = createTransport(smtpOptions);

    const info = await transporter.sendMail({
      from: process.env["EMAIL_FROM"],
      to: emailAddress,
      subject: `Confirm your ${process.env["SITE_NAME"]} account`,
      text: `Enter '${code}' on ${href} to confirm your email address.`,
      html: `<p>Enter <code>${code}</code> on <a href="${href}">${href}</a> to confirm your email address.`,
    });

    return info;
  }

}
