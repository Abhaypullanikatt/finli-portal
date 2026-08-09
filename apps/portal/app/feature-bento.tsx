export function FeatureBento() {
  return (
    <section className="bento-section section-pad" id="more-features">
      <div className="bento-heading">
        <div>
          <p className="section-label">MORE OF THE COMPANION</p>
          <h2>Useful in the moments <em className="editorial-word">paydays.</em></h2>
        </div>
        <p>
          Real product experiences designed to turn everyday money questions
          into small, understandable actions.
        </p>
      </div>

      <div className="bento-grid">
        <article className="bento-card bento-today">
          <div className="bento-copy">
            <span className="bento-tag">LEARN &amp; EXPLORE</span>
            <h3>Learn without the product pitch.</h3>
            <p>Start with your question, then compare paths using your goal, time, and risk context.</p>
          </div>
          <div className="learn-screenshot-frame">
            <img
      src="/app-assets/learn-explore-screen-serif.png"
              alt="Actual Finli Learn and Explore mobile screen"
            />
          </div>
        </article>

        <article className="bento-card bento-voice">
          <div className="voice-orb" aria-hidden="true"><i /><i /><i /><i /><i /></div>
          <div className="bento-copy">
            <span className="bento-tag">VOICE ENTRY</span>
            <h3>Say it naturally.</h3>
            <p>“I spent ₹250 on lunch” becomes a proposal you can review before saving.</p>
          </div>
          <div className="proposal-chip"><span>Food</span><strong>₹250</strong><small>Ready to confirm</small></div>
        </article>

        <article className="bento-card bento-spending">
          <div className="bento-copy">
            <span className="bento-tag">SPENDING</span>
            <h3>A simple view of this month.</h3>
          </div>
          <div className="spending-preview" aria-label="Spending screen preview">
            <div><small>THIS MONTH</small><strong>₹28,400</strong><b>₹12,600 left</b></div>
            <div className="spending-track"><i /></div>
            <p><span>Food</span><b>₹6,240</b></p>
            <p><span>Transport</span><b>₹3,180</b></p>
            <p><span>Utilities</span><b>₹2,750</b></p>
          </div>
        </article>

        <article className="bento-card bento-learn">
          <div className="bento-copy">
            <span className="bento-tag">LEARN &amp; EXPLORE</span>
            <h3>Begin with the question you want answered.</h3>
            <p>Compare categories using your goal, time, and risk context—without rankings or product pushing.</p>
          </div>
          <div className="explorer-preview" aria-label="Investment Explorer screen preview">
            <div><span>⌁</span><strong>Deposits</strong><small>Lower variability</small></div>
            <div><span>▰</span><strong>Funds &amp; bonds</strong><small>Diversified routes</small></div>
            <div><span>↗</span><strong>Stocks</strong><small>Growth learning</small></div>
            <div><span>◇</span><strong>Real assets</strong><small>Gold &amp; property</small></div>
          </div>
        </article>

        <article className="bento-card bento-consent">
          <div className="consent-shield" aria-hidden="true">✓</div>
          <div className="bento-copy">
            <span className="bento-tag">MEANINGFUL CONSENT</span>
            <h3>Nothing is saved until you confirm.</h3>
            <p>Dictated text and unconfirmed proposals expire within 24 hours.</p>
          </div>
        </article>

        <article className="bento-card bento-controls">
          <div className="bento-copy">
            <span className="bento-tag">YOUR DATA</span>
            <h3>Clear controls, whenever you need them.</h3>
            <p>Review consent history, export your records, or delete your information without hunting through menus.</p>
          </div>
          <div className="control-list">
            <span>Consent history <b>↗</b></span>
            <span>Export my data <b>↓</b></span>
            <span>Delete my account <b>×</b></span>
          </div>
        </article>
      </div>
    </section>
  );
}
