import { useEffect, useState } from 'react';
import { ArrowRight, Check, CheckCircle2, CircleDashed, Loader2 } from 'lucide-react';
import { ThreeFootViewer } from '@/components/ThreeFootViewer';
import { STLViewer } from '@/components/STLViewer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MetricCard } from '@/components/MetricCard';
import { Card, SectionLabel } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/Button';
import type { AppState } from '@/types';

interface HybridResultStepProps {
  state: AppState;
  onNext: () => void;
}

const CALC_STEPS = [
  'Fuß-Scan prüfen',
  'Andruckplatte prüfen',
  'Schuhgeometrie aus beiden Scans berechnen',
  'Qualität verifizieren',
];
const STEP_DURATION_MS = 900;

export function HybridResultStep({ state, onNext }: HybridResultStepProps) {
  const [completed, setCompleted] = useState(0);
  const [calculating, setCalculating] = useState(true);
  const m = state.metrics;

  useEffect(() => {
    const timers = CALC_STEPS.map((_, i) =>
      setTimeout(() => setCompleted(i + 1), (i + 1) * STEP_DURATION_MS),
    );
    timers.push(setTimeout(() => setCalculating(false), (CALC_STEPS.length + 1) * STEP_DURATION_MS));
    return () => timers.forEach(clearTimeout);
  }, []);

  if (calculating) {
    const progress = (completed / CALC_STEPS.length) * 100;
    return (
      <div className="flex-1 flex flex-col bg-base-off animate-fade-up">
        <div className="flex-1 px-5 py-5 space-y-5">
          <div>
            <SectionLabel>Hybrid Ergebnis</SectionLabel>
            <h2 className="text-[22px] font-semibold tracking-tight text-carbon leading-tight">
              Geometrie wird berechnet
            </h2>
            <p className="text-[13px] text-technical mt-1 leading-relaxed">
              Beide Scans werden abgeglichen und zu einer präzisen Schuhgeometrie verrechnet.
            </p>
          </div>

          <Card>
            <div className="h-1 rounded-full bg-hairline overflow-hidden mb-5">
              <div
                className="h-full rounded-full bg-signal transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="space-y-3">
              {CALC_STEPS.map((label, i) => {
                const isDone = i < completed;
                const isActive = i === completed;
                return (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      {isDone ? (
                        <Check className="w-4 h-4 text-verified" strokeWidth={2.5} />
                      ) : isActive ? (
                        <Loader2 className="w-4 h-4 text-signal animate-spin" />
                      ) : (
                        <CircleDashed className="w-4 h-4 text-technical" />
                      )}
                    </div>
                    <span
                      className={`text-[13px] leading-snug ${
                        isDone ? 'text-carbon font-medium' : isActive ? 'text-carbon' : 'text-technical'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-base-off animate-fade-up">
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-5 space-y-5">
        <div>
          <SectionLabel>Hybrid Ergebnis</SectionLabel>
          <h2 className="text-[22px] font-semibold tracking-tight text-carbon leading-tight">
            Schuhgeometrie berechnet
          </h2>
        </div>

        <Card padding="sm" className="bg-base-white">
          <div className="h-52 -m-1 rounded-xl overflow-hidden bg-gradient-to-b from-base-off to-base-white">
            <ErrorBoundary fallback={<ThreeFootViewer className="w-full h-full" />}>
              <STLViewer url="/models/feet.OBJ" color="#9CA3AF" scale={0.5} className="w-full h-full" />
            </ErrorBoundary>
          </div>
        </Card>

        <div>
          <SectionLabel>Präzisionsdaten</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Fußlänge" value={String(m.lengthMm)} unit="mm" />
            <MetricCard label="Vorfußbreite" value={String(m.forefootWidthMm)} unit="mm" />
            <MetricCard label="Risthöhe" value={String(m.instepHeightMm)} unit="mm" />
            <MetricCard label="Toleranzfenster" value={String(m.toleranceMm)} unit="mm" badge />
          </div>
        </div>

        <Card className="bg-verified-bg border-verified/30">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-verified shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-carbon">Qualität: Hervorragend</p>
              <p className="text-[12px] text-carbon/70 mt-1 leading-relaxed">
                Beide Scans stimmen überein (Delta: +{m.deltaMm.toFixed(1)} mm).
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-5 py-4 bg-gradient-to-t from-base-off via-base-off to-transparent">
        <PrimaryButton onClick={onNext}>
          <span className="flex items-center justify-center gap-2">
            Weiter zur Schuhauswahl
            <ArrowRight className="w-4 h-4" />
          </span>
        </PrimaryButton>
      </div>
    </div>
  );
}
