import { Component, Show, Suspense, ErrorBoundary, createSignal, createEffect, onMount, lazy, type JSX } from "solid-js";
import { Router, Route, useLocation } from "@solidjs/router";
import { AppProvider, useApp } from "./stores/app";
import Toast from "./components/ui/Toast";
import TabLayout from "./components/layout/TabLayout";
import BackButtonHandler from "./components/layout/BackButtonHandler";
import Skeleton from "./components/ui/Skeleton";
import SwapPage from "./pages/SwapPage";
import BetaGate from "./components/layout/BetaGate";
import RouteErrorFallback from "./components/layout/RouteErrorFallback";
import { BETA_MODE, isTester, markTester } from "./config/flags";
import { keysForTab, revalidateStale } from "./lib/refresh";
import splash from "./components/layout/Splash.module.css";

// Persist tester access via ?tester=1 URL param (checked once at module load).
if (typeof window !== "undefined") {
  const params = new URLSearchParams(window.location.search);
  if (params.get("tester") === "1") markTester();
}

const BalancesPage = lazy(() => import("./pages/BalancesPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const AutomatePage = lazy(() => import("./pages/AutomatePage"));
const InvitePage = lazy(() => import("./pages/InvitePage"));

const TAB_PATHS = ["/", "/balance", "/history", "/automate", "/invite"];

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

// Keep-alive tab host. A single catch-all route renders this once; it never
// unmounts. Each tab's page is mounted the first time that tab is opened and
// then kept in the tree — switching tabs just flips CSS visibility, so scroll
// position, form inputs, and in-flight state survive a switch.
const TabHost: Component = () => {
  const location = useLocation();
  const activePath = () => (TAB_PATHS.includes(location.pathname) ? location.pathname : "/");

  const [mounted, setMounted] = createSignal<Set<string>>(new Set([activePath()]));
  createEffect(() => {
    const p = activePath();
    if (!mounted().has(p)) setMounted((prev) => new Set(prev).add(p));
  });

  // Pages never unmount in the keep-alive shell, so switching back to a tab
  // won't refetch on its own. When a tab is shown, revalidate its data if
  // it's gone stale — the TTL guard skips a tab just visited.
  createEffect(() => {
    revalidateStale(keysForTab(activePath()), 20_000);
  });

  const panel = (path: string, Page: Component) => (
    <Show when={mounted().has(path)}>
      <div style={{ display: activePath() === path ? undefined : "none" }}>
        <ErrorBoundary fallback={(err, reset) => <RouteErrorFallback err={err} reset={reset} />}>
          <Suspense fallback={<div class={splash.suspense}><Skeleton rows={5} /></div>}>
            <Page />
          </Suspense>
        </ErrorBoundary>
      </div>
    </Show>
  );

  return (
    <TabLayout>
      {panel("/", SwapPage)}
      {panel("/balance", BalancesPage)}
      {panel("/history", HistoryPage)}
      {panel("/automate", AutomatePage)}
      {panel("/invite", InvitePage)}
    </TabLayout>
  );
};

// AppContent gates the tab host behind the splash until the app is ready.
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

  // Warm the lazy route chunks during idle time so the first switch to a
  // tab doesn't pay a network fetch.
  onMount(() => {
    const warm = () => {
      BalancesPage.preload();
      HistoryPage.preload();
      AutomatePage.preload();
      InvitePage.preload();
    };
    if ("requestIdleCallback" in window) requestIdleCallback(warm);
    else setTimeout(warm, 2000);
  });

  return (
    <>
      <BackButtonHandler />
      <Show when={showSplash()}>
        <Splash fadeOut={fadeOut()} />
      </Show>
      <Show when={isReady()}>
        {props.children}
      </Show>
      <Toast />
    </>
  );
};

// Router shell — chooses between the beta gate and the real app.
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

// One catch-all route: the tab host owns all five tabs and stays mounted.
// The URL still changes per tab (back button, deep links keep working) —
// it just no longer drives mount/unmount.
const App: Component = () => (
  <Router root={AppShell}>
    <Route path="*" component={TabHost} />
  </Router>
);

export default App;
