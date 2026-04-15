import s from "./PageSkeleton.module.css";

export default function PageSkeleton() {
  return (
    <div class={s.root} aria-hidden="true">
      <div class={s.title} />
      <div class={`${s.line} ${s.w80}`} />
      <div class={`${s.line} ${s.w65}`} />
      <div class={`${s.line} ${s.w90}`} />
      <div class={`${s.line} ${s.w50}`} />
    </div>
  );
}
