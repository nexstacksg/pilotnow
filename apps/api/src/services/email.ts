export class PasswordResetDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordResetDeliveryError';
  }
}

export function assertPasswordResetEmailConfigured() {
  if (process.env.NODE_ENV === 'production' && !smtpConfig()) {
    throw new PasswordResetDeliveryError('Password-reset email is not configured');
  }
}

function smtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim();
  const secureValue = process.env.SMTP_SECURE?.trim().toLowerCase();

  if (!host || !Number.isInteger(port) || port <= 0 || !user || !pass || !from || !['true', 'false'].includes(secureValue ?? '')) {
    return null;
  }

  return { host, port, user, pass, from, secure: secureValue === 'true' };
}

export async function sendPasswordResetCode(to: string, code: string) {
  const config = smtpConfig();

  if (!config) {
    assertPasswordResetEmailConfigured();
    return 'development' as const;
  }

  try {
    const nodemailer = await Function('specifier', 'return import(specifier)')('nodemailer');
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    });

    await transporter.sendMail({
        from: config.from,
        to: [to],
        subject: 'Your PilotNow password reset code',
        text: `Your PilotNow password reset code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
        html: `<p>Your PilotNow password reset code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:8px">${code}</p><p>It expires in 10 minutes. If you did not request this, you can ignore this email.</p>`,
    });
  } catch {
    throw new PasswordResetDeliveryError('Password-reset email could not be sent');
  }

  return 'sent' as const;
}
