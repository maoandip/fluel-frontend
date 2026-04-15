import { For } from "solid-js";
import s from "./Skeleton.module.css";

export interface SkeletonProps {
  rows?: number;
}

const WIDTH_CLASSES = [s.w0, s.w1, s.w2, s.w3, s.w4];

export default function Skeleton(props: SkeletonProps) {
  const count = () => props.rows ?? 3;

  return (
    <div class={s.container}>
      <For each={Array.from({ length: count() })}>
        {(_, i) => (
          <div class={`${s.row} ${WIDTH_CLASSES[i() % WIDTH_CLASSES.length]}`} />
        )}
      </For>
    </div>
  );
}
