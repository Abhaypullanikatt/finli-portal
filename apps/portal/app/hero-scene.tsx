export function HeroScene() {
  return (
    <div className="hero-scene" aria-hidden="true">
      <video className="hero-video" autoPlay muted loop playsInline preload="metadata" poster="/hero-concepts/14-financial-garden-no-ribbons-v10.png">
        <source src="/finli-hero-preview.mp4" type="video/mp4" />
      </video>
      <div className="hero-vignette" />
    </div>
  );
}
