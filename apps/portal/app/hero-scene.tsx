import { RibbonWave } from "./ribbon-wave";

export function HeroScene() {
  return (
    <div className="hero-scene" aria-hidden="true">
      <div className="hero-image" />
      <div className="hero-beacon" />
      <RibbonWave />
      <div className="hero-breeze">
        <i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
      </div>
      <div className="hero-vignette" />
    </div>
  );
}
