import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import NewBudgetPage from "@/pages/NewBudgetPage";
import SavedBudgetsPage from "@/pages/SavedBudgetsPage";
import ClientsPage from "@/pages/ClientsPage";
import ProjectsPage from "@/pages/ProjectsPage";
import MainLayout from "@/components/layout/MainLayout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/budget/new" component={NewBudgetPage} />
      <Route path="/budget/saved" component={SavedBudgetsPage} />
      <Route path="/clients" component={ClientsPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MainLayout>
          <Router />
        </MainLayout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
