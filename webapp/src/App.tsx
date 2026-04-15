import { Component, Show, Suspense, ErrorBoundary, createSignal, createEffect, lazy, type JSX } from "solid-js";
import { Router, Route } from "@solidjs/router";
import { AppProvider, useApp } from "./stores/app";
import Toast from "./components/ui/Toast";
import TabLayout from "./components/layout/TabLayout";
import BackButtonHandler from "./components/layout/BackButtonHandler";
import Skeleton from "./components/ui/Skeleton";
import SwapPage from "./pages/SwapPage";
import BetaGate from "./components/layout/BetaGate";
import RouteErrorFallback from "./components/layout/RouteErrorFallback";
import { BETA_MODE, isTester, markTester } from "./config/flags";
import splash from "./components/layout/Splash.module.css";

// Persist tester access via ?tester=1 URL param (checked once at module load).
if (typeof window !== "undefined") {
  const params = new URLSearchParams(window.location.search);
  if (params.get("tester") === "1") markTester();
}

const BalancesPage = lazy(() => import("./pages/BalancesPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const AutomatePage = lazy(() => import("./pages/AutomatePage"));
const EarnPage = lazy(() => import("./pages/EarnPage"));

const Splash = (props: { fadeOut?: boolean }) => (
  <div class={`${splash.screen} ${props.fadeOut ? splash.out : ""}`}>
    <div class={splash.glow} />
    <div class={splash.iconWrap}>
      <div class={splash.iconRing} />
      <div class={splash.iconInner}>
        <svg width="24" height="36" viewBox="0 0 48 72" fill="none"><path d="M24 68 C14 68 6 60 6 50 C6 40 14 32 24 18 C34 32 42 40 42 50 C42 60 34 68 24 68Z" fill="#00FFB2"/><path d="M24 18 C24 18 19 8 19 4 C19 1.5 21.2 0 24 0 C26.8 0 29 1.5 29 4 C29 8 24 18 24 18Z" fill="#FF7A5C"/></svg>
      </div>
    </div>
    <div class={splash.title}>fluel</div>
    <div class={splash.subtitle}>Never get stranded on a chain again.</div>
    <div class={splash.loader}>
      <span /><span /><span />
    </div>
  </div>
);

// AppContent wraps route children with splash + TabLayout + error/suspense
// boundaries. The route children (matched route component) are the tab
// content, slotted into TabLayout's content area.
const AppContent: Component<{ children?: JSX.Element }> = (props) => {
  const { isReady } = useApp();
  const [showSplash, setShowSplash] = createSignal(true);
  const [fadeOut, setFadeOut] = createSignal(false);

  createEffect(() => {
    if (isReady() && !fadeOut()) {
      setFadeOut(true);
      setTimeout(() => setShowSplash(false), 400);
    }
  });

  return (
    <>
      <BackButtonHandler />
      <Show when={showSplash()}>
        <Splash fadeOut={fadeOut()} />
      </Show>
      <Show when={isReady()}>
        <TabLayout>
          <ErrorBoundary fallback={(err, reset) => <RouteErrorFallback err={err} reset={reset} />}>
            <Suspense fallback={<div class={splash.suspense}><Skeleton rows={5} /></div>}>
              {props.children}
            </Suspense>
          </ErrorBoundary>
        </TabLayout>
      </Show>
      <Toast />
    </>
  );
};

// Router shell — chooses between the beta gate and the real app, and
// wraps route children in the app provider + splash + tab layout.
const AppShell: Component<{ children?: JSX.Element }> = (props) => (
  <Show
    when={BETA_MODE && !isTester()}
    fallback={
      <AppProvider>
        <AppContent>{props.children}</AppContent>
      </AppProvider>
    }
  >
    <BetaGate />
  </Show>
);

const App: Component = () => (
  <Router root={AppShell}>
    <Route path="/"         component={SwapPage} />
    <Route path="/balance"  component={BalancesPage} />
    <Route path="/history"  component={HistoryPage} />
    <Route path="/automate" component={AutomatePage} />
    <Route path="/earn"     component={EarnPage} />
    {/* Fallback: any unknown path lands on the swap page */}
    <Route path="*"         component={SwapPage} />
  </Router>
);

export default App;
