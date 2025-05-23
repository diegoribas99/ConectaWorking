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
import CollaboratorsPageNew from "@/pages/CollaboratorsPageNew";
import CollaboratorsPageCollapsible from "@/pages/CollaboratorsPageCollapsible";
import CollaboratorsPageSimple from "@/pages/CollaboratorsPageSimple";
import GamificationPage from "@/pages/GamificationPage";
import CoursesPage from "@/pages/CoursesPage";
import ConectaPremiumPage from "@/pages/ConectaPremiumPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import InactivePlanPage from "@/pages/InactivePlanPage";
import ImageEditorPage from "@/pages/ImageEditorPage";
import ImageEditorNew from "@/pages/ImageEditorNew";
// Video conferencing pages
import VideoconferencePage from "@/pages/VideoconferencePage";
import MeetingDetailsPage from "@/pages/MeetingDetailsPage";
import JoinMeetingPage from "@/pages/JoinMeetingPage";
// Blog pages
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import BlogCategoryPage from "@/pages/BlogCategoryPage";
import BlogTagPage from "@/pages/BlogTagPage";
import BlogAdminPage from "@/pages/BlogAdminPage";
import BlogPostEditorPage from "@/pages/BlogPostEditorPage";
import BlogPostEditorPageDragDrop from "@/pages/BlogPostEditorPageDragDrop";
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
  <OfficeCostsPage />
);

const CollaboratorsPageWithLayout = () => (
  <MainLayout>
    <CollaboratorsPage />
  </MainLayout>
);

const CollaboratorsPageNewWithLayout = () => <CollaboratorsPageNew />;

const CollaboratorsPageCollapsibleWithLayout = () => <CollaboratorsPageCollapsible />;

const CollaboratorsPageSimpleWithLayout = () => <CollaboratorsPageSimple />;

const GamificationPageWithLayout = () => (
  <MainLayout>
    <GamificationPage />
  </MainLayout>
);

// Componente da página de Cursos com layout
const CoursesPageWithLayout = () => (
  <MainLayout>
    <CoursesPage />
  </MainLayout>
);

// Componente da página Cursos Netflix com layout
import NetflixCoursesPage from '@/pages/NetflixCoursesPage';
import CourseDetailsPage from '@/pages/CourseDetailsPage';
import CourseLessonPage from '@/pages/CourseLessonPage';
import CoursePlaylistsPage from '@/pages/CoursePlaylistsPage';
import CourseReviewsPage from '@/pages/CourseReviewsPage';
import CertificatesPage from '@/pages/CertificatesPage';
import CommunityPage from '@/pages/CommunityPage';
import CommunityProfilePage from '@/pages/CommunityProfilePage';

const NetflixCoursesPageWithLayout = () => (
  <MainLayout hideNativePadding={true}>
    <NetflixCoursesPage />
  </MainLayout>
);

const CourseDetailsPageWithLayout = () => (
  <MainLayout hideNativePadding={true}>
    <CourseDetailsPage />
  </MainLayout>
);

const CourseLessonPageWithLayout = () => (
  <MainLayout>
    <CourseLessonPage />
  </MainLayout>
);

const CoursePlaylistsPageWithLayout = () => (
  <MainLayout>
    <CoursePlaylistsPage />
  </MainLayout>
);

const CourseReviewsPageWithLayout = () => (
  <MainLayout>
    <CourseReviewsPage />
  </MainLayout>
);

const CertificatesPageWithLayout = () => (
  <MainLayout>
    <CertificatesPage />
  </MainLayout>
);

const CommunityPageWithLayout = () => (
  <MainLayout>
    <CommunityPage />
  </MainLayout>
);

const CommunityProfilePageWithLayout = () => (
  <MainLayout>
    <CommunityProfilePage />
  </MainLayout>
);

// Componente da página ConectaPremium com layout
const ConectaPremiumPageWithLayout = () => (
  <MainLayout hideNativePadding={true}>
    <ConectaPremiumPage />
  </MainLayout>
);

// Componente Image Editor
// Editor de imagens com layout
const ImageEditorPageWithLayout = () => <ImageEditorPage />;
const ImageEditorNewWithLayout = () => <ImageEditorNew />;

// Videoconferência components com layout
const VideoconferencePageWithLayout = () => (
  <MainLayout>
    <VideoconferencePage />
  </MainLayout>
);
const MeetingDetailsPageWithLayout = () => (
  <MainLayout>
    <MeetingDetailsPage />
  </MainLayout>
);
const JoinMeetingPageWithLayout = () => (
  <MainLayout>
    <JoinMeetingPage />
  </MainLayout>
);

