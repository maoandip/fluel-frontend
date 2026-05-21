import { showToast } from "../stores/toast";
import { haptic } from "./telegram";

/**
 * Copy text to the clipboard with consistent feedback — a success haptic and
 * toast, or a failure toast. Centralises the pattern that was repeated across
 * the wallet bar, swap form, history list and invite page. A blank string is
 * a no-op.
 */
export async function copyToClipboard(text: string, successMessage: string): Promise<void> {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    haptic("success");
    showToast(successMessage);
  } catch {
    showToast("Failed to copy");
  }
}
