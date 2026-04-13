import type { JSX } from "solid-js";
import s from "./Card.module.css";

export interface CardProps {
  children: JSX.Element;
  class?: string;
}

export default function Card(props: CardProps) {
  return (
    <div class={`${s.card} ${props.class ?? ""}`}>
      {props.children}
    </div>
  );
}
