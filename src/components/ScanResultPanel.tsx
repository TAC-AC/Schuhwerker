import { CheckCircle2, ArrowRight } from 'lucide-react';

interface ScanBadge {
  label: string;
  verified?: boolean;
}

interface ScanResultPanelProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  badges: ScanBadge[];
  buttonLabel: string;
  onComplete: () => void;
}

export function ScanResultPanel({
  imageSrc,
  imageAlt,
  title,
  description,
  badges,
  buttonLabel,
  onComplete,
}: ScanResultPanelProps) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-black animate-fade-up overflow-hidden">
      <div className="relative h-1/3 w-full overflow-hidden">
        <img src={imageSrc} alt={imageAlt} className="absolute inset-0 w-full h-full object-contain opacity-90" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-between px-6 pt-6 pb-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-verified flex items-center justify-center mb-5 animate-fade-up">
            <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-verified mb-3">
            Scan abgeschlossen
          </p>
          <h2 className="text-[24px] font-bold tracking-tight text-white text-center leading-tight mb-3">
            {title}
          </h2>
          <p className="text-[13px] text-white/70 text-center leading-relaxed max-w-[280px]">{description}</p>
          <div className="mt-5 flex items-center gap-4">
            {badges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-2">
                <span
                  className={`font-mono-tight text-[11px] ${badge.verified ? 'text-verified' : 'text-white/90'}`}
                >
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={onComplete}
          className="no-tap-highlight w-full rounded-xl bg-signal text-white py-4 text-[15px] font-semibold tracking-tight transition-all duration-200 active:scale-[0.985] flex items-center justify-center gap-2"
        >
          {buttonLabel}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
