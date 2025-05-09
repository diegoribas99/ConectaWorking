import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider, useAuth, useProtectedRoute } from "@/lib/AuthContext";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import NewBudgetPage from "@/pages/NewBudgetPage";
import SavedBudgetsPage from "@/pages/SavedBudgetsPage";
import ClientsPage from "@/pages/ClientsPage";
import ClientsPageAI from "@/pages/ClientsPageAI";
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectsPageAI from "@/pages/ProjectsPageAI";
import OfficeCostsPage from "@/pages/OfficeCostsPage";
import CollaboratorsPage from "@/pages/CollaboratorsPage";
import CollaboratorsPageNew from "@/pages/CollaboratorsPage.new";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import InactivePlanPage from "@/pages/InactivePlanPage";
import MainLayout from "@/components/layout/MainLayout";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

// Componentes envolvidos com o MainLayout
const NewBudgetPageWithLayout = () => (
  <MainLayout>
    <NewBudgetPage />
  </MainLayout>
);

const SavedBudgetsPageWithLayout = () => (
  <MainLayout>
    <SavedBudgetsPage />
  </MainLayout>
);

const ClientsPageWithLayout = () => (
  <MainLayout>
    <ClientsPage />
  </MainLayout>
);

const ClientsPageAIWithLayout = () => (
  <MainLayout>
    <ClientsPageAI />
  </MainLayout>
);

const ProjectsPageWithLayout = () => (
  <MainLayout>
    <ProjectsPage />
  </MainLayout>
);

const ProjectsPageAIWithLayout = () => (
  <MainLayout>
    <ProjectsPageAI />
  </MainLayout>
);

const OfficeCostsPageWithLayout = () => (
  <MainLayout>
    <OfficeCostsPage />
  </MainLayout>
);

const CollaboratorsPageWithLayout = () => (
  <MainLayout>
    <CollaboratorsPage />
  </MainLayout>
);

const CollaboratorsPageNewWithLayout = () => <CollaboratorsPageNew />;

// Página de dashboard básico para planos gratuitos
const DashboardBasico = () => {
  useProtectedRoute(['gratuito']);
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard Básico</h1>
        <p>Bem-vindo ao plano gratuito da ConectaWorking!</p>
      </div>
    </MainLayout>
  );
};

// Página de dashboard para administradores
const AdminDashboard = () => {
  useProtectedRoute(['admin']);
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard Administrativo</h1>
        <p>Bem-vindo, administrador!</p>
      </div>
    </MainLayout>
  );
};

// Wrapper para rotas protegidas
const ProtectedRoute = ({ component: Component, allowedRoles = [] }: { component: React.ComponentType, allowedRoles?: string[] }) => {
  const { user, loading } = useProtectedRoute(allowedRoles);
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFD600]" />
      </div>
    );
  }
  
  return <Component />;
};

// Router principal
function Router() {
  const { user, loading } = useAuth();
  const [location] = useLocation();
  
  // Lista de rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/cadastro', '/verificar-email'];
  
  // Verificar se o usuário está autenticado, se não estiver, redirecionar para login
  // exceto para rotas públicas
  useEffect(() => {
    if (!loading && !user && !publicRoutes.includes(location)) {
      // Não redirecionar se já estiver em uma rota pública
      // console.log('Redirecionando para login, usuário não autenticado');
    }
  }, [user, loading, location]);
  
  return (
    <Switch>
      {/* Rotas públicas */}
      <Route path="/login" component={LoginPage} />
      <Route path="/cadastro" component={RegisterPage} />
      <Route path="/verificar-email" component={VerifyEmailPage} />
      <Route path="/plano-inativo" component={InactivePlanPage} />
      
      {/* Rotas protegidas por tipo de usuário */}
      <Route path="/admin/dashboard">
        <ProtectedRoute component={AdminDashboard} allowedRoles={['admin']} />
      </Route>
      <Route path="/dashboard-basico">
        <ProtectedRoute component={DashboardBasico} allowedRoles={['gratuito']} />
      </Route>
      <Route path="/">
        <ProtectedRoute component={Dashboard} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      
      
      <Route path="/budget/new">
        <ProtectedRoute component={NewBudgetPageWithLayout} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      <Route path="/budget/saved">
        <ProtectedRoute component={SavedBudgetsPageWithLayout} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      <Route path="/clients">
        <ProtectedRoute component={ClientsPageWithLayout} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      <Route path="/clients-ai">
        <ProtectedRoute component={ClientsPageAIWithLayout} allowedRoles={['premium', 'vip', 'admin']} />
      </Route>
      <Route path="/projects">
        <ProtectedRoute component={ProjectsPageWithLayout} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      <Route path="/projects-ai">
        <ProtectedRoute component={ProjectsPageAIWithLayout} allowedRoles={['premium', 'vip', 'admin']} />
      </Route>
      <Route path="/office-costs">
        <ProtectedRoute component={OfficeCostsPageWithLayout} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      <Route path="/collaborators">
        <ProtectedRoute component={CollaboratorsPageWithLayout} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      <Route path="/collaborators-new">
        <ProtectedRoute component={CollaboratorsPageNewWithLayout} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      
      {/* Fallback para rota não encontrada */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Router />
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
