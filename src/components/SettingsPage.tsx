import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, Check, GraduationCap } from 'lucide-react';
import { Card, SectionLabel } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/Button';
import { loadLatestUserProfile, saveUserProfile } from '@/lib/userProfile';
import { PRINTER_OPTIONS, MATERIAL_OPTIONS, type UserProfile } from '@/types';

interface SettingsPageProps {
  onBack: () => void;
  onboardingEnabled: boolean;
  onOnboardingToggle: (enabled: boolean) => void;
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  shoeSize: string;
  weightKg: string;
  printer: string;
  material: string;
}

const EMPTY_FORM: FormValues = {
  firstName: '',
  lastName: '',
  email: '',
  shoeSize: '',
  weightKg: '',
  printer: '',
  material: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: FormValues): { profile: UserProfile } | { error: string } {
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const email = values.email.trim();
  const material = values.material.trim();
  const shoeSize = Number(values.shoeSize.replace(',', '.'));
  const weightKg = Number(values.weightKg.replace(',', '.'));

  if (!firstName || !lastName) return { error: 'Bitte Vor- und Nachname eintragen.' };
  if (!EMAIL_PATTERN.test(email)) return { error: 'Bitte eine gültige E-Mail-Adresse eintragen.' };
  if (!Number.isFinite(shoeSize) || shoeSize < 20 || shoeSize > 60) {
    return { error: 'Bitte eine gültige Schuhgröße eintragen (20 bis 60).' };
  }
  if (!values.weightKg || !Number.isFinite(weightKg) || weightKg < 20 || weightKg > 300) {
    return { error: 'Bitte ein gültiges Körpergewicht eintragen (20 bis 300 kg).' };
  }
  if (!values.printer) return { error: 'Bitte einen 3D-Drucker auswählen.' };
  if (!material) return { error: 'Bitte ein Material auswählen.' };

  return {
    profile: { firstName, lastName, email, shoeSize, weightKg, printer: values.printer, material },
  };
}

export function SettingsPage({ onBack, onboardingEnabled, onOnboardingToggle }: SettingsPageProps) {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadLatestUserProfile()
      .then((profile) => {
        if (cancelled || !profile) return;
        setValues({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          shoeSize: String(profile.shoeSize).replace('.', ','),
          weightKg: profile.weightKg ? String(profile.weightKg).replace('.', ',') : '',
          printer: profile.printer,
          material: profile.material,
        });
      })
      .catch(() => {
        if (!cancelled) setLoadError('Die gespeicherten Daten konnten nicht geladen werden.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = validate(values);
    if ('error' in result) {
      setFormError(result.error);
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      await saveUserProfile(result.profile);
      setSaved(true);
    } catch {
      setFormError('Die Daten konnten nicht gespeichert werden. Bitte erneut versuchen.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-base-off animate-fade-up">
      <header className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Zurück"
          className="no-tap-highlight w-10 h-10 rounded-full border border-hairline bg-base-white flex items-center justify-center text-carbon transition-all duration-200 hover:border-signal active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-[18px] font-semibold tracking-tight text-carbon">Einstellungen</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4 space-y-5">
          <div>
            <SectionLabel>Persönliche Daten</SectionLabel>
            <h2 className="text-[22px] font-semibold tracking-tight text-carbon leading-tight">
              Dein Profil
            </h2>
            <p className="text-[13px] text-technical mt-1 leading-relaxed">
Bitte trage hier deine Angaben ein. Sie werden für dich gespeichert.
            </p>
          </div>

          {loadError && (
            <p className="text-[12px] text-red-600 leading-snug">{loadError}</p>
          )}

          <Card padding="lg" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Vorname">
                <input
                  type="text"
                  value={values.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  disabled={loading}
                  autoComplete="given-name"
                  className={inputClass}
                />
              </Field>
              <Field label="Nachname">
                <input
                  type="text"
                  value={values.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  disabled={loading}
                  autoComplete="family-name"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="E-Mail-Adresse">
              <input
                type="email"
                value={values.email}
                onChange={(e) => update('email', e.target.value)}
                disabled={loading}
                autoComplete="email"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Schuhgröße">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="z. B. 42"
                  value={values.shoeSize}
                  onChange={(e) => update('shoeSize', e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
              </Field>
              <Field label="Körpergewicht">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="z. B. 75"
                  value={values.weightKg}
                  onChange={(e) => update('weightKg', e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Material">
              <select
                value={values.material}
                onChange={(e) => update('material', e.target.value)}
                disabled={loading}
                className={inputClass}
              >
                <option value="">Material auswählen</option>
                {MATERIAL_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="3D-Drucker">
              <select
                value={values.printer}
                onChange={(e) => update('printer', e.target.value)}
                disabled={loading}
                className={inputClass}
              >
                <option value="">Drucker auswählen</option>
                {PRINTER_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
          </Card>

          <div>
            <SectionLabel>App</SectionLabel>
            <h2 className="text-[22px] font-semibold tracking-tight text-carbon leading-tight">
              Einführung
            </h2>
            <p className="text-[13px] text-technical mt-1 leading-relaxed">
              Schritt-für-Schritt-Erklärung der Funktionen auf jeder Seite.
            </p>
          </div>

          <Card>
            <button
              type="button"
              onClick={() => onOnboardingToggle(!onboardingEnabled)}
              className="no-tap-highlight w-full flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-signal/10 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-signal" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[14px] font-semibold text-carbon">Onboarding anzeigen</p>
                <p className="text-[12px] text-technical mt-0.5 leading-snug">
                  {onboardingEnabled ? 'Aktiv — Erklärungen werden eingeblendet' : 'Ausgeschaltet'}
                </p>
              </div>
              <div
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                  onboardingEnabled ? 'bg-signal' : 'bg-hairline'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-base-white shadow-sm transition-all duration-200 ${
                    onboardingEnabled ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </div>
            </button>
          </Card>

          {formError && <p className="text-[12px] text-red-600 leading-snug">{formError}</p>}
          {saved && !formError && (
            <p className="flex items-center gap-1.5 text-[12px] font-semibold text-verified animate-fade-up">
              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              Deine Daten wurden gespeichert.
            </p>
          )}
        </div>

        <div className="px-5 py-4 bg-gradient-to-t from-base-off via-base-off to-transparent">
          <PrimaryButton disabled={loading || saving}>
            {saving ? 'Wird gespeichert…' : 'Speichern'}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-hairline bg-base-white px-3.5 py-3 text-[14px] text-carbon placeholder:text-technical/60 outline-none transition-all duration-200 focus:border-signal focus:ring-1 focus:ring-signal disabled:opacity-50';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-medium text-technical mb-1.5">{label}</span>
      {children}
    </label>
  );
}
