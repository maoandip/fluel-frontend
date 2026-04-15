import { Show, For } from "solid-js";
import s from "./AmountInput.module.css";

export interface AmountInputProps {
  value: string;
  onInput: (value: string) => void;
  presets?: number[];
  maxValue?: string;
  suffix?: string;
}

export default function AmountInput(props: AmountInputProps) {
  return (
    <div class={s.wrapper}>
      {/* Preset buttons */}
      <Show when={props.presets && props.presets.length > 0}>
        <div class={s.presetsRow}>
          <For each={props.presets}>
            {(preset) => (
              <button
                class={props.value === String(preset) ? s.presetBtnActive : s.presetBtn}
                onClick={() => props.onInput(String(preset))}
              >
                ${preset}
              </button>
            )}
          </For>
        </div>
      </Show>

      {/* Input with suffix */}
      <div class={s.inputRow}>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          class={s.input}
          value={props.value}
          onInput={(e) => props.onInput(e.currentTarget.value)}
        />
        <Show when={props.suffix}>
          <span class={s.suffix}>{props.suffix}</span>
        </Show>
      </div>

      {/* Balance hint with MAX */}
      <Show when={props.maxValue}>
        <div class={s.balanceRow}>
          <span class={s.balanceValue}>Balance: {props.maxValue}</span>
          <button class={s.maxBtn} onClick={() => props.onInput(props.maxValue!)}>
            MAX
          </button>
        </div>
      </Show>
    </div>
  );
}
