import { Task } from "@plural-town/queue-core";
import { createTransport } from "nodemailer";
import SMTPTransport = require("nodemailer/lib/smtp-transport");

/**
 * Warn an existing user that someone has tried to register with their existing email.
 */
export class SendDuplicateRegistrationEmail extends Task<SendDuplicateRegistrationEmail> {

  public override async execute(
    emailAddress: string,
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

    const forgot = `${process.env["BASE_URL"]}/forgot/`;

    const info = await transporter.sendMail({
      from: process.env["EMAIL_FROM"],
      to: emailAddress,
      subject: `Duplicate ${process.env["SITE_NAME"]} Account Registration`,
      text: `Hi!  Someone (you?) attempted to register using this email address, which has already been used to create a ${process.env["SITE_NAME"]} account.\n\nIf this was not you, you do not need to do anything.  We have ignored the registration, and have not told whoever signed up that your account exists.\n\nIf you need to reset your password, please visit ${process.env["BASE_URL"]}/forgot/.`,
      html: `
        <p>
          Hi!  Someone (maybe you?) attempted to register using this email address,
          which has already been already been used to create a <a href="${process.env["BASE_URL"]}">${process.env["SITE_NAME"]}</a> account.
        <p>
        <p>
          If this was not you, you do not need to do anything.
          We have ignored the registration, and have not told whoever signed up
          that your account exists.
        </p>
        <p>
          If you need to reset your password, please visit
          <a href="${forgot}">${forgot}</a>.
        </p>`
    });

    return info;
  }

}
