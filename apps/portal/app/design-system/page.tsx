import type { CSSProperties, ReactNode } from "react";
import { Alert, Badge, Button, Card, Field, IconButton, Progress } from "../components/ui";
import styles from "./design-system.module.css";

export const metadata = {
  title: "Design System — Finli",
  description: "Finli's production design tokens, components, patterns, and accessibility guidance.",
};

const Arrow = () => <span aria-hidden="true">↗</span>;

const navItems = [
  ["foundations", "Foundations"],
  ["logo", "Logo"],
  ["colour", "Colour"],
  ["type", "Typography"],
  ["space", "Space & shape"],
  ["actions", "Actions"],
  ["forms", "Forms"],
  ["feedback", "Feedback"],
  ["cards", "Cards & data"],
  ["patterns", "Patterns"],
  ["accessibility", "Accessibility"],
] as const;

const colours = [
  ["Forest 950", "#0C2923", "Inverse fields"],
  ["Forest 800", "#173F32", "Primary brand"],
  ["Forest 700", "#214B3B", "Supporting brand"],
  ["Lime 500", "#C9F36A", "Progress and action"],
  ["Sky 500", "#C9EDFB", "Clarity and context"],
  ["Peach 500", "#F2C8AC", "Human warmth"],
  ["Paper 500", "#F3F2EE", "Canvas"],
  ["Paper 100", "#FBFAF7", "Surface"],
  ["Ink 950", "#11110F", "Primary text"],
  ["Ink 500", "#6F706A", "Secondary text"],
] as const;

const spacing = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96] as const;

