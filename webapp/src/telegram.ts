// Typed wrapper for the Telegram WebApp SDK

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}

interface ThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  section_separator_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

interface WebAppButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  setText(text: string): void;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
  enable(): void;
  disable(): void;
  showProgress(leaveActive?: boolean): void;
  hideProgress(): void;
  setParams(params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }): void;
}

interface BackButtonType {
  isVisible: boolean;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
}

interface HapticFeedback {
  impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft"): void;
  notificationOccurred(type: "error" | "success" | "warning"): void;
  selectionChanged(): void;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: { id: number; first_name: string; last_name?: string; username?: string };
    start_param?: string;
  };
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: ThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  MainButton: WebAppButton;
  BackButton: BackButtonType;
  HapticFeedback: HapticFeedback;
  ready(): void;
  expand(): void;
  close(): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  showPopup(params: { title?: string; message: string; buttons?: Array<{ id?: string; type?: string; text?: string }> }, callback?: (id: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (ok: boolean) => void): void;
  onEvent(event: string, callback: (...args: any[]) => void): void;
  offEvent(event: string, callback: (...args: any[]) => void): void;
  sendData(data: string): void;
}

// ── Exports ────────────────────────────────────────────────────────

export const tg: TelegramWebApp = window.Telegram?.WebApp ?? ({
  initData: "",
  initDataUnsafe: {},
  version: "0",
  platform: "unknown",
  colorScheme: "dark",
  themeParams: {},
  isExpanded: false,
  viewportHeight: 0,
  viewportStableHeight: 0,
  MainButton: { text: "", color: "", textColor: "", isVisible: false, isActive: false, isProgressVisible: false, setText() {}, onClick() {}, offClick() {}, show() {}, hide() {}, enable() {}, disable() {}, showProgress() {}, hideProgress() {}, setParams() {} },
  BackButton: { isVisible: false, onClick() {}, offClick() {}, show() {}, hide() {} },
  HapticFeedback: { impactOccurred() {}, notificationOccurred() {}, selectionChanged() {} },
  ready() {},
  expand() {},
  close() {},
  setHeaderColor() {},
  setBackgroundColor() {},
  enableClosingConfirmation() {},
  disableClosingConfirmation() {},
  showPopup() {},
  showAlert(_msg: string, cb?: () => void) { cb?.(); },
  showConfirm(_msg: string, cb?: (ok: boolean) => void) { cb?.(true); },
  onEvent() {},
  offEvent() {},
  sendData() {},
} as TelegramWebApp);

export function haptic(type: "light" | "medium" | "heavy" | "rigid" | "soft" | "success" | "warning" | "error" | "selection") {
  try {
    if (type === "selection") {
      tg.HapticFeedback.selectionChanged();
    } else if (type === "success" || type === "warning" || type === "error") {
      tg.HapticFeedback.notificationOccurred(type);
    } else {
      tg.HapticFeedback.impactOccurred(type);
    }
  } catch {
    // silently ignore if haptics unavailable
  }
}

export function showConfirm(msg: string): Promise<boolean> {
  return new Promise((resolve) => {
    tg.showConfirm(msg, (ok) => resolve(ok));
  });
}

export function showAlert(msg: string): Promise<void> {
  return new Promise((resolve) => {
    tg.showAlert(msg, () => resolve());
  });
}

// ── Theme ──────────────────────────────────────────────────────────

const themeMap: Array<[keyof ThemeParams, string]> = [
  ["bg_color", "--bg"],
  ["text_color", "--text"],
  ["hint_color", "--hint"],
  ["link_color", "--link"],
  ["button_color", "--btn"],
  ["button_text_color", "--btn-text"],
  ["secondary_bg_color", "--bg2"],
  ["header_bg_color", "--header"],
  ["accent_text_color", "--accent"],
  ["section_bg_color", "--section"],
  ["section_header_text_color", "--section-header"],
  ["section_separator_color", "--section-sep"],
  ["subtitle_text_color", "--subtitle"],
  ["destructive_text_color", "--destructive"],
];

function applyTheme() {
  const root = document.documentElement;
  const tp = tg.themeParams;
  for (const [key, cssVar] of themeMap) {
    const value = tp[key];
    if (value) root.style.setProperty(cssVar, value);
  }
}

export function setupTheme() {
  applyTheme();
  tg.onEvent("themeChanged", applyTheme);
}

// ── Initialization ─────────────────────────────────────────────────

export function initTelegram() {
  tg.ready();
  tg.expand();
  tg.setHeaderColor("#111113");
  tg.setBackgroundColor("#09090b");
  tg.enableClosingConfirmation();
  setupTheme();
}

// ── MainButton helpers ─────────────────────────────────────────────

export const MainButton = {
  show(text: string, onClick: () => void) {
    tg.MainButton.setText(text);
    tg.MainButton.onClick(onClick);
    tg.MainButton.show();
  },
  hide() {
    tg.MainButton.hide();
  },
  showProgress() {
    tg.MainButton.showProgress(true);
  },
  hideProgress() {
    tg.MainButton.hideProgress();
  },
  enable() {
    tg.MainButton.enable();
  },
  disable() {
    tg.MainButton.disable();
  },
  setParams(params: { text?: string; color?: string; text_color?: string; is_active?: boolean }) {
    tg.MainButton.setParams(params);
  },
};

// ── BackButton helpers ─────────────────────────────────────────────

export const BackButton = {
  show(onClick: () => void) {
    tg.BackButton.onClick(onClick);
    tg.BackButton.show();
  },
  hide() {
    tg.BackButton.hide();
  },
};
