import { useState } from 'react';
import { CheckCircle2, ChevronRight, ArrowRight, Footprints, Layers } from 'lucide-react';
import { CameraScan } from '@/components/CameraScan';
import { PlateScan } from '@/components/PlateScan';
import { SectionLabel } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/Button';

interface HybridScanStepProps {
  onComplete: () => void;
}

type HybridScanId = 'plate' | 'foot';

const SCAN_OPTIONS: { id: HybridScanId; label: string; desc: string; icon: typeof Layers }[] = [
  {
    id: 'plate',
    label: 'Andruckplatte',
    desc: 'Physikalische Referenz über die Abdruckplatte.',
    icon: Layers,
  },
  {
    id: 'foot',
    label: 'Fuß Scan',
    desc: 'Optische Erfassung deines Fußes.',
    icon: Footprints,
  },
];

export function HybridScanStep({ onComplete }: HybridScanStepProps) {
  const [active, setActive] = useState<HybridScanId | null>(null);
  const [done, setDone] = useState<Record<HybridScanId, boolean>>({ plate: false, foot: false });

  const finish = (id: HybridScanId) => {
    setDone((prev) => ({ ...prev, [id]: true }));
    setActive(null);
  };

  if (active === 'plate') return <PlateScan onComplete={() => finish('plate')} />;
  if (active === 'foot') {
    return <CameraScan scanType="fuss" completeLabel="Zurück zur Auswahl" accuracyOverride="90,85%" onComplete={() => finish('foot')} />;
  }

  const bothDone = done.plate && done.foot;

  return (
    <div className="flex-1 flex flex-col bg-base-off animate-fade-up">
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-5 space-y-5">
        <div>
          <SectionLabel>Hybrid Scan</SectionLabel>
          <h2 className="text-[22px] font-semibold tracking-tight text-carbon leading-tight">
            Scans auswählen
          </h2>
          <p className="text-[13px] text-technical mt-1 leading-relaxed">
            Erfasse beide Scans, um deine Schuhgeometrie zu berechnen.
          </p>
        </div>

        <div className="space-y-3">
          {SCAN_OPTIONS.map((option) => {
            const isDone = done[option.id];
            return (
              <button
                key={option.id}
                onClick={() => setActive(option.id)}
                className={`no-tap-highlight w-full text-left rounded-2xl border p-4 transition-all duration-200 active:scale-[0.99] ${
                  isDone
                    ? 'border-verified/40 bg-verified-bg'
                    : 'border-hairline bg-base-white hover:border-signal'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isDone ? 'bg-verified text-white' : 'bg-signal/10 text-signal'
                    }`}
                  >
                    <option.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-carbon">{option.label}</p>
                    <p className="text-[12px] text-technical leading-snug mt-0.5">
                      {isDone ? 'Scan abgeschlossen' : option.desc}
                    </p>
                  </div>
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-verified shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-technical shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-4 bg-gradient-to-t from-base-off via-base-off to-transparent">
        <PrimaryButton onClick={onComplete} disabled={!bothDone}>
          <span className="flex items-center justify-center gap-2">
            Schuhgeometrie berechnen
            <ArrowRight className="w-4 h-4" />
          </span>
        </PrimaryButton>
      </div>
    </div>
  );
}
