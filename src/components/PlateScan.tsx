import { useEffect, useRef, useState } from 'react';
import { ScanResultPanel } from '@/components/ScanResultPanel';
import { ProgressRing } from '@/components/ui/ProgressRing';

interface PlateScanProps {
  onComplete: () => void;
}

const SCAN_TOP = 0;
const SCAN_BOTTOM = 100;
const SCAN_RANGE = SCAN_BOTTOM - SCAN_TOP;
const PHASE_DURATION = 5; // seconds per phase — slower than foot/sole scan

type Phase = 'down1' | 'up1' | 'down2' | 'up2';

const PHASE_ORDER: Phase[] = ['down1', 'up1', 'down2', 'up2'];

const LAYERS = {
  plate: '/images/Abdruckplatte.png',
  wire: '/images/Abdruckplatte-wire.png',
  scan: '/images/Abdruckplatte-Scan.png',
};

export function PlateScan({ onComplete }: PlateScanProps) {
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const [phase, setPhase] = useState<Phase>('down1');
  const [phaseTime, setPhaseTime] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    startTimeRef.current = performance.now();

    function tick() {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const t = Math.min(PHASE_DURATION, elapsed);
      setPhaseTime(t);

      if (elapsed >= PHASE_DURATION) {
        const idx = PHASE_ORDER.indexOf(phase);
        if (idx < PHASE_ORDER.length - 1) {
          setPhase(PHASE_ORDER[idx + 1]);
          startTimeRef.current = performance.now();
        } else {
          setDone(true);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, done]);

  const p = (phaseTime / PHASE_DURATION) * 100;

  // Line position: down = 0→100, up = 100→0
  const goingDown = phase === 'down1' || phase === 'down2';
  const lineAbs = goingDown ? SCAN_TOP + (p / 100) * SCAN_RANGE : SCAN_BOTTOM - (p / 100) * SCAN_RANGE;

  // Clip reveals — each layer is revealed by the line during its phase
  // down1: black only, line scans down on black
  // up1: plate revealed from bottom up as line goes up
  // down2: wire revealed from top down as line goes down (over plate)
  // up2: scan revealed from bottom up as line goes up (over wire)

  let plateClipTop = 100;
  let plateClipBottom = 0;
  let wireClipTop = 100;
  let wireClipBottom = 0;
  let scanClipTop = 100;
  let scanClipBottom = 0;

  if (phase === 'down1') {
    // black background, no layers visible
  } else if (phase === 'up1' || (done && phase === 'up2' && false)) {
    // plate revealed from bottom up: line at lineAbs, plate shows below line
    plateClipTop = lineAbs;
    plateClipBottom = 0;
  } else if (phase === 'down2') {
    // plate fully visible, wire revealed from top down: line at lineAbs, wire shows above line
    plateClipTop = 0; plateClipBottom = 0;
    wireClipTop = 0; wireClipBottom = 100 - lineAbs;
  } else if (phase === 'up2') {
    // wire fully visible, scan revealed from bottom up: line at lineAbs, scan shows below line
    plateClipTop = 0; plateClipBottom = 0;
    wireClipTop = 0; wireClipBottom = 0;
    scanClipTop = lineAbs; scanClipBottom = 0;
  }

  // When done, show scan fully
  if (done) {
    plateClipTop = 0; plateClipBottom = 0;
    wireClipTop = 0; wireClipBottom = 0;
    scanClipTop = 0; scanClipBottom = 0;
  }

  // For up1 phase: after line reaches top, plate is fully visible
  // Actually let me reconsider: during up1, plate should be revealed as line goes up.
  // Line starts at 100 (bottom) and goes to 0 (top).
  // Plate shows BELOW the line (from lineAbs to bottom).
  // At start (lineAbs=100): nothing visible. At end (lineAbs=0): fully visible.
  // plateClipTop = lineAbs, plateClipBottom = 0. That's correct.

  // For down2: wire revealed from top down.
  // Line starts at 0 (top) and goes to 100 (bottom).
  // Wire shows ABOVE the line (from 0 to lineAbs).
  // wireClipTop = 0, wireClipBottom = 100 - lineAbs. Correct.

  // For up2: scan revealed from bottom up.
  // Line starts at 100 (bottom) and goes to 0 (top).
  // Scan shows BELOW the line (from lineAbs to bottom).
  // scanClipTop = lineAbs, scanClipBottom = 0. Correct.

  const overallProgress = done
    ? 100
    : (PHASE_ORDER.indexOf(phase) * 100 + p) / (PHASE_ORDER.length * 100) * 100;

  return (
    <div className="flex-1 flex flex-col bg-black relative overflow-hidden">
      {/* Plate layer — revealed during up1 */}
      <img
        src={LAYERS.plate}
        alt="Andruckplatte"
        className="absolute inset-0 z-10 w-full h-full object-contain"
        style={{
          clipPath: `inset(${plateClipTop}% 0 ${plateClipBottom}% 0)`,
          opacity: phase === 'down1' ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Wire layer — revealed during down2 */}
      <img
        src={LAYERS.wire}
        alt="Andruckplatte als Wireframe"
        className="absolute inset-0 z-10 w-full h-full object-contain"
        style={{
          clipPath: `inset(${wireClipTop}% 0 ${wireClipBottom}% 0)`,
          opacity: phase === 'down1' || phase === 'up1' ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Scan layer — revealed during up2 */}
      <img
        src={LAYERS.scan}
        alt="Gescannte Andruckplatte"
        className="absolute inset-0 z-10 w-full h-full object-contain"
        style={{
          clipPath: `inset(${scanClipTop}% 0 ${scanClipBottom}% 0)`,
          opacity: phase === 'down1' || phase === 'up1' || phase === 'down2' ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Scan line */}
      {!done && (
        <div
          className="absolute left-0 right-0 z-20 pointer-events-none"
          style={{ top: `${lineAbs}%` }}
        >
          <div className="h-[2px] bg-signal" />
        </div>
      )}

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-30">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
          <span className="font-mono-tight text-[10px] text-white/90">ABSTAND: 32,4 CM</span>
        </div>
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
          <span className="font-mono-tight text-[10px] text-white/90">EBENE: WAAGERECHT</span>
        </div>
      </div>
      <div className="absolute top-14 left-4 z-30">
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
          <span className="font-mono-tight text-[10px] text-verified">LICHT: OPTIMAL</span>
        </div>
      </div>

      {done && <div className="absolute inset-0 bg-white z-40 animate-snapshot-flash pointer-events-none" />}

      {done && (
        <ScanResultPanel
          imageSrc={LAYERS.scan}
          imageAlt="Gescannte Andruckplatte"
          title="Andruckplatte erfasst"
          description="Die Andruckplatte wurde vollständig erfasst. Die physikalischen Referenzwerte stehen für den Abgleich bereit."
          badges={[
            { label: 'REFERENZPUNKTE: 2.371' },
            { label: 'GENAUIGKEIT: 99,6%', verified: true },
          ]}
          buttonLabel="Zurück zur Auswahl"
          onComplete={onComplete}
        />
      )}

      {!done && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
          <ProgressRing progress={overallProgress} />
        </div>
      )}
      {!done && (
        <div className="absolute bottom-8 right-4 z-30">
          <p className="font-mono-tight text-[10px] text-white/70">
            {`${Math.round(overallProgress)}%`}
          </p>
        </div>
      )}
    </div>
  );
}
