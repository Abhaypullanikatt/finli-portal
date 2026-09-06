import { HeroScene } from "./hero-scene";
import { ParallaxScene } from "./parallax-scene";
import { FinancialStack } from "./financial-stack";
import { FeatureBento } from "./feature-bento";
import { VisionSplit } from "./vision-split";
import { PrivacyShowcase } from "./privacy-showcase";
import { BetaSignupTrigger } from "./beta-signup";
import { ScrollWordReveal } from "./scroll-word-reveal";

const Arrow = () => <span aria-hidden="true">↗</span>;

const Wave = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" />
  </svg>
);

const FinliLogo = ({ footer = false }: { footer?: boolean }) => (
  <span className={`brand-logo${footer ? " brand-logo-footer" : ""}`} aria-hidden="true">
    <img src={footer ? "/branding/finli-logo-reverse-on-dark.png" : "/branding/finli-logo-primary-on-light.png"} alt="" />
  </span>
);

export default function HomePage() {
  return (
    <main>
      <section className="hero-shell" id="home">
        <HeroScene />
        <nav className="nav" aria-label="Main navigation">
          <a className="brand" href="#home" aria-label="Finli home">
            <FinliLogo />
          </a>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="/about">About us</a>
            <a href="#features">Features</a>
            <a href="#privacy">Privacy</a>
            <a href="#faq">FAQ</a>
          </div>
          <BetaSignupTrigger className="nav-cta">Join the beta</BetaSignupTrigger>
        </nav>

        <div className="hero-copy">
          <div className="pill"><span>Built for your first salary</span><Arrow /></div>
          <h1>Money <em className="editorial-word">clarity,</em><br />without the money jargon.</h1>
          <p>
            A calm financial companion that helps young Indians understand
            spending, build a safety fund, and take one clear step at a time.
          </p>
          <BetaSignupTrigger className="primary-button">Join the private beta <Arrow /></BetaSignupTrigger>
        </div>
      </section>

      <VisionSplit />

      <FinancialStack />

      <section className="feature-block section-pad" id="features">
        <div className="feature-heading">
          <div>
            <p className="section-label">ONE STEP AT A TIME</p>
            <h2>From “where did it go?”<br />to “I know what’s <em className="editorial-word">next.</em>”</h2>
          </div>
          <p>See your priorities, understand the why, and act when you’re ready.</p>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-media dashboard-media">
              <div className="mini-dashboard">
                <div className="mini-top"><span>Monthly plan</span><strong>68%</strong></div>
                <div className="bars"><i /><i /><i /><i /><i /><i /><i /></div>
                <div className="mini-row"><span>Needs</span><b>₹21,400</b></div>
                <div className="mini-row"><span>Wants</span><b>₹8,200</b></div>
                <div className="mini-row accent-row"><span>Left to plan</span><b>₹6,400</b></div>
              </div>
            </div>
            <p className="feature-caption"><strong>See the whole picture.</strong> A clean monthly view makes income, spending, and goals feel understandable.</p>
          </article>
          <article className="feature-card">
            <div className="feature-media voice-media">
              <div className="voice-visual"><span><Wave /></span><div className="wave-lines"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><small>“Paid 1,200 for electricity”</small></div>
            </div>
            <p className="feature-caption"><strong>Capture life as it happens.</strong> Speak or type an expense, then review it before anything is saved.</p>
          </article>
          <article className="feature-card">
            <div className="feature-media path-media">
              <div className="path-visual">
                <div className="path-topline"><span>YOUR NEXT 3 STEPS</span><b>68% aligned</b></div>
                <div className="path-track"><i className="path-progress" /><span className="path-step is-done"><b>✓</b><small>Get clear</small></span><span className="path-step is-current"><b>2</b><small>Build buffer</small></span><span className="path-step"><b>3</b><small>Start goals</small></span></div>
                <div className="path-recommendation"><span>NOW · RECOMMENDED</span><strong>Build a 3-month buffer.</strong><small>Because your next step should feel safe first.</small><em>↗</em></div>
              </div>
            </div>
            <p className="feature-caption"><strong>Follow a path that fits.</strong> Get goal-aware education and priorities explained in plain language.</p>
          </article>
        </div>
      </section>

      <FeatureBento />

      <ParallaxScene />

      <section className="privacy-section section-pad" id="privacy">
        <PrivacyShowcase />
        <div className="privacy-copy">
          <p className="section-label">PRIVACY WITH A PURPOSE</p>
            <h2 className="privacy-word-heading"><ScrollWordReveal /></h2>
          <p>Your information should serve you—not an ad network. Important actions stay understandable, reviewable, and easy to revisit.</p>
          <div className="privacy-list">
            <div><span>01</span><p><strong>Confirm before it counts.</strong> Voice entries remain proposals until you review them.</p><i aria-hidden="true">↗</i></div>
            <div><span>02</span><p><strong>Explain the reasoning.</strong> Every suggested learning path tells you why it appeared.</p><i aria-hidden="true">↗</i></div>
            <div><span>03</span><p><strong>Keep a visible record.</strong> Confirmations, permissions, and important activity remain easy to review.</p><i aria-hidden="true">↗</i></div>
          </div>
        </div>
      </section>

      <section className="faq-section" id="faq">
        <div className="faq-intro">
          <p className="section-label">FREQUENTLY ASKED QUESTIONS</p>
          <h2>A <em className="editorial-word">few</em> things you might be wondering.</h2>
          <p>
            Finli is being designed to make money feel clearer,
            calmer, and easier to act on—without turning every answer into a sales pitch.
          </p>
          <a href="mailto:beta@financialcompanion.app?subject=Question%20about%20Financial%20Companion">
            Ask us something else <Arrow />
          </a>
        </div>

        <div className="faq-list">
          <details>
            <summary><span>01</span>What exactly is Finli?<i aria-hidden="true" /></summary>
            <p>It is a calm money guide for young salaried Indians. It helps you understand spending, build financial safety, and explore your next step in plain language.</p>
          </details>
          <details>
            <summary><span>02</span>Does it give investment advice?<i aria-hidden="true" /></summary>
            <p>No. Finli provides education and context, not personalised investment recommendations. You stay in control of every financial decision.</p>
          </details>
          <details>
            <summary><span>03</span>Will you sell financial products?<i aria-hidden="true" /></summary>
            <p>No product pushing. The experience is designed around your goals and understanding—not commissions, sponsored rankings, or pressure to buy.</p>
          </details>
          <details>
            <summary><span>04</span>How is my financial information handled?<i aria-hidden="true" /></summary>
            <p>Important actions remain visible and require your confirmation. Clear consent, review, export, and deletion controls are part of the product foundation.</p>
          </details>
          <details>
            <summary><span>05</span>When can I try it?<i aria-hidden="true" /></summary>
            <p>We are preparing a private beta. Join the waitlist and we will invite small groups as the experience becomes ready for real-world feedback.</p>
          </details>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-glow" aria-hidden="true" />
        <div className="footer-main">
          <div className="footer-intro">
            <a className="brand footer-brand" href="#home" aria-label="Finli home"><FinliLogo footer /></a>
            <p className="footer-tagline">Clearer money decisions, one step at a time.</p>
          </div>

          <nav className="footer-links" aria-label="Footer navigation">
            <div>
              <p>Explore</p>
              <a href="#how">How it works</a>
              <a href="/about">About us</a>
            </div>
            <div>
              <p>Trust</p>
              <a href="#privacy">Privacy</a>
              <a href="mailto:beta@financialcompanion.app">Contact us</a>
            </div>
          </nav>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Finli</span>
          <span>Education only · Not financial advice</span>
          <BetaSignupTrigger className="footer-beta">Join the beta <Arrow /></BetaSignupTrigger>
        </div>
      </footer>
    </main>
  );
}
