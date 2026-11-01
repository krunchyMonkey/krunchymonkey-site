import { BitButton } from "../../../vendor/8bitcn/Button";
import {
  BitCard, BitCardContent, BitCardDescription, BitCardHeader, BitCardTitle,
} from "../../../vendor/8bitcn/Card";

export function PixelOpenBench() {
  return (
    <div className="pixel-bench">
      <div className="pixel-app-toolbar">
        <strong>✦ OPEN BENCH</strong>
        <span>PREVIEW</span>
      </div>
      <div className="pixel-bench-content">
        <div className="pixel-bench-intro">
          <span className="pixel-bench-emblem" aria-hidden="true">✦</span>
          <div>
            <h2>Pull up a chair.</h2>
            <p>A workshop for curious builders and thoughtful code.</p>
          </div>
        </div>
        <BitCard font="normal" className="pixel-bench-card">
          <BitCardHeader>
            <BitCardTitle>THE TOOLS CHANGE.</BitCardTitle>
            <BitCardDescription>THE CRAFT REMAINS.</BitCardDescription>
          </BitCardHeader>
          <BitCardContent>
            <p>Explore public projects, architecture decisions and the work behind them.</p>
            <BitButton asChild font="normal" className="pixel-bench-action">
              <a
                href="https://github.com/krunchyMonkey/krunchymonkey-site"
                target="_blank"
                rel="noopener noreferrer"
              >
                VIEW SOURCE ↗
              </a>
            </BitButton>
          </BitCardContent>
        </BitCard>
        <p className="pixel-bench-note">COMMUNITY CONTRIBUTIONS PLANNED FOR v1.1</p>
      </div>
    </div>
  );
}
