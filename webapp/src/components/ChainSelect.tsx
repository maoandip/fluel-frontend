import { For } from "solid-js";
import type { Chain } from "../types";
import s from "./ChainSelect.module.css";

export interface ChainSelectProps {
  chains: Chain[];
  value: string;
  onChange: (name: string) => void;
  label: string;
}

export default function ChainSelect(props: ChainSelectProps) {
  return (
    <div>
      <label class={s.label}>{props.label}</label>
      <select
        class={s.select}
        value={props.value}
        onChange={(e) => props.onChange(e.currentTarget.value)}
      >
        <For each={props.chains}>
          {(chain) => (
            <option value={chain.name} class={s.option}>
              {chain.name}
            </option>
          )}
        </For>
      </select>
    </div>
  );
}
