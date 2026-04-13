import { Component, Show, Match, Switch, Suspense, createSignal, onMount, lazy } from "solid-js";
import { AppProvider, useApp } from "./stores/app";
import Toast from "./components/Toast";
import TabLayout from "./components/TabLayout";
import Skeleton from "./components/Skeleton";
import SwapPage from "./pages/SwapPage";

const BalancesPage = lazy(() => import("./pages/BalancesPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const AutomatePage = lazy(() => import("./pages/AutomatePage"));
const EarnPage = lazy(() => import("./pages/EarnPage"));

const Splash = (props: { fadeOut?: boolean }) => (
  <div class={`splash-screen ${props.fadeOut ? "out" : ""}`}>
    <style>{`
      .splash-screen {
        position: fixed; inset: 0; z-index: 200;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        background: #080B10;
        transition: opacity 0.4s ease;
      }
      .splash-screen.out { opacity: 0; pointer-events: none; }

      .splash-glow {
        position: absolute;
        width: 280px; height: 280px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0,255,178,.1) 0%, transparent 70%);
        filter: blur(40px);
        animation: splashPulse 2.5s ease-in-out infinite;
      }
      @keyframes splashPulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.15); opacity: 1; }
      }

      .splash-icon-wrap {
        position: relative;
        width: 80px; height: 80px;
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 20px;
        animation: splashBounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes splashBounceIn {
        0% { opacity: 0; transform: scale(0.3); }
        100% { opacity: 1; transform: scale(1); }
      }

      .splash-icon-ring {
        position: absolute; inset: -4px;
        border-radius: 4px;
        border: 1px solid #1E2530;
        animation: splashRingSpin 4s linear infinite;
      }
      @keyframes splashRingSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .splash-icon-inner {
        width: 80px; height: 80px;
        background: rgba(0,255,178,.04);
        border: 1px solid #1E2530;
        border-radius: 4px;
        display: flex; align-items: center; justify-content: center;
        font-size: 36px;
      }

      .splash-title {
        font-family: 'Inter', sans-serif;
        font-size: 28px; font-weight: 800;
        color: #E2EDF8;
        letter-spacing: -0.02em;
        margin-bottom: 6px;
        animation: splashFadeUp 0.5s ease both 0.2s;
      }
      .splash-subtitle {
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px; font-weight: 400;
        color: #4A5568;
        letter-spacing: 0.02em;
        margin-bottom: 32px;
        animation: splashFadeUp 0.5s ease both 0.35s;
      }
      @keyframes splashFadeUp {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      .splash-loader {
        display: flex; gap: 6px;
        animation: splashFadeUp 0.5s ease both 0.5s;
      }
      .splash-loader span {
        width: 8px; height: 8px;
        border-radius: 50%;
        background: #00FFB2;
        animation: splashDot 1.2s ease-in-out infinite;
      }
      .splash-loader span:nth-child(2) { animation-delay: 0.15s; }
      .splash-loader span:nth-child(3) { animation-delay: 0.3s; }
      @keyframes splashDot {
        0%, 80%, 100% { opacity: 0.2; transform: scale(0.7); }
        40% { opacity: 1; transform: scale(1); }
      }
    `}</style>

    <div class="splash-glow" />
    <div class="splash-icon-wrap">
      <div class="splash-icon-ring" />
      <div class="splash-icon-inner">
        <svg width="24" height="36" viewBox="0 0 48 72" fill="none"><path d="M24 68 C14 68 6 60 6 50 C6 40 14 32 24 18 C34 32 42 40 42 50 C42 60 34 68 24 68Z" fill="#00FFB2"/><path d="M24 18 C24 18 19 8 19 4 C19 1.5 21.2 0 24 0 C26.8 0 29 1.5 29 4 C29 8 24 18 24 18Z" fill="#FF7A5C"/></svg>
      </div>
    </div>
    <div class="splash-title">fluel</div>
    <div class="splash-subtitle">Never get stranded on a chain again.</div>
    <div class="splash-loader">
      <span /><span /><span />
    </div>
  </div>
);

const AppContent: Component = () => {
  const { isReady } = useApp();
  const [showSplash, setShowSplash] = createSignal(true);
  const [fadeOut, setFadeOut] = createSignal(false);

  onMount(() => {
    const check = setInterval(() => {
      if (isReady()) {
        setFadeOut(true);
        setTimeout(() => setShowSplash(false), 400);
        clearInterval(check);
      }
    }, 50);
  });

  return (
    <>
      <Show when={showSplash()}>
        <Splash fadeOut={fadeOut()} />
      </Show>
      <Show when={isReady()}>
        <TabLayout>
          {(tab) => (
            <Suspense fallback={<div style={{ padding: "16px" }}><Skeleton rows={5} /></div>}>
              <Switch>
                <Match when={tab() === "swap"}><SwapPage /></Match>
                <Match when={tab() === "balance"}><BalancesPage /></Match>
                <Match when={tab() === "history"}><HistoryPage /></Match>
                <Match when={tab() === "automate"}><AutomatePage /></Match>
                <Match when={tab() === "earn"}><EarnPage /></Match>
              </Switch>
            </Suspense>
          )}
        </TabLayout>
      </Show>
      <Toast />
    </>
  );
};

const App: Component = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
