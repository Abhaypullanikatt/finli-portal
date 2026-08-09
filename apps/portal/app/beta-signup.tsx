"use client";

import { createContext, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

const BetaSignupContext = createContext<(() => void) | null>(null);

export function BetaSignupProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => firstFieldRef.current?.focus(), 60);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const show = () => {
    setStatus("idle");
    setError("");
    setOpen(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const response = await fetch("/api/beta-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message ?? "We couldn’t send your request.");
      setStatus("success");
      form.reset();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <BetaSignupContext.Provider value={show}>
      {children}
      {open ? (
        <div className="beta-modal" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section aria-labelledby="beta-modal-title" aria-modal="true" className="beta-dialog" data-lenis-prevent role="dialog">
            <button aria-label="Close beta signup" className="beta-close" onClick={() => setOpen(false)} type="button">×</button>
            {status === "success" ? (
              <div className="beta-success">
                <span>✓</span>
                <p className="section-label">YOU’RE ON THE LIST</p>
                <h2>Thanks for helping us build this carefully.</h2>
                <p>We received your details and will contact you when a suitable beta spot opens.</p>
                <button onClick={() => setOpen(false)} type="button">Done</button>
              </div>
            ) : (
              <>
                <div className="beta-dialog-head">
                  <p className="section-label">PRIVATE BETA</p>
                  <h2 id="beta-modal-title">Tell us a little about you.</h2>
                  <p>We invite small groups at a time so every conversation can shape the product.</p>
                </div>
                <form className="beta-form" onSubmit={submit}>
                  <label><span>Your name</span><input autoComplete="name" maxLength={80} name="name" placeholder="Abhay Sharma" ref={firstFieldRef} required /></label>
                  <label><span>Email address</span><input autoComplete="email" maxLength={160} name="email" placeholder="you@example.com" required type="email" /></label>
                  <label><span>Where are you in your money journey?</span><select defaultValue="" name="stage" required><option disabled value="">Choose one</option><option>Starting my first job</option><option>1–3 years into working</option><option>Building savings seriously</option><option>Trying to organise my finances</option><option>Something else</option></select></label>
                  <label><span>What would you like help with?</span><textarea maxLength={600} name="message" placeholder="A sentence or two is enough." rows={3} /></label>
                  <label className="beta-consent"><input name="consent" required type="checkbox" value="yes" /><span>I’m happy for Finli to contact me about the private beta.</span></label>
                  <input aria-hidden="true" className="beta-honeypot" name="company" tabIndex={-1} type="text" />
                  {status === "error" ? <p className="beta-error" role="alert">{error}</p> : null}
                  <button className="beta-submit" disabled={status === "sending"} type="submit"><span>{status === "sending" ? "Sending…" : "Request beta access"}</span><i>↗</i></button>
                  <small className="beta-fineprint">No marketing lists. We’ll only use these details to manage beta invitations.</small>
                </form>
              </>
            )}
          </section>
        </div>
      ) : null}
    </BetaSignupContext.Provider>
  );
}

export function BetaSignupTrigger({ children, className }: { children: ReactNode; className?: string }) {
  const show = useContext(BetaSignupContext);
  if (!show) throw new Error("BetaSignupTrigger must be used inside BetaSignupProvider");
  return <button className={className} onClick={show} type="button">{children}</button>;
}
