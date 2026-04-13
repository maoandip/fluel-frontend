/* @refresh reload */
import { render } from "solid-js/web";
import { lazy } from "solid-js";
import { Router, Route } from "@solidjs/router";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import "./styles/global.css";

// Lazy-load non-landing pages for smaller initial bundle
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Feedback = lazy(() => import("./pages/Feedback"));
const Chains = lazy(() => import("./pages/Chains"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const GuideList = lazy(() => import("./pages/guides/GuideList"));
const GuidePage = lazy(() => import("./pages/guides/GuidePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

render(() => (
  <Router root={Layout}>
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
), root);
