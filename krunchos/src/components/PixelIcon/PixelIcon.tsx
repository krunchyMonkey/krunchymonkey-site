import { pixelIconNames, pixelIcons, type PixelIconName } from "./icons";

function toPath(rows: readonly string[]): string {
  const parts: string[] = [];
  rows.forEach((row, y) => {
    for (const run of row.matchAll(/#+/g)) {
      const w = run[0].length;
      parts.push("M" + run.index + " " + y + "h" + w + "v1h-" + w + "z");
    }
  });
  return parts.join("");
}

const paths = Object.fromEntries(pixelIconNames.map((name) => [name, toPath(pixelIcons[name])]));

interface PixelIconProps {
  readonly name: PixelIconName;
  readonly className?: string;
}

/** Decorative 16px pixel icon; inherits colour and scales with font-size. */
export function PixelIcon({ name, className }: PixelIconProps) {
  return (
    <svg
      className={className ? "pixel-icon " + className : "pixel-icon"}
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      data-icon={name}
    >
      <path d={paths[name]} />
    </svg>
  );
}
