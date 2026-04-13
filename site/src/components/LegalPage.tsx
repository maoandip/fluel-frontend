import { type JSX } from "solid-js";
import p from "../styles/page.module.css";
import s from "./LegalPage.module.css";

interface LegalPageProps {
  title: string;
  updated: string;
  children: JSX.Element;
}

export default function LegalPage(props: LegalPageProps) {
  return (
    <div class={p.page}>
      <div class={p.wrapper}>
        <h1 class={p.title}>{props.title}</h1>
        <p class={s.updated}>Last updated: {props.updated}</p>
        <div class={s.body}>{props.children}</div>
      </div>
    </div>
  );
}

export function Section(props: { title: string; children: JSX.Element }) {
  return (
    <>
      <h2 class={s.heading}>{props.title}</h2>
      {props.children}
    </>
  );
}