// Blog components com layout
const BlogPageWithLayout = () => <BlogPage />;
const BlogPostPageWithLayout = () => <BlogPostPage />;
const BlogCategoryPageWithLayout = () => <BlogCategoryPage />;
const BlogTagPageWithLayout = () => <BlogTagPage />;
const BlogAdminPageWithLayout = () => <BlogAdminPage />;
const BlogPostEditorPageWithLayout = () => <BlogPostEditorPage />;
const BlogPostEditorPageDragDropWithLayout = () => <BlogPostEditorPageDragDrop />;

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
      <Route path="/collaborators-collapsible">
        <ProtectedRoute component={CollaboratorsPageCollapsibleWithLayout} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      <Route path="/gamification">
        <ProtectedRoute component={GamificationPageWithLayout} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      
      <Route path="/cursos">
        <ProtectedRoute component={CoursesPageWithLayout} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      
      <Route path="/cursos-netflix">
        <ProtectedRoute component={NetflixCoursesPageWithLayout} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      
      <Route path="/cursos/playlists">
        <ProtectedRoute component={CoursePlaylistsPageWithLayout} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      
      <Route path="/cursos/avaliacoes">
        <ProtectedRoute component={CourseReviewsPageWithLayout} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      
      <Route path="/cursos/certificados">
        <ProtectedRoute component={CertificatesPageWithLayout} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      
      <Route path="/comunidade">
        <ProtectedRoute component={CommunityPageWithLayout} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      
      <Route path="/comunidade/perfil">
        <ProtectedRoute component={CommunityProfilePageWithLayout} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      
      <Route path="/cursos/:slug">
        <ProtectedRoute component={CourseDetailsPageWithLayout} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      
      <Route path="/cursos/:courseSlug/aula/:lessonId">
        <ProtectedRoute component={CourseLessonPageWithLayout} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      
      <Route path="/conectapremium">
        <ProtectedRoute component={ConectaPremiumPageWithLayout} allowedRoles={['pro', 'premium', 'vip', 'admin']} />
      </Route>
      
      {/* Image Editor Routes */}
      <Route path="/image-editor">
        <ProtectedRoute component={ImageEditorPageWithLayout} allowedRoles={['premium', 'vip', 'admin']} />
      </Route>
      <Route path="/image-editor-new">
        <ProtectedRoute component={ImageEditorNewWithLayout} allowedRoles={['premium', 'vip', 'admin']} />
      </Route>
      
      {/* Video Conference Routes */}
      <Route path="/videoconferencia/join/:roomId">
        <ProtectedRoute component={JoinMeetingPageWithLayout} allowedRoles={['premium', 'vip', 'admin']} />
      </Route>
      <Route path="/videoconferencia/edit/:id">
        <ProtectedRoute component={VideoconferencePageWithLayout} allowedRoles={['premium', 'vip', 'admin']} />
      </Route>
      <Route path="/videoconferencia/:id">
        <ProtectedRoute component={MeetingDetailsPageWithLayout} allowedRoles={['premium', 'vip', 'admin']} />
      </Route>
      <Route path="/videoconferencia">
        <ProtectedRoute component={VideoconferencePageWithLayout} allowedRoles={['premium', 'vip', 'admin']} />
      </Route>
      
      {/* Blog Routes */}
      <Route path="/blog" component={BlogPageWithLayout} />
      <Route path="/blog/:slug" component={BlogPostPageWithLayout} />
      <Route path="/blog/categoria/:slug" component={BlogCategoryPageWithLayout} />
      <Route path="/blog/tag/:slug" component={BlogTagPageWithLayout} />
      
      {/* Blog Admin Routes - protected */}
      <Route path="/blog/admin">
        <ProtectedRoute component={BlogAdminPageWithLayout} allowedRoles={['admin']} />
      </Route>
      <Route path="/blog/admin/post/new">
        <ProtectedRoute component={BlogPostEditorPageWithLayout} allowedRoles={['admin']} />
      </Route>
      <Route path="/blog/admin/post/edit/:id">
        <ProtectedRoute component={BlogPostEditorPageWithLayout} allowedRoles={['admin']} />
      </Route>
      <Route path="/blog/admin/post/novo">
        <ProtectedRoute component={BlogPostEditorPageDragDropWithLayout} allowedRoles={['admin']} />
      </Route>
      <Route path="/blog/admin/post/editar/:id">
        <ProtectedRoute component={BlogPostEditorPageDragDropWithLayout} allowedRoles={['admin']} />
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
