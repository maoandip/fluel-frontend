import { createEffect, onCleanup } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { BackButton } from "../../lib/telegram";

/**
 * Wires Telegram's native BackButton to router history.
 * - On the root route (swap) the back button is hidden.
 * - On any other tab it's shown and navigates back to swap.
 *
 * Renders nothing. Mounted once inside the Router shell.
 */
export default function BackButtonHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  createEffect(() => {
    if (location.pathname === "/") {
      BackButton.hide();
    } else {
      BackButton.show(() => navigate("/"));
    }
  });

  onCleanup(() => BackButton.hide());

  return null;
}
