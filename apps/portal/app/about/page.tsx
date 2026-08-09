import type { Metadata } from "next";
import { BetaSignupTrigger } from "../beta-signup";

export const metadata: Metadata = {
  title: "About us — Finli",
  description: "Why we are building a calmer, clearer way for young Indians to understand money.",
};

const Arrow = () => <span aria-hidden="true">↗</span>;

const FinliLogo = ({ footer = false }: { footer?: boolean }) => (
  <span className={`brand-logo${footer ? " brand-logo-footer" : ""}`} aria-hidden="true">
    <img src="/branding/finli-logo.png" alt="" />
  </span>
);

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-scene" aria-hidden="true">
          <div className="about-scene-image" />
          <div className="about-scene-lamp" />
          <div className="about-scene-wind">
            {Array.from({ length: 11 }, (_, index) => <i key={index} />)}
          </div>
        </div>
        <nav className="about-nav" aria-label="About page navigation">
          <a className="brand" href="/" aria-label="Finli home">
            <FinliLogo />
          </a>
          <div>
            <a href="/#features">Features</a>
            <a href="/#privacy">Privacy</a>
            <a href="/#faq">FAQs</a>
          </div>
          <BetaSignupTrigger className="about-nav-cta">Join the beta</BetaSignupTrigger>
        </nav>

        <div className="about-hero-copy">
          <p className="section-label">ABOUT FINANCIAL COMPANION</p>
          <h1>The money app we wished came with a first <em className="editorial-word">salary.</em></h1>
          <p>
            Because financial confidence should begin with understanding—not jargon,
            pressure, or a product someone wants you to buy.
          </p>
        </div>

        <div className="about-hero-index"><span>01</span><i /><span>OUR STORY</span></div>
      </section>

      <section className="about-story">
        <div className="about-story-label">
          <p className="section-label">WHY WE STARTED</p>
          <span>Built around a simple observation.</span>
        </div>
        <div className="about-story-copy">
        <h2>Money gets <em className="editorial-word">real</em> very quickly. Guidance rarely does.</h2>
          <p>
            A first salary brings freedom, responsibility, and a sudden list of decisions:
            what to spend, what to save, how much safety is enough, and when investing should begin.
          </p>
          <p>
            Most tools begin with charts or products. We begin with the person and the question
            in front of them. Finli turns everyday money into a clear, explainable
            path—one useful move at a time.
          </p>
        </div>
      </section>

      <section className="about-proof" aria-label="Our product commitments">
        <article>
          <span>01</span>
          <strong>One move</strong>
          <p>A focused next step instead of ten competing alerts.</p>
        </article>
        <article>
          <span>00</span>
          <strong>Product pushing</strong>
          <p>Education and context stay ahead of commissions.</p>
        </article>
        <article>
          <span>✓</span>
          <strong>Your confirmation</strong>
          <p>Important entries and choices remain reviewable.</p>
        </article>
      </section>

      <section className="about-manifesto">
        <p className="section-label">OUR POINT OF VIEW</p>
        <h2>Good financial technology should make you feel more <em className="editorial-word">capable</em>—not more dependent.</h2>
        <div className="about-manifesto-foot">
          <p>
            We pair thoughtful guidance with transparent design so the reasoning stays visible,
            the language stays human, and every decision remains yours.
          </p>
          <span>CLARITY OVER COMPLEXITY · SAFETY BEFORE PRESSURE · PEOPLE BEFORE PRODUCTS</span>
        </div>
      </section>

      <section className="about-principles">
        <div className="about-principles-head">
          <p className="section-label">HOW WE CHOOSE TO BUILD</p>
        <h2><em className="editorial-word">Principles</em> before features.</h2>
          <p>Every product choice has to earn trust before it earns attention.</p>
        </div>
        <div className="about-principle-list">
          <article>
            <span>01</span>
            <div><h3>Listen to the real question.</h3><p>We start with the money decisions people are already trying to make—not a category we want to sell.</p></div>
          </article>
          <article>
            <span>02</span>
            <div><h3>Explain the why.</h3><p>A recommendation without reasoning cannot build confidence. Context is part of the product, not a footnote.</p></div>
          </article>
          <article>
            <span>03</span>
            <div><h3>Make control visible.</h3><p>Consent, confirmation, export, and deletion should be understandable when they matter—not buried in settings.</p></div>
          </article>
          <article>
            <span>04</span>
            <div><h3>Grow at the user’s pace.</h3><p>Safety comes first. Exploration comes next. Progress should feel calm enough to continue.</p></div>
          </article>
        </div>
      </section>

      <section className="about-closing">
        <p className="section-label">BUILD IT WITH US</p>
        <h2>A clearer financial future starts with better <em className="editorial-word">questions.</em></h2>
        <p>Join our private beta and help shape a companion designed around real first-salary lives.</p>
        <BetaSignupTrigger className="about-beta-button">Join the private beta <Arrow /></BetaSignupTrigger>
      </section>

      <footer className="about-footer">
        <a className="brand" href="/" aria-label="Finli home"><FinliLogo /></a>
        <nav aria-label="Footer navigation"><a href="/">Home</a><a href="/#privacy">Privacy</a><a href="/#faq">FAQs</a><a href="mailto:beta@financialcompanion.app">Contact</a></nav>
        <p>© 2026 Finli · Education only, not financial advice.</p>
      </footer>
    </main>
  );
}
