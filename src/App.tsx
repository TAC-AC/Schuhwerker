import { useCallback, useState } from 'react';
import { IPhoneFrame } from '@/components/IPhoneFrame';
import { StepIndicator } from '@/components/StepIndicator';
import { OnboardingOverlay } from '@/components/OnboardingOverlay';
import { SplashStep } from '@/components/steps/SplashStep';
import { SettingsPage } from '@/components/SettingsPage';
import { OnboardingStep } from '@/components/steps/OnboardingStep';
import { ScanStep } from '@/components/steps/ScanStep';
import { HybridScanStep } from '@/components/steps/HybridScanStep';
import { HybridResultStep } from '@/components/steps/HybridResultStep';
import { MetricsStep } from '@/components/steps/MetricsStep';
import { CustomizerStep } from '@/components/steps/CustomizerStep';
import { PrintabilityStep } from '@/components/steps/PrintabilityStep';
import { SlicerStep } from '@/components/steps/SlicerStep';
import { ExportStep } from '@/components/steps/ExportStep';
import { useAppMachine } from '@/useAppMachine';
import { useOnboardingEnabled } from '@/lib/useOnboardingEnabled';
import { ONBOARDING_DEFINITIONS } from '@/lib/onboardingDefinitions';
import { STEP_IDS } from '@/types';
import type { HardwareProfile, PrinterType, CustomizerState, ScanMethod, ScanMode } from '@/types';

function App() {
  const [state, dispatch] = useAppMachine();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [onboardingEnabled, setOnboardingEnabled] = useOnboardingEnabled();
  const [onboardingActive, setOnboardingActive] = useState(false);

  const next = useCallback(() => dispatch({ type: 'NEXT' }), [dispatch]);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [dispatch]);
  const start = useCallback((method: ScanMethod) => dispatch({ type: 'START', scanMethod: method }), [dispatch]);
  const startSoleScan = useCallback(() => dispatch({ type: 'START_SOLE_SCAN' }), [dispatch]);
  const setHardware = useCallback((h: HardwareProfile) => dispatch({ type: 'SET_HARDWARE', hardware: h }), [dispatch]);
  const setPrinter = useCallback((p: PrinterType) => dispatch({ type: 'SET_PRINTER', printer: p }), [dispatch]);
  const setScanMode = useCallback((m: ScanMode) => dispatch({ type: 'SET_SCAN_MODE', scanMode: m }), [dispatch]);
  const setCustomizer = useCallback((patch: Partial<CustomizerState>) => dispatch({ type: 'SET_CUSTOMIZER', patch }), [dispatch]);
  const isHybridFoot = state.scanMode === 'hybrid' && state.scanTarget === 'foot';
  const afterMetrics = useCallback(
    () => dispatch({ type: 'GOTO', step: state.scanTarget === 'sole' ? 4 : 3 }),
    [dispatch, state.scanTarget],
  );

  const currentStepId = STEP_IDS[state.step];
  const highlights = ONBOARDING_DEFINITIONS[currentStepId];

  const shouldShowOnboarding =
    onboardingEnabled && onboardingActive && state.started && highlights.length > 0 && !settingsOpen;

  if (!state.started) {
    return (
      <IPhoneFrame>
        {settingsOpen ? (
          <SettingsPage
            onBack={() => setSettingsOpen(false)}
            onboardingEnabled={onboardingEnabled}
            onOnboardingToggle={setOnboardingEnabled}
          />
        ) : (
          <SplashStep onStart={start} onOpenSettings={() => setSettingsOpen(true)} />
        )}
      </IPhoneFrame>
    );
  }

  return (
    <IPhoneFrame>
      <StepIndicator step={state.step} onHelp={() => setOnboardingActive(true)} />
      {state.step === 0 && (
        <OnboardingStep
          state={state}
          setHardware={setHardware}
          setPrinter={setPrinter}
          setScanMode={setScanMode}
          onNext={next}
          onSoleScan={startSoleScan}
        />
      )}
      {state.step === 1 &&
        (isHybridFoot ? (
          <HybridScanStep onComplete={next} />
        ) : (
          <ScanStep onComplete={next} scanTarget={state.scanTarget} />
        ))}
      {state.step === 2 &&
        (isHybridFoot ? (
          <HybridResultStep state={state} onNext={next} />
        ) : (
          <MetricsStep state={state} onNext={afterMetrics} />
        ))}
      {state.step === 3 && (
        <CustomizerStep state={state} setCustomizer={setCustomizer} onNext={next} />
      )}
      {state.step === 4 && <PrintabilityStep state={state} onNext={next} />}
      {state.step === 5 && <SlicerStep onNext={next} scanTarget={state.scanTarget} />}
      {state.step === 6 && <ExportStep state={state} onReset={reset} />}

      {shouldShowOnboarding && (
        <OnboardingOverlay
          highlights={highlights}
          onComplete={() => setOnboardingActive(false)}
          onSkip={() => setOnboardingActive(false)}
        />
      )}
    </IPhoneFrame>
  );
}

export default App;
