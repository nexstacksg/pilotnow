export class PasswordResetDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordResetDeliveryError';
  }
}

export function assertPasswordResetEmailConfigured() {
  if (process.env.NODE_ENV === 'production' && (
    !process.env.RESEND_API_KEY?.trim() || !process.env.PASSWORD_RESET_FROM_EMAIL?.trim()
  )) {
    throw new PasswordResetDeliveryError('Password-reset email is not configured');
  }
}

export async function sendPasswordResetCode(to: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.PASSWORD_RESET_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    assertPasswordResetEmailConfigured();
    return 'development' as const;
  }

  let response: Response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: 'Your PilotNow password reset code',
        text: `Your PilotNow password reset code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
        html: `<p>Your PilotNow password reset code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:8px">${code}</p><p>It expires in 10 minutes. If you did not request this, you can ignore this email.</p>`,
      }),
    });
  } catch {
    throw new PasswordResetDeliveryError('Password-reset email could not be sent');
  }

  if (!response.ok) {
    console.error(`Password-reset email delivery failed with status ${response.status}`);
    throw new PasswordResetDeliveryError('Password-reset email could not be sent');
  }

  return 'sent' as const;
}
