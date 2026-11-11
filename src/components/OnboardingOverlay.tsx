import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { X, ChevronRight } from 'lucide-react';
import type { OnboardingHighlight } from '@/lib/onboardingDefinitions';

interface OnboardingOverlayProps {
  highlights: OnboardingHighlight[];
  onComplete: () => void;
  onSkip: () => void;
}

interface Rect { top: number; left: number; width: number; height: number; }

const HIGHLIGHT_PADDING = 8;

export function OnboardingOverlay({ highlights, onComplete, onSkip }: OnboardingOverlayProps) {
  const [index, setIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [containerRect, setContainerRect] = useState<Rect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = highlights[index];

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const cR = containerRef.current.getBoundingClientRect();
    setContainerRect({ top: cR.top, left: cR.left, width: cR.width, height: cR.height });

    const el = document.querySelector<HTMLElement>(current.selector);
    if (!el) {
      setTargetRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setTargetRect({
      top: r.top - cR.top,
      left: r.left - cR.left,
      width: r.width,
      height: r.height,
    });
  }, [current.selector]);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [measure, index]);

  const next = () => {
    if (index < highlights.length - 1) {
      setIndex(index + 1);
    } else {
      onComplete();
    }
  };

  // Compute arrow path from tooltip to target
  const arrow = computeArrow(targetRect, containerRect);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[60] pointer-events-auto"
      role="dialog"
      aria-label="Einführung"
    >
      {/* Dimmed backdrop with cut-out */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          <mask id="onboarding-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - HIGHLIGHT_PADDING}
                y={targetRect.top - HIGHLIGHT_PADDING}
                width={targetRect.width + HIGHLIGHT_PADDING * 2}
                height={targetRect.height + HIGHLIGHT_PADDING * 2}
                rx={12}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.55)"
          mask="url(#onboarding-mask)"
        />
        {targetRect && (
          <rect
            x={targetRect.left - HIGHLIGHT_PADDING}
            y={targetRect.top - HIGHLIGHT_PADDING}
            width={targetRect.width + HIGHLIGHT_PADDING * 2}
            height={targetRect.height + HIGHLIGHT_PADDING * 2}
            rx={12}
            fill="none"
            stroke="#EA580C"
            strokeWidth="2"
            strokeDasharray="6 4"
            className="animate-mesh-pulse"
          />
        )}
        {/* Curved arrow */}
        {arrow && (
          <path
            d={arrow.path}
            fill="none"
            stroke="#EA580C"
            strokeWidth="2.5"
            strokeLinecap="round"
            markerEnd="url(#arrow-head)"
          />
        )}
        <defs>
          <marker
            id="arrow-head"
            markerWidth="10"
            markerHeight="10"
            refX="7"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L7,3 L0,6 Z" fill="#EA580C" />
          </marker>
        </defs>
      </svg>

      {/* Tooltip card */}
      {targetRect && arrow && (
        <div
          className="absolute z-[61] animate-fade-up"
          style={arrow.tooltipStyle}
        >
          <div className="bg-base-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] px-5 py-4 max-w-[260px]">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-[15px] font-semibold tracking-tight text-carbon">
                {current.title}
              </h3>
              <button
                onClick={onSkip}
                aria-label="Überspringen"
                className="no-tap-highlight -mt-1 -mr-1 w-6 h-6 rounded-full flex items-center justify-center text-technical hover:text-carbon transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[12px] text-technical leading-relaxed">
              {current.description}
            </p>
            <div className="flex items-center justify-between mt-4">
              <span className="font-mono-tight text-[10px] text-technical">
                {index + 1} / {highlights.length}
              </span>
              <button
                onClick={next}
                className="no-tap-highlight flex items-center gap-1.5 rounded-full bg-signal px-3.5 py-2 text-[12px] font-semibold text-base-white transition-all active:scale-95"
              >
                {index < highlights.length - 1 ? 'Weiter' : 'Fertig'}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fallback tooltip when target not found */}
      {!targetRect && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[61] animate-fade-up">
          <div className="bg-base-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] px-5 py-4 max-w-[280px]">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-[15px] font-semibold tracking-tight text-carbon">
                {current.title}
              </h3>
              <button
                onClick={onSkip}
                aria-label="Überspringen"
                className="no-tap-highlight -mt-1 -mr-1 w-6 h-6 rounded-full flex items-center justify-center text-technical hover:text-carbon transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[12px] text-technical leading-relaxed">
              {current.description}
            </p>
            <div className="flex items-center justify-between mt-4">
              <span className="font-mono-tight text-[10px] text-technical">
                {index + 1} / {highlights.length}
              </span>
              <button
                onClick={next}
                className="no-tap-highlight flex items-center gap-1.5 rounded-full bg-signal px-3.5 py-2 text-[12px] font-semibold text-base-white transition-all active:scale-95"
              >
                {index < highlights.length - 1 ? 'Weiter' : 'Fertig'}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ArrowResult {
  path: string;
  tooltipStyle: CSSProperties;
}

function computeArrow(target: Rect | null, container: Rect | null): ArrowResult | null {
  if (!target || !container) return null;

  const targetCenterX = target.left + target.width / 2;
  const targetCenterY = target.top + target.height / 2;
  const targetRight = target.left + target.width + HIGHLIGHT_PADDING;
  const targetLeft = target.left - HIGHLIGHT_PADDING;
  const targetTop = target.top - HIGHLIGHT_PADDING;
  const targetBottom = target.top + target.height + HIGHLIGHT_PADDING;

  // Decide tooltip placement: prefer right side, then left, then bottom, then top
  const tooltipWidth = 260;
  const tooltipHeight = 140;
  const margin = 16;

  let tooltipLeft: number;
  let tooltipTop: number;
  let arrowStartX: number;
  let arrowStartY: number;
  let arrowEndX: number;
  let arrowEndY: number;

  if (targetRight + tooltipWidth + margin < container.width) {
    // Place tooltip to the right
    tooltipLeft = targetRight + margin;
    tooltipTop = Math.max(margin, Math.min(targetCenterY - tooltipHeight / 2, container.height - tooltipHeight - margin));
    arrowEndX = targetRight;
    arrowEndY = targetCenterY;
    arrowStartX = tooltipLeft;
    arrowStartY = tooltipTop + tooltipHeight / 2;
  } else if (targetLeft - tooltipWidth - margin > 0) {
    // Place tooltip to the left
    tooltipLeft = targetLeft - tooltipWidth - margin;
    tooltipTop = Math.max(margin, Math.min(targetCenterY - tooltipHeight / 2, container.height - tooltipHeight - margin));
    arrowEndX = targetLeft;
    arrowEndY = targetCenterY;
    arrowStartX = tooltipLeft + tooltipWidth;
    arrowStartY = tooltipTop + tooltipHeight / 2;
  } else if (targetBottom + tooltipHeight + margin < container.height) {
    // Place tooltip below
    tooltipLeft = Math.max(margin, Math.min(targetCenterX - tooltipWidth / 2, container.width - tooltipWidth - margin));
    tooltipTop = targetBottom + margin;
    arrowEndX = targetCenterX;
    arrowEndY = targetBottom;
    arrowStartX = tooltipLeft + tooltipWidth / 2;
    arrowStartY = tooltipTop;
  } else {
    // Place tooltip above
    tooltipLeft = Math.max(margin, Math.min(targetCenterX - tooltipWidth / 2, container.width - tooltipWidth - margin));
    tooltipTop = Math.max(margin, targetTop - tooltipHeight - margin);
    arrowEndX = targetCenterX;
    arrowEndY = targetTop;
    arrowStartX = tooltipLeft + tooltipWidth / 2;
    arrowStartY = tooltipTop + tooltipHeight;
  }

  // Build a curved path (quadratic bezier)
  const ctrlX = (arrowStartX + arrowEndX) / 2 + (arrowEndY === arrowStartY ? 0 : (arrowEndX > arrowStartX ? -20 : 20));
  const ctrlY = (arrowStartY + arrowEndY) / 2 + (arrowEndX === arrowStartX ? 0 : (arrowEndY > arrowStartY ? -20 : 20));

  const path = `M ${arrowStartX} ${arrowStartY} Q ${ctrlX} ${ctrlY} ${arrowEndX} ${arrowEndY}`;

  return {
    path,
    tooltipStyle: {
      left: `${tooltipLeft}px`,
      top: `${tooltipTop}px`,
      width: `${tooltipWidth}px`,
    },
  };
}
