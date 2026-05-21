/* @refresh reload */
import { render } from "solid-js/web";
import { Suspense, ErrorBoundary, type JSX } from "solid-js";
import { Router, Route } from "@solidjs/router";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import PageSkeleton from "./components/PageSkeleton";
import RouteErrorFallback from "./components/RouteErrorFallback";
import { lazyRoute } from "./lib/lazyRoute";
import "./styles/global.css";

// Lazy-load non-landing pages for a smaller initial bundle. lazyRoute reloads
// once on a stale-chunk failure (hashed filenames change on every deploy).
const HowItWorks = lazyRoute(() => import("./pages/HowItWorks"));
const Terms = lazyRoute(() => import("./pages/Terms"));
const Privacy = lazyRoute(() => import("./pages/Privacy"));
const Feedback = lazyRoute(() => import("./pages/Feedback"));
const Chains = lazyRoute(() => import("./pages/Chains"));
const Roadmap = lazyRoute(() => import("./pages/Roadmap"));
const GuideList = lazyRoute(() => import("./pages/guides/GuideList"));
const GuidePage = lazyRoute(() => import("./pages/guides/GuidePage"));
const NotFound = lazyRoute(() => import("./pages/NotFound"));

// Every route renders inside the same error + suspense boundary, so a throw
// in one page never blanks the header/footer and lazy chunk downloads show
// a skeleton instead of a flash of empty content.
function RouteShell(props: { children: JSX.Element }) {
  return (
    <ErrorBoundary fallback={(err, reset) => <RouteErrorFallback err={err} reset={reset} />}>
      <Suspense fallback={<PageSkeleton />}>{props.children}</Suspense>
    </ErrorBoundary>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

// Clear prerendered content before mounting. render() inserts into the
// element — it does not clear existing children — so without this, the
// prerendered tree stays and render() produces a second tree beside it,
// resulting in a duplicated page (visible as two ._root_ divs inside
// #root). We can't use hydrate() because puppeteer-based prerendering
// doesn't emit Solid's hydration markers.
root.innerHTML = "";

render(
  () => (
    <Router
      root={(props) => (
        <Layout>
          <RouteShell>{props.children}</RouteShell>
        </Layout>
      )}
    >
      <Route path="/" component={Landing} />
      <Route path="/chains" component={Chains} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/roadmap" component={Roadmap} />
      <Route path="/guides" component={GuideList} />
      <Route path="/guides/:slug" component={GuidePage} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/feedback" component={Feedback} />
      <Route path="*" component={NotFound} />
    </Router>
  ),
  root,
);
