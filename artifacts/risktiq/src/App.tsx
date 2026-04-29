import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import NotFound from "@/pages/not-found";

import LandingPage from "@/pages/marketing/landing";
import ContactPage from "@/pages/marketing/contact";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import ResetPasswordPage from "@/pages/auth/reset-password";
import DashboardOverviewPage from "@/pages/dashboard/overview";
import TradesPage from "@/pages/dashboard/trades";
import ReportsPage from "@/pages/dashboard/reports";
import ReflectionPage from "@/pages/dashboard/reflection";
import GoalsPage from "@/pages/dashboard/goals";
import ProfilePage from "@/pages/dashboard/profile";
import AdminPage from "@/pages/dashboard/admin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/dashboard" component={DashboardOverviewPage} />
      <Route path="/dashboard/trades" component={TradesPage} />
      <Route path="/dashboard/reports" component={ReportsPage} />
      <Route path="/dashboard/reflection" component={ReflectionPage} />
      <Route path="/dashboard/goals" component={GoalsPage} />
      <Route path="/dashboard/profile" component={ProfilePage} />
      <Route path="/dashboard/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
