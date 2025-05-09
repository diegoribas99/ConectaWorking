import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Plus, 
  ChevronRight, 
  Loader, 
  FileText, 
  Users, 
  Database, 
  DollarSign, 
  PieChart as PieChartIcon, 
  CheckCircle2
} from 'lucide-react';

// Types
interface Dashboard {
  statistics: {
    collaborators: number;
    users: number;
    officeCosts: {
      fixedCosts: number;
      variableCosts: number;
      totalCosts: number;
      productiveHoursMonth: number;
    } | null;
  };
  collaborators: Array<{
    id: number;
    name: string;
    role: string;
    hourlyRate: number;
    city: string | null;
  }>;
  budgetTypes: Array<{
    name: string;
    value: number;
  }>;
  databaseStats: {
    tables: string[];
    counts: {
      users: number;
      collaborators: number;
    };
  };
}

// Sample data while API is loading
const initialDashboardData: Dashboard = {
  statistics: {
    collaborators: 0,
    users: 0,
    officeCosts: null
  },
  collaborators: [],
  budgetTypes: [],
  databaseStats: {
    tables: [],
    counts: {
      users: 0,
      collaborators: 0
    }
  }
};

const Dashboard: React.FC = () => {
  // Fetch dashboard data
  const { data: dashboardData = initialDashboardData, isLoading } = useQuery<Dashboard>({
    queryKey: ['/api/dashboard'],
    retry: 1,
    queryFn: async () => {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return await res.json();
    },
  });

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  // Chart colors from Tailwind config
  const COLORS = ['#FFD600', '#3B82F6', '#10B981', '#EC4899'];

  return (
    <MainLayout>
      <div>
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Acompanhe seus orçamentos e desempenho</p>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-md bg-gradient-to-br from-transparent to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Users className="h-4 w-4 mr-2 text-primary" /> Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.statistics.users}</div>
              <div className="text-xs text-muted-foreground mt-1">Usuários cadastrados</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-gradient-to-br from-transparent to-yellow-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Users className="h-4 w-4 mr-2 text-yellow-500" /> Colaboradores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.statistics.collaborators}</div>
              <div className="text-xs text-muted-foreground mt-1">Equipe e freelancers</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-gradient-to-br from-transparent to-green-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Custo Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dashboardData.statistics.officeCosts 
                  ? formatCurrency(dashboardData.statistics.officeCosts.totalCosts) 
                  : "R$ 0,00"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Custos fixos + variáveis</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Collaborators List */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" /> Colaboradores Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : dashboardData.collaborators.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum colaborador cadastrado ainda.</p>
                  <Link href="/collaborators">
                    <div className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors">
                      Adicionar Colaborador
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.collaborators.map(collaborator => (
                    <div key={collaborator.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md border border-border/50 hover:bg-secondary transition-colors">
                      <div>
                        <div className="font-medium">{collaborator.name}</div>
                        <div className="text-sm text-muted-foreground">{collaborator.role}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(collaborator.hourlyRate)}/h</div>
                          <div className="text-xs text-muted-foreground">
                            {collaborator.city || 'Sem cidade'}
                          </div>
                        </div>
                        <Link href={`/collaborators?id=${collaborator.id}`}>
                          <div className="p-2 text-primary hover:text-primary/80 cursor-pointer">
                            <ChevronRight className="h-5 w-5" />
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/collaborators">
                <div className="text-primary hover:underline cursor-pointer">Ver todos os colaboradores</div>
              </Link>
            </CardFooter>
          </Card>

          {/* Budget Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChartIcon className="h-4 w-4 mr-2 text-primary" /> Distribuição por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : dashboardData.budgetTypes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Sem dados para exibir</p>
                </div>
              ) : (
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%" aspect={window.innerWidth < 768 ? 1 : 2}>
                    <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <Pie
                        data={dashboardData.budgetTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={window.innerWidth < 500 ? 60 : 80}
                        innerRadius={window.innerWidth < 500 ? 20 : 30}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {dashboardData.budgetTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${value} orçamentos`, '']}
                        contentStyle={{ background: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '4px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend layout={window.innerWidth < 768 ? "horizontal" : "vertical"} align="center" verticalAlign="bottom" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Database Stats */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-4 w-4 mr-2 text-primary" /> Informações do Banco de Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {dashboardData.databaseStats.tables.map((table, index) => (
                    <div key={index} className="bg-secondary/40 p-4 rounded-lg shadow-sm">
                      <div className="font-medium capitalize">{table.replace('_', ' ')}</div>
                      <div className="text-2xl font-bold mt-1">
                        {table === 'users' ? dashboardData.databaseStats.counts.users : 
                         table === 'collaborators' ? dashboardData.databaseStats.counts.collaborators : 
                         '—'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Registros na tabela</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="text-lg font-medium mb-2">Status da Conexão</h3>
                <div className="flex items-center text-green-500 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Conectado ao PostgreSQL via Supabase</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  A plataforma está utilizando o serviço Supabase para armazenamento de dados persistentes,
                  com os devidos relacionamentos entre tabelas configurados através da ORM Drizzle.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/collaborators">
            <div className="inline-flex items-center px-5 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition shadow-sm cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Gerenciar Colaboradores
            </div>
          </Link>
          <Link href="/office-costs">
            <div className="inline-flex items-center px-5 py-3 bg-secondary text-secondary-foreground font-medium rounded-md hover:bg-secondary/90 transition shadow-sm cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Custos do Escritório
            </div>
          </Link>
          <Link href="/budget/new">
            <div className="inline-flex items-center px-5 py-3 bg-yellow-500 text-white font-medium rounded-md hover:bg-yellow-600 transition shadow-sm cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Novo Orçamento
            </div>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;