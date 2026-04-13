import { For } from "solid-js";
import s from "./Skeleton.module.css";

export interface SkeletonProps {
  rows?: number;
}

export default function Skeleton(props: SkeletonProps) {
  const count = () => props.rows ?? 3;
  const widths = ["100%", "85%", "60%", "92%", "70%"];

  return (
    <div class={s.container}>
      <For each={Array.from({ length: count() })}>
        {(_, i) => (
          <div class={s.row} style={{ width: widths[i() % widths.length] }} />
        )}
      </For>
    </div>
  );
}