function Section({ id, eyebrow, title, intro, children }: { id: string; eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return (
    <section className={styles.section} id={id}>
      <div className={styles.sectionHead}>
        <p>{eyebrow}</p>
        <h2>{title}</h2>
        <span>{intro}</span>
      </div>
      {children}
    </section>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return <div className={styles.spec}><span>{label}</span><code>{value}</code></div>;
}

export default function DesignSystemPage() {
  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <a className={styles.logo} href="/" aria-label="Back to Finli home">
          <img src="/branding/finli-logo-primary-on-light.png" alt="Finli" />
        </a>
        <div className={styles.version}><span>Design system</span><b>v1.0</b></div>
        <nav aria-label="Design system sections">
          {navItems.map(([href, label], index) => <a href={`#${href}`} key={href}><span>{String(index + 1).padStart(2, "0")}</span>{label}</a>)}
        </nav>
        <div className={styles.sideNote}><i />One calm system<br />One clear next step</div>
      </aside>

      <div className={styles.content}>
        <header className={styles.hero} id="top">
          <div className={styles.heroMeta}><Badge tone="accent">Production ready</Badge><span>Web / August 2026</span></div>
          <h1>Calm by design.<br /><em>Clear</em> by default.</h1>
          <p>Finli’s shared visual language for trustworthy financial experiences—built to reduce noise, explain context, and guide one confident action at a time.</p>
          <div className={styles.heroActions}><a className={styles.heroPrimary} href="#actions">Explore components <Arrow /></a><a className={styles.heroSecondary} href="#foundations">View foundations</a></div>
          <div className={styles.heroPrinciples}>
            <div><span>01</span><strong>Explain first</strong><p>Context precedes action.</p></div>
            <div><span>02</span><strong>Calm the surface</strong><p>One visual priority at a time.</p></div>
            <div><span>03</span><strong>Respect control</strong><p>Make choices reversible.</p></div>
          </div>
        </header>

        <Section id="foundations" eyebrow="01 / Foundations" title="System before screens." intro="Tokens encode the decisions that should remain consistent across every Finli touchpoint. Components consume semantic tokens, never raw brand values.">
          <div className={styles.foundationGrid}>
            <Card tone="brand" className={styles.foundationCard}><span>Promise</span><h3>Make the next money decision easier to understand.</h3><p>Clear language, visible reasoning and calm actions.</p></Card>
            <Card className={styles.foundationCard}><span>Personality</span><h3>Calm, capable, human and transparent.</h3><p>Optimism without hype; expertise without theatre.</p></Card>
            <Card tone="accent" className={styles.foundationCard}><span>Core rule</span><h3>One clear move in every moment.</h3><p>Remove competition before adding emphasis.</p></Card>
          </div>
          <div className={styles.tokenAnatomy}>
            <div><span>Primitive</span><code>--finli-forest-800</code><small>What the value is</small></div>
            <i>→</i>
            <div><span>Semantic</span><code>--ds-bg-brand</code><small>What the value does</small></div>
            <i>→</i>
            <div><span>Component</span><code>Button / primary</code><small>Where the value appears</small></div>
          </div>
        </Section>

        <Section id="logo" eyebrow="02 / Logo" title="Visible on light. Reversed on dark." intro="The deep-forest lockup is the default website logo. Use the white reverse only on reliably dark fields; use the mark for square and compact surfaces.">
          <div className={styles.logoGrid}>
            <div className={styles.logoLight}><img src="/branding/finli-logo-primary-on-light.png" alt="Finli primary logo" /><span>Primary / light surface</span></div>
            <div className={styles.logoDark}><img src="/branding/finli-logo-reverse-on-dark.png" alt="Finli reverse logo" /><span>Reverse / dark surface</span></div>
          </div>
          <div className={styles.logoRules}>
            <Spec label="Desktop" value="min-width: 112px" />
            <Spec label="Mobile" value="min-width: 88px" />
            <Spec label="Mark" value="min-size: 24px" />
            <Spec label="Clear space" value="2 × i-dot" />
          </div>
        </Section>

        <Section id="colour" eyebrow="03 / Colour" title="Trust first. Growth second." intro="Forest anchors important decisions. Lime signals progress and the next action. Sky and peach add context and warmth; paper creates room to think.">
          <div className={styles.swatchGrid}>
            {colours.map(([name, value, use]) => <div className={styles.swatch} key={name}><i style={{ "--swatch": value } as CSSProperties} /><strong>{name}</strong><code>{value}</code><span>{use}</span></div>)}
          </div>
          <div className={styles.semanticRow}>
            <div><Badge tone="brand">Brand</Badge><span>Primary decisions</span></div>
            <div><Badge tone="accent">Accent</Badge><span>Progress and focus</span></div>
            <div><Badge tone="success">Success</Badge><span>Completed outcomes</span></div>
            <div><Badge tone="warning">Review</Badge><span>Needs attention</span></div>
            <div><Badge tone="danger">Critical</Badge><span>Immediate risk only</span></div>
          </div>
        </Section>

        <Section id="type" eyebrow="04 / Typography" title="Soft geometry. Precise hierarchy." intro="Finli Display carries the interface; Finli Editorial adds a human note to high-level storytelling. Short line lengths and generous leading make financial language easier to absorb.">
          <div className={styles.typeSamples}>
            <div className={styles.displaySample}><span>Display / 64–104</span><p>Money clarity</p></div>
            <div className={styles.editorialSample}><span>Editorial / emphasis</span><p>without the <em>jargon.</em></p></div>
            <div className={styles.headingSample}><span>Heading / 32–56</span><p>Your next clear step.</p></div>
            <div className={styles.bodySample}><span>Body / 16</span><p>Use plain language to explain what changed, why it matters, and what the user can do next. Keep paragraphs under 70 characters per line.</p></div>
            <div className={styles.labelSample}><span>Label / 11</span><p>READY TO REVIEW</p></div>
          </div>
          <div className={styles.typeRules}><Spec label="Display" value="-0.045em / 1.02" /><Spec label="Heading" value="-0.035em / 1.12" /><Spec label="Body" value="0 / 1.60" /><Spec label="Label" value="0.12em / 1.20" /></div>
        </Section>

        <Section id="space" eyebrow="05 / Space & shape" title="A 4px rhythm with soft edges." intro="Spacing grows in deliberate steps. Rounded surfaces create calm containers; hierarchy comes from space and colour before shadow.">
          <div className={styles.spaceScale}>
            {spacing.map(value => <div key={value}><span>{value}</span><i style={{ width: `${Math.max(value, 4)}px` }} /><code>space-{value / 4}</code></div>)}
          </div>
          <div className={styles.shapeGrid}>
            {[8, 12, 16, 24, 32, 999].map((radius, index) => <div key={radius}><i style={{ borderRadius: `${radius}px` }} /><strong>{index === 5 ? "Pill" : `${radius}px`}</strong><span>{["Small control", "Input", "Card", "Feature", "Modal", "Action"][index]}</span></div>)}
          </div>
          <div className={styles.shadowGrid}><div className={styles.shadowXs}>XS</div><div className={styles.shadowSm}>SM</div><div className={styles.shadowMd}>MD</div><div className={styles.shadowLg}>LG</div></div>
        </Section>

        <Section id="actions" eyebrow="06 / Actions" title="One action should win." intro="Primary buttons complete the main task. Accent buttons spotlight growth moments. Secondary and ghost actions reduce competition; destructive actions remain rare and explicit.">
          <div className={styles.componentStage}>
            <div className={styles.buttonRow}><Button trailing={<Arrow />}>Primary action</Button><Button variant="accent" trailing={<Arrow />}>Growth action</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Quiet action</Button><Button variant="danger">Delete</Button></div>
            <div className={styles.buttonRow}><Button size="sm">Small</Button><Button>Medium</Button><Button size="lg">Large</Button><Button disabled>Disabled</Button><IconButton label="Add item">＋</IconButton></div>
          </div>
          <div className={styles.usageGrid}><div><b>Do</b><p>Use a specific verb: “See your roadmap”.</p></div><div><b>Do</b><p>Keep one primary action per region.</p></div><div className={styles.avoid}><b>Avoid</b><p>Vague labels such as “Submit” or “Okay”.</p></div></div>
        </Section>

        <Section id="forms" eyebrow="07 / Forms" title="Ask only what helps." intro="Every field has a visible label, helpful context and a clear recovery path. Validation should explain how to fix the issue without blaming the user.">
          <div className={styles.formStage}>
            <Field label="Monthly income" placeholder="₹ 75,000" hint="Use your typical take-home amount." inputMode="numeric" />
            <Field label="Email address" placeholder="you@example.com" type="email" />
            <Field label="Goal amount" defaultValue="₹ 2,50,000" error="Enter an amount below ₹ 2,00,000 for this plan." />
            <label className={styles.selectField}><span>Primary goal</span><select defaultValue="buffer"><option value="buffer">Build a safety fund</option><option value="debt">Reduce debt</option><option value="invest">Start investing</option></select><small>Choose the outcome that matters first.</small></label>
          </div>
          <div className={styles.formActions}><Button variant="secondary">Back</Button><Button trailing={<Arrow />}>Continue</Button></div>
        </Section>

        <Section id="feedback" eyebrow="08 / Feedback" title="Specific, calm and recoverable." intro="Feedback describes what happened, what it changes, and what comes next. Colour reinforces meaning but is never the only signal.">
          <div className={styles.alertGrid}>
            <Alert tone="info" title="Plan updated">Your new amount will appear in the next monthly view.</Alert>
            <Alert tone="success" title="Safety fund complete">You have reached the target you set.</Alert>
            <Alert tone="warning" title="Ready to review">Shopping is above the target you chose.</Alert>
            <Alert tone="danger" title="Payment needs attention">The transfer did not complete. Your balance is unchanged.</Alert>
          </div>
          <div className={styles.badgeRow}><Badge>Draft</Badge><Badge tone="brand">In progress</Badge><Badge tone="success">On track</Badge><Badge tone="warning">Review</Badge><Badge tone="danger">Action needed</Badge><Badge tone="info">New insight</Badge></div>
        </Section>

        <Section id="cards" eyebrow="09 / Cards & data" title="Show the signal, then explain it." intro="Data components pair a number with a label, timeframe and plain-language interpretation. Avoid chart decoration that competes with meaning.">
          <div className={styles.dataGrid}>
            <Card tone="brand" className={styles.metricCard}><Badge tone="accent">Next priority</Badge><span>Build your buffer</span><strong>68%</strong><Progress value={68} label="3-month safety fund" /><p>₹34,000 of ₹50,000 set aside.</p></Card>
            <Card tone="raised" className={styles.metricCard}><Badge tone="success">On track</Badge><span>Monthly needs</span><strong>₹21,400</strong><div className={styles.sparkBars}>{[42, 55, 47, 64, 71, 66, 78, 72, 84, 76, 88, 92].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div><p>4% lower than your three-month average.</p></Card>
            <Card tone="accent" className={styles.insightCard}><span>Why this appeared</span><h3>Your buffer makes the next move safer.</h3><p>Finli prioritizes stability before increasing investment risk.</p><Button variant="primary" trailing={<Arrow />}>See the reasoning</Button></Card>
          </div>
        </Section>

        <Section id="patterns" eyebrow="10 / Patterns" title="Repeatable decisions, not rigid screens." intro="Patterns combine components around a user intention. The order stays consistent: context, meaning, action, reassurance.">
          <div className={styles.patternFlow}>
            <div><span>1</span><strong>Context</strong><p>What Finli noticed</p></div><i>→</i><div><span>2</span><strong>Meaning</strong><p>Why it matters now</p></div><i>→</i><div><span>3</span><strong>Action</strong><p>One clear next step</p></div><i>→</i><div><span>4</span><strong>Control</strong><p>Confirm or revisit</p></div>
          </div>
          <div className={styles.patternCards}>
            <Card><Badge tone="info">Insight</Badge><h3>Your spending pattern changed.</h3><p>Transport is 18% higher than your recent average.</p><Button variant="secondary">See what changed</Button></Card>
            <Card><Badge tone="warning">Decision</Badge><h3>Review before it counts.</h3><p>Finli heard “₹1,200 for electricity”. Is that right?</p><div><Button variant="secondary">Edit</Button><Button>Confirm</Button></div></Card>
            <Card><Badge tone="success">Completion</Badge><h3>You made a clear move.</h3><p>Your updated target is saved and reflected in the plan.</p><Button variant="ghost">Return to overview</Button></Card>
          </div>
        </Section>

        <Section id="accessibility" eyebrow="11 / Accessibility" title="Calm is also clear." intro="The system targets WCAG 2.2 AA, supports keyboard and assistive technology, respects reduced motion, and never relies on colour alone.">
          <div className={styles.a11yGrid}>
            <div><span>AA</span><h3>Contrast</h3><p>Forest and ink carry readable text. Lime is decorative or paired with forest.</p></div>
            <div><span>44</span><h3>Touch target</h3><p>Interactive controls are at least 44 × 44 CSS pixels.</p></div>
            <div><span>⌨</span><h3>Keyboard</h3><p>Visible focus rings and logical source order are mandatory.</p></div>
            <div><span>◐</span><h3>Motion</h3><p>Reduced-motion preferences collapse decorative transitions.</p></div>
            <div><span>Aa</span><h3>Language</h3><p>Short sentences, defined terms and actionable errors.</p></div>
            <div><span>↶</span><h3>Control</h3><p>Important financial actions are confirmable and reversible.</p></div>
          </div>
          <div className={styles.checklist}><strong>Release checklist</strong><ul><li>Zoom to 200% without loss of content</li><li>Navigate every control by keyboard</li><li>Announce errors and status changes</li><li>Label charts with values and words</li><li>Test 320px through wide desktop</li><li>Keep education distinct from advice</li></ul></div>
        </Section>

        <footer className={styles.footer}>
          <img src="/branding/finli-logo-reverse-on-dark.png" alt="Finli" />
          <p>Understand money. Make better moves.</p>
          <div><span>Design system v1.0</span><a href="#top">Back to top ↑</a></div>
        </footer>
      </div>
    </main>
  );
}
