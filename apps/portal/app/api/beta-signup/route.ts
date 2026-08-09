import { NextRequest, NextResponse } from "next/server";

const recentSubmissions = new Map<string, number>();

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, max) : "";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const lastSubmission = recentSubmissions.get(ip) ?? 0;
  if (Date.now() - lastSubmission < 60_000) {
    return NextResponse.json({ message: "Please wait a moment before submitting again." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid form submission." }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  if (clean(payload.company, 100)) return NextResponse.json({ ok: true });

  const name = clean(payload.name, 80);
  const email = clean(payload.email, 160).toLowerCase();
  const stage = clean(payload.stage, 120);
  const message = clean(payload.message, 600);
  const consent = clean(payload.consent, 10);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || !emailPattern.test(email) || !stage || consent !== "yes") {
    return NextResponse.json({ message: "Please complete all required fields." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.BETA_SIGNUP_FROM;
  const to = process.env.BETA_SIGNUP_TO ?? "beta@financialcompanion.app";
  if (!apiKey || !from) {
    return NextResponse.json({ message: "Beta signup delivery is not configured yet." }, { status: 503 });
  }

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `beta-${crypto.randomUUID()}`,
      "User-Agent": "Finli-Portal/1.0",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `New Finli beta request — ${name}`,
      text: [
        "New private beta request",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Journey: ${stage}`,
        `Message: ${message || "Not provided"}`,
        "Consent: Yes",
      ].join("\n"),
    }),
  });

  if (!emailResponse.ok) {
    console.error("Beta signup delivery failed", emailResponse.status, await emailResponse.text());
    return NextResponse.json({ message: "We couldn’t send your request. Please try again." }, { status: 502 });
  }

  recentSubmissions.set(ip, Date.now());
  return NextResponse.json({ ok: true });
}
