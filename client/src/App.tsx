import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ElectionProvider } from "@/context/ElectionContext";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import StudentDashboardPage from "@/pages/StudentDashboardPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import VotingPage from "@/pages/VotingPage";
import ElectionResultsPage from "@/pages/ElectionResultsPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={StudentDashboardPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/vote/:id" component={VotingPage} />
      <Route path="/admin/elections/results/:id" component={ElectionResultsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ElectionProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ElectionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
