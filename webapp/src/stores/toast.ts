import { createSignal } from "solid-js";

const [message, setMessage] = createSignal("");
const [visible, setVisible] = createSignal(false);

let hideTimeout: ReturnType<typeof setTimeout> | undefined;

export function hideToast() {
  clearTimeout(hideTimeout);
  setVisible(false);
}

export function showToast(msg: string, duration = 2500) {
  clearTimeout(hideTimeout);
  setMessage(msg);
  setVisible(true);
  hideTimeout = setTimeout(() => {
    setVisible(false);
  }, duration);
}

export { message, visible };
