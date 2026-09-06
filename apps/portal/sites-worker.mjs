const recentSubmissions = new Map();

const clean = (value, max) =>
  typeof value === "string"
    ? value.trim().replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, max)
    : "";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

async function submitBetaRequest(request, env) {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const lastSubmission = recentSubmissions.get(ip) ?? 0;
  if (Date.now() - lastSubmission < 60_000) {
    return json({ message: "Please wait a moment before submitting again." }, 429);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return json({ message: "Invalid form submission." }, 400);
  if (clean(body.company, 100)) return json({ ok: true });

  const name = clean(body.name, 80);
  const email = clean(body.email, 160).toLowerCase();
  const stage = clean(body.stage, 120);
  const message = clean(body.message, 600);
  const consent = clean(body.consent, 10);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !stage || consent !== "yes") {
    return json({ message: "Please complete all required fields." }, 400);
  }

  const apiKey = env.RESEND_API_KEY;
  const from = env.BETA_SIGNUP_FROM;
  const to = env.BETA_SIGNUP_TO ?? "abhayppullanikatt@gmail.com";
  if (!apiKey || !from) return json({ message: "Beta signup delivery is not configured yet." }, 503);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "idempotency-key": `beta-${crypto.randomUUID()}`,
      "user-agent": "Finli-Portal/1.0",
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

  if (!response.ok) return json({ message: "We couldn’t send your request. Please try again." }, 502);
  recentSubmissions.set(ip, Date.now());
  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/api/beta-signup") {
      return submitBetaRequest(request, env);
    }
    if (!env.ASSETS?.fetch) return new Response("Static assets are unavailable.", { status: 500 });
    return env.ASSETS.fetch(request);
  },
};
