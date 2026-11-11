import type { StepId } from '@/types';

export interface OnboardingHighlight {
  /** CSS selector for the element to point at */
  selector: string;
  /** Display name of the feature */
  title: string;
  /** Short description of what the user does here */
  description: string;
}

export type OnboardingSteps = Record<StepId, OnboardingHighlight[]>;

export const ONBOARDING_DEFINITIONS: OnboardingSteps = {
  onboarding: [
    {
      selector: '[data-onboarding="checklist"]',
      title: 'Checkliste',
      description: 'Hier siehst du, was du für den Scan brauchst und wie lange es dauert.',
    },
    {
      selector: '[data-onboarding="scan-mode"]',
      title: 'Scan-Modus',
      description: 'Wähle zwischen reinem optischem Scan oder Hybrid-Scan mit Andruckplatte.',
    },
    {
      selector: '[data-onboarding="hardware"]',
      title: 'Hardware-Profil',
      description: 'Machst du selbst oder lässt du drucken? Wähle deinen Fertigungsweg.',
    },
    {
      selector: '[data-onboarding="sole-scan"]',
      title: 'SoleMatch',
      description: 'Schnellmodus: Scanne stattdessen deine Einlegesohle direkt.',
    },
  ],
  scan: [
    {
      selector: '[data-onboarding="scan-area"]',
      title: 'Scan-Bereich',
      description: 'Die orangefarbene Linie erfasst deinen Fuß oder deine Sohle Schicht für Schicht.',
    },
    {
      selector: '[data-onboarding="scan-hud"]',
      title: 'Scan-Status',
      description: 'Abstand, Ausrichtung und Licht werden live überwacht.',
    },
  ],
  metrics: [
    {
      selector: '[data-onboarding="3d-viewer"]',
      title: '3D-Modell',
      description: 'Dein gescannter Fuß als interaktives 3D-Modell — drehbar und zoombaar.',
    },
    {
      selector: '[data-onboarding="metrics-grid"]',
      title: 'Vermessungsdaten',
      description: 'Alle relevanten Maße wurden automatisch aus dem Scan extrahiert.',
    },
  ],
  customizer: [
    {
      selector: '[data-onboarding="model-select"]',
      title: 'Modellwahl',
      description: 'Wechsle zwischen Sneaker und Flip-Flop als Basis-Modell.',
    },
    {
      selector: '[data-onboarding="3d-preview"]',
      title: 'Live-Vorschau',
      description: 'Das 3D-Modell zeigt deine Farbauswahl in Echtzeit.',
    },
    {
      selector: '[data-onboarding="color-zones"]',
      title: 'Farbzonierung',
      description: 'Wähle Farben für einzelne Zonen des Schuhs.',
    },
    {
      selector: '[data-onboarding="tread"]',
      title: 'Profilstruktur',
      description: 'Bestimme das Muster der Laufsohle — Wabe oder Lamelle.',
    },
  ],
  printability: [
    {
      selector: '[data-onboarding="print-volume"]',
      title: 'Bauraum',
      description: 'Zeigt deinen Drucker und das nutzbare Druckvolumen.',
    },
    {
      selector: '[data-onboarding="print-checks"]',
      title: 'Druckbarkeits-Checks',
      description: 'Wandstärke, Überhänge und Passung werden automatisch geprüft.',
    },
    {
      selector: '[data-onboarding="material"]',
      title: 'Material',
      description: 'Info zum verwendeten Material und dessen Eigenschaften.',
    },
  ],
  slicer: [
    {
      selector: '[data-onboarding="slicer-view"]',
      title: 'Slicer-Vorschau',
      description: 'Die Druckdatei wird Schicht für Schicht generiert.',
    },
    {
      selector: '[data-onboarding="slice-info"]',
      title: 'Slice-Info',
      description: 'Filamentbedarf, Druckzeit und Kosten für deinen Druck.',
    },
  ],
  export: [
    {
      selector: '[data-onboarding="export-panel"]',
      title: 'Fertigungspaket',
      description: 'Lade deine Druckdateien herunter oder beauftrage die Fertigung.',
    },
    {
      selector: '[data-onboarding="reset"]',
      title: 'Neu starten',
      description: 'Kehre zum Start zurück und konfiguriere einen neuen Schuh.',
    },
  ],
};
