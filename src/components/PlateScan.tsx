import { useEffect, useState, type CSSProperties } from 'react';
import { ScanResultPanel } from '@/components/ScanResultPanel';
import { ProgressRing } from '@/components/ui/ProgressRing';

interface PlateScanProps {
  onComplete: () => void;
}

type Stage = 'black' | 'plate' | 'wire' | 'scan' | 'result';

const STAGE_ORDER: Stage[] = ['black', 'plate', 'wire', 'scan', 'result'];
const STAGE_DURATION_MS: Record<Stage, number> = {
  black: 800,
  plate: 1800,
  wire: 1800,
  scan: 1800,
  result: 0,
};
const STAGE_PROGRESS: Record<Stage, number> = {
  black: 0,
  plate: 33,
  wire: 66,
  scan: 100,
  result: 100,
};
const FADE_MS = 1200;

function layerStyle(visible: boolean): CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transition: `opacity ${FADE_MS}ms ease-in-out`,
  };
}

export function PlateScan({ onComplete }: PlateScanProps) {
  const [stage, setStage] = useState<Stage>('black');

  useEffect(() => {
    if (stage === 'result') return;
    const nextStage = STAGE_ORDER[STAGE_ORDER.indexOf(stage) + 1];
    const timer = setTimeout(() => setStage(nextStage), STAGE_DURATION_MS[stage]);
    return () => clearTimeout(timer);
  }, [stage]);

  return (
    <div className="flex-1 flex flex-col bg-black relative overflow-hidden">
      <img
        src="/images/Abdruckplatte.png"
        alt="Andruckplatte"
        className="absolute inset-0 z-10 w-full h-full object-contain"
        style={layerStyle(stage === 'plate')}
      />
      <img
        src="/images/Abdruckplatte-wire.png"
        alt="Andruckplatte als Wireframe"
        className="absolute inset-0 z-10 w-full h-full object-contain"
        style={layerStyle(stage === 'wire')}
      />
      <img
        src="/images/Abdruckplatte-Scan.png"
        alt="Gescannte Andruckplatte"
        className="absolute inset-0 z-10 w-full h-full object-contain"
        style={layerStyle(stage === 'scan' || stage === 'result')}
      />

      {stage === 'result' ? (
        <ScanResultPanel
          imageSrc="/images/Abdruckplatte-Scan.png"
          imageAlt="Gescannte Andruckplatte"
          title="Andruckplatte erfasst"
          description="Die Andruckplatte wurde vollständig erfasst. Die physikalischen Referenzwerte stehen für den Abgleich bereit."
          badges={[
            { label: 'REFERENZPUNKTE: 412' },
            { label: 'GENAUIGKEIT: 99,6%', verified: true },
          ]}
          buttonLabel="Zurück zur Auswahl"
          onComplete={onComplete}
        />
      ) : (
        <>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
            <ProgressRing progress={STAGE_PROGRESS[stage]} />
          </div>
          <div className="absolute bottom-8 right-4 z-30">
            <p className="font-mono-tight text-[10px] text-white/70">{`${STAGE_PROGRESS[stage]}%`}</p>
          </div>
        </>
      )}
    </div>
  );
}
