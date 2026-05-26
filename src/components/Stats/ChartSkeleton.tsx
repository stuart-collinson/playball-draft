import type { JSX } from "react";
import { Skeleton } from "@pbd/components/ui/skeleton";

const Y_TICKS = [1, 2, 3, 4, 5, 6, 7, 8];
const X_TICKS = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 38];
const LINE_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

// Pre-baked wavy paths so the skeleton looks like a real chart, not random noise.
// Each path spans the inner plot area (x: 44 → 696, y: 12 → 308 in a 760x320 viewBox).
const LINE_PATHS = [
  "M 44 60  C 120 90, 200 40, 290 70  S 460 150, 560 110  S 660 180, 696 150",
  "M 44 110 C 130 70, 220 160, 300 130 S 470 80, 560 170  S 660 130, 696 200",
  "M 44 170 C 130 200, 230 110, 310 180 S 470 240, 570 200 S 660 250, 696 230",
  "M 44 220 C 140 180, 220 250, 320 210 S 480 290, 570 250 S 660 200, 696 260",
  "M 44 270 C 130 240, 220 290, 310 250 S 470 220, 570 280 S 660 290, 696 280",
  "M 44 90  C 140 130, 230 80,  320 110 S 470 60,  570 100 S 660 70,  696 90",
  "M 44 150 C 140 110, 230 200, 320 160 S 470 130, 570 180 S 660 160, 696 130",
  "M 44 200 C 140 230, 230 170, 320 220 S 470 180, 570 230 S 660 230, 696 190",
];

export const ChartSkeleton = (): JSX.Element => (
  <div className="flex flex-col gap-4">
    <div className="overflow-hidden rounded-2xl border border-border bg-card p-3 pr-1 sm:p-4 sm:pr-2">
      <div className="relative aspect-auto h-[320px] w-full sm:h-[380px]">
        <svg
          viewBox="0 0 760 320"
          preserveAspectRatio="none"
          className="h-full w-full"
          role="img"
          aria-label="Loading chart"
        >
          <title>Loading chart</title>
          {/* y gridlines */}
          {Y_TICKS.map((y, i) => {
            const yPos = 12 + (i / (Y_TICKS.length - 1)) * (308 - 12);
            return (
              <g key={`y-${y}`}>
                <line
                  x1={44}
                  x2={696}
                  y1={yPos}
                  y2={yPos}
                  stroke="oklch(28% 0.022 250)"
                  strokeWidth={0.6}
                  strokeDasharray="3 4"
                />
                <text
                  x={36}
                  y={yPos + 4}
                  textAnchor="end"
                  fontSize={11}
                  fontWeight={600}
                  fill="oklch(58% 0.015 250)"
                >
                  {y}
                </text>
              </g>
            );
          })}

          {/* x ticks */}
          {X_TICKS.map((x, i) => {
            const xPos = 44 + (i / (X_TICKS.length - 1)) * (696 - 44);
            return (
              <text
                key={`x-${x}`}
                x={xPos}
                y={319}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill="oklch(58% 0.015 250)"
              >
                {x}
              </text>
            );
          })}

          {/* pulsing line placeholders */}
          <g className="animate-pulse">
            {LINE_PATHS.map((d, i) => (
              <path
                key={LINE_KEYS[i]}
                d={d}
                fill="none"
                stroke="oklch(28% 0.022 250)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
        </svg>
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <Skeleton className="h-3 w-20" />
      <div className="flex flex-wrap gap-1.5">
        {LINE_KEYS.map((key) => (
          <Skeleton key={key} className="h-7 w-20 rounded-full" />
        ))}
      </div>
    </div>
  </div>
);
