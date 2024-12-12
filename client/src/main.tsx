import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route, useLocation } from "wouter";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useAuthStore } from "./lib/authStore";
import Layout from "./components/layout";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import Workout from "./pages/Workout";
import MyPage from "./pages/MyPage";
import Notifications from "./pages/support/Notifications";
import FAQ from "./pages/support/FAQ";
import Contact from "./pages/support/Contact";
import AccountSettings from "./pages/support/AccountSettings";
import PlanDetails from "./pages/subscription/PlanDetails";
import Checkout from "./pages/subscription/Checkout";
import { Terms } from "./pages/support/Terms";
import { Privacy } from "./pages/support/Privacy";
import { DiaryPage } from "./pages/DiaryPage";
import { MonthlySummaryPage } from "./pages/MonthlySummaryPage";
import { TomorrowPlanPage } from "./pages/TomorrowPlanPage";

const ProtectedRoute = ({ component: Component }: { component: React.ComponentType }) => {
  const { isAuthenticated } = useAuthStore();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    setLocation('/auth');
    return null;
  }

  return <Component />;
};

function Router() {
  return (
    <>
      <Route path="/auth">
        <div className="min-h-screen bg-background">
          <Auth />
        </div>
      </Route>
      <Layout>
        <Switch>
          <Route path="/welcome">
            <ProtectedRoute component={Welcome} />
          </Route>
          <Route path="/">
            <ProtectedRoute component={Welcome} />
          </Route>
          <Route path="/home">
            <ProtectedRoute component={Home} />
          </Route>
          <Route path="/workout">
            <ProtectedRoute component={Workout} />
          </Route>
          <Route path="/mypage">
            <ProtectedRoute component={MyPage} />
          </Route>
          <Route path="/support/notifications">
            <ProtectedRoute component={Notifications} />
          </Route>
          <Route path="/support/faq">
            <ProtectedRoute component={FAQ} />
          </Route>
          <Route path="/support/contact">
            <ProtectedRoute component={Contact} />
          </Route>
          <Route path="/support/account-settings">
            <ProtectedRoute component={AccountSettings} />
          </Route>
          <Route path="/subscription/:planId">
            <ProtectedRoute component={PlanDetails} />
          </Route>
          <Route path="/subscription/checkout/:planId">
            <ProtectedRoute component={Checkout} />
          </Route>
          <Route path="/support/terms">
            <ProtectedRoute component={Terms} />
          </Route>
          <Route path="/support/privacy">
            <ProtectedRoute component={Privacy} />
          </Route>
          <Route path="/diary">
            <ProtectedRoute component={DiaryPage} />
          </Route>
          <Route path="/monthly-summary">
            <ProtectedRoute component={MonthlySummaryPage} />
          </Route>
          <Route path="/tomorrow-plan">
            <ProtectedRoute component={TomorrowPlanPage} />
          </Route>
          <Route>
            <Welcome />
          </Route>
        </Switch>
      </Layout>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);
