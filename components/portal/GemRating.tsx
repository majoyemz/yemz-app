"use client";

/**
 * GemRating — Displays the Yemz gem (◆) rating.
 * Uses the canonical SVG diamond polygon. Color: coral #E86C52.
 * NEVER use stars — this component enforces the gems system.
 */

interface GemRatingProps {
  /** Gem score 0–5, one decimal (e.g. 4.2) */
  score: number;
  /** Total number of ratings */
  count?: number;
  /** Size of each gem in pixels */
  size?: number;
  /** Whether to show the numeric score */
  showScore?: boolean;
}

function GemIcon({
  filled,
  partial = 0,
  size = 24,
}: {
  filled: boolean;
  partial?: number;
  size?: number;
}) {
  const gemId = `gem-clip-${Math.random().toString(36).slice(2)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {partial > 0 && partial < 1 ? (
        <>
          <defs>
            <clipPath id={gemId}>
              <rect x="0" y="0" width={24 * partial} height="24" />
            </clipPath>
          </defs>
          <polygon
            points="12,2 15.5,9 23,10 17.5,15.5 19,23 12,19.5 5,23 6.5,15.5 1,10 8.5,9"
            fill="#E8E8E8"
          />
          <polygon
            points="12,2 15.5,9 23,10 17.5,15.5 19,23 12,19.5 5,23 6.5,15.5 1,10 8.5,9"
            fill="#E86C52"
            clipPath={`url(#${gemId})`}
          />
        </>
      ) : (
        <polygon
          points="12,2 15.5,9 23,10 17.5,15.5 19,23 12,19.5 5,23 6.5,15.5 1,10 8.5,9"
          fill={filled ? "#E86C52" : "#E8E8E8"}
        />
      )}
    </svg>
  );
}

export default function GemRating({
  score,
  count,
  size = 20,
  showScore = true,
}: GemRatingProps) {
  // Under 5 ratings: show "New" pill instead
  if (count !== undefined && count < 5) {
    return (
      <span className="inline-flex items-center rounded-full bg-coral/10 px-2.5 py-0.5 text-xs font-medium text-coral">
        New
      </span>
    );
  }

  const fullGems = Math.floor(score);
  const partialFill = score - fullGems;
  const emptyGems = 5 - fullGems - (partialFill > 0 ? 1 : 0);

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: fullGems }, (_, i) => (
          <GemIcon key={`full-${i}`} filled size={size} />
        ))}
        {partialFill > 0 && (
          <GemIcon key="partial" filled={false} partial={partialFill} size={size} />
        )}
        {Array.from({ length: emptyGems }, (_, i) => (
          <GemIcon key={`empty-${i}`} filled={false} size={size} />
        ))}
      </div>
      {showScore && (
        <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {score.toFixed(1)}
          {count !== undefined && (
            <span className="text-gray-400"> · {count.toLocaleString()} ratings</span>
          )}
        </span>
      )}
    </div>
  );
}
