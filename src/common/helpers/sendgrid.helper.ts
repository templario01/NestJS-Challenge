import * as sgMail from '@sendgrid/mail';
import * as dotenv from 'dotenv';
dotenv.config();

const HOST = process.env.HOST || `localhost:${process.env.PORT || 3000}`;

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const createEmail = (
  to: string,
  subject: string,
  message: string,
  link = '',
  token = '',
): sgMail.MailDataRequired => {
  const msg: sgMail.MailDataRequired = {
    to,
    subject,
    from: process.env.SENDGRID_EMAIL,
    html: `<h1>${subject}</h1>
    <p>${message}</p><p>${link}</p>
    ${token ? `<p>or change the token in params<br>${token}</p>` : ''}`,
  };
  return msg;
};

export { sgMail, createEmail, HOST };
