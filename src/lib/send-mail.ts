import { env } from '@/config/env.config';
import nodemailer from 'nodemailer';

export async function sendMail({
  html,
  mail,
  subject
}: {
  html: string;
  mail: string;
  subject?: string;
}) {
  const transporter = nodemailer.createTransport({
    service: env.SMTP_SERVICE,
    auth: {
      user: env.SMTP_MAIL,
      pass: env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    html,
    to: mail,
    subject
  });
}

export const sendResetPasswordMail = async ({
  email,
  token,
  passwordResetPageUrl
}: {
  email: string;
  token: string;
  passwordResetPageUrl: string;
}) => {
  const passwordResetLink = `${passwordResetPageUrl}?token=${token}`;
  const html = `
  <div>
    <h3>
      Password recovery for social media app
    </h3>
    <p>Update within 15 minutes before link expires</p>
    <a href='${passwordResetLink}' target='_blank' rel='noopener noreferrer'>
      Click here to reset Password
    </a>
  </div>
  `;

  sendMail({
    html,
    mail: email,
    subject: 'Password Recovery for social media app'
  });
};
