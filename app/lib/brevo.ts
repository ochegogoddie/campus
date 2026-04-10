const requiredBrevoKeys = ["BREVO_API_KEY", "BREVO_SENDER_EMAIL"] as const;
const EMAIL_CONFIG_ERROR_PREFIX = "Brevo email delivery is not configured.";
const EMAIL_REQUEST_ERROR_PREFIX = "Brevo email request failed:";

function readValue(key: string) {
  const value = process.env[key];
  return value?.trim() ? value : "";
}

export function getBrevoConfig() {
  const missing = requiredBrevoKeys.filter((key) => !readValue(key));

  if (missing.length > 0) {
    return {
      configured: false as const,
      missing,
    };
  }

  return {
    configured: true as const,
    missing,
    apiKey: readValue("BREVO_API_KEY"),
    senderEmail: readValue("BREVO_SENDER_EMAIL"),
    senderName: readValue("BREVO_SENDER_NAME") || "Campus Gigs",
  };
}

export function resolveEmailDeliveryError(
  error: unknown,
  fallbackMessage: string
) {
  if (!(error instanceof Error)) {
    return {
      handled: false,
      status: 500,
      message: fallbackMessage,
    };
  }

  if (error.message.startsWith(EMAIL_CONFIG_ERROR_PREFIX)) {
    return {
      handled: true,
      status: 503,
      message: error.message,
    };
  }

  if (error.message.startsWith(EMAIL_REQUEST_ERROR_PREFIX)) {
    return {
      handled: true,
      status: 502,
      message:
        "Email delivery failed. Check your Brevo API key, sender email, and sender verification settings.",
    };
  }

  return {
    handled: false,
    status: 500,
    message: fallbackMessage,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendVerificationEmail(params: {
  toEmail: string;
  toName: string;
  subject: string;
  heading: string;
  intro: string;
  code: string;
  expiresInMinutes: number;
}) {
  const config = getBrevoConfig();

  if (!config.configured) {
    throw new Error(
      `Brevo email delivery is not configured. Missing: ${config.missing.join(", ")}`
    );
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": config.apiKey,
    },
    body: JSON.stringify({
      sender: {
        email: config.senderEmail,
        name: config.senderName,
      },
      to: [
        {
          email: params.toEmail,
          name: params.toName,
        },
      ],
      subject: params.subject,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; max-width: 560px; margin: 0 auto; padding: 24px;">
          <p style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #0ea5e9; font-weight: 700;">Campus Gigs</p>
          <h1 style="font-size: 28px; line-height: 1.2; margin: 16px 0 12px;">${escapeHtml(params.heading)}</h1>
          <p style="font-size: 16px; line-height: 1.7; color: #475569; margin: 0 0 24px;">${escapeHtml(params.intro)}</p>
          <div style="padding: 20px; border-radius: 18px; background: linear-gradient(135deg, #f59e0b, #f97316, #06b6d4); color: white; text-align: center;">
            <p style="font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; margin: 0 0 8px;">Verification Code</p>
            <p style="font-size: 34px; font-weight: 800; letter-spacing: 0.3em; margin: 0;">${escapeHtml(params.code)}</p>
          </div>
          <p style="font-size: 14px; line-height: 1.7; color: #64748b; margin: 24px 0 0;">This code expires in ${params.expiresInMinutes} minutes. If you did not request it, you can ignore this email.</p>
        </div>
      `,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Brevo email request failed: ${details || response.statusText}`);
  }
}
