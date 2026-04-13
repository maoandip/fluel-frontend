import { createSignal, Show } from "solid-js";
import { haptic } from "../telegram";
import type { Chain } from "../types";
import ChainSelectorModal from "./ChainSelectorModal";
import s from "./ChainPicker.module.css";

export interface ChainPickerProps {
  chains: Chain[];
  value: string;
  onChange: (name: string) => void;
  label: string;
}

export default function ChainPicker(props: ChainPickerProps) {
  const [open, setOpen] = createSignal(false);

  const chain = () => props.chains.find(c => c.name === props.value);

  return (
    <>
      <div>
        <label class={s.label}>{props.label}</label>
        <button class={s.btn} onClick={() => { haptic("light"); setOpen(true); }}>
          <Show when={chain()?.icon}>
            <img class={s.icon} src={chain()!.icon!} alt="" />
          </Show>
          <span class={s.name}>{props.value || "Select"}</span>
          <svg class={s.chevron} width="12" height="12" viewBox="0 0 256 256" fill="currentColor"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/></svg>
        </button>
      </div>

      <Show when={open()}>
        <ChainSelectorModal
          chains={props.chains}
          value={props.value}
          onSelect={(name) => { props.onChange(name); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      </Show>
    </>
  );
}
