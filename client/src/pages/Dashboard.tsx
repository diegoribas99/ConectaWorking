import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import MainLayout from '@/components/layout/MainLayout';
import { Plus, ChevronRight, Loader, FileText, Save, CheckCircle, BarChart2 } from 'lucide-react';

// Types
interface BudgetSummary {
  total: number;
  drafts: number;
  final: number;
  recentBudgets: Array<{
    id: number;
    name: string;
    value: number;
    date: string;
    status: string;
  }>;
  budgetsByType: Array<{
    name: string;
    value: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    value: number;
  }>;
}

// Sample data while API is loading
const initialSummary: BudgetSummary = {
  total: 0,
  drafts: 0,
  final: 0,
  recentBudgets: [],
  budgetsByType: [],
  revenueByMonth: [],
};

const Dashboard: React.FC = () => {
  // Fetch dashboard data
  const { data: dashboardData = initialSummary, isLoading } = useQuery<BudgetSummary>({
    queryKey: ['/api/dashboard'],
    retry: 1,
    // If the endpoint doesn't exist yet, we'll use mock data
    // In a real app, this would be properly handled on the server
    queryFn: async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        return await res.json();
      } catch (error) {
        // For demo purposes only, we'll return sample data
        return {
          total: 12,
          drafts: 3,
          final: 9,
          recentBudgets: [
            { id: 1, name: "Reforma Apartamento Vila Mariana", value: 15520, date: "2023-08-15", status: "final" },
            { id: 2, name: "Consultório Dr. Cardoso", value: 22340, date: "2023-08-10", status: "final" },
            { id: 3, name: "Loja Concept Store", value: 18750, date: "2023-08-05", status: "draft" },
          ],
          budgetsByType: [
            { name: "Residencial", value: 7 },
            { name: "Comercial", value: 3 },
            { name: "Corporativo", value: 2 },
          ],
          revenueByMonth: [
            { month: "Jan", value: 42000 },
            { month: "Fev", value: 35000 },
            { month: "Mar", value: 58000 },
            { month: "Abr", value: 49000 },
            { month: "Mai", value: 63000 },
            { month: "Jun", value: 78000 },
          ],
        };
      }
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
                <FileText className="h-4 w-4 mr-2 text-primary" /> Total de Orçamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.total}</div>
              <div className="text-xs text-muted-foreground mt-1">Todos os orçamentos criados</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-gradient-to-br from-transparent to-yellow-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Save className="h-4 w-4 mr-2 text-yellow-500" /> Rascunhos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.drafts}</div>
              <div className="text-xs text-muted-foreground mt-1">Orçamentos em elaboração</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-gradient-to-br from-transparent to-green-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Finalizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.final}</div>
              <div className="text-xs text-muted-foreground mt-1">Orçamentos aprovados</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Budgets */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" /> Orçamentos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : dashboardData.recentBudgets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum orçamento criado ainda.</p>
                  <Link href="/budget/new">
                    <div className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors">
                      Criar Orçamento
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentBudgets.map(budget => (
                    <div key={budget.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md border border-border/50 hover:bg-secondary transition-colors">
                      <div>
                        <div className="font-medium">{budget.name}</div>
                        <div className="text-sm text-muted-foreground">{formatDate(budget.date)}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(budget.value)}</div>
                          <div className={`text-xs ${budget.status === 'draft' ? 'text-yellow-500' : 'text-green-500'}`}>
                            {budget.status === 'draft' ? 'Rascunho' : 'Finalizado'}
                          </div>
                        </div>
                        <Link href={`/budget/${budget.id}`}>
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
              <Link href="/budget/saved">
                <div className="text-primary hover:underline cursor-pointer">Ver todos os orçamentos</div>
              </Link>
            </CardFooter>
          </Card>

          {/* Project Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="h-4 w-4 mr-2 text-primary" /> Distribuição por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : dashboardData.budgetsByType.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Sem dados para exibir</p>
                </div>
              ) : (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.budgetsByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dashboardData.budgetsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${value} projetos`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="h-4 w-4 mr-2 text-primary" /> Faturamento por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : dashboardData.revenueByMonth.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Sem dados para exibir</p>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.revenueByMonth}>
                      <XAxis dataKey="month" />
                      <YAxis
                        tickFormatter={(value) => `R$ ${value / 1000}k`}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                      />
                      <Legend />
                      <Bar dataKey="value" name="Faturamento" fill="#FFD600" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <Link href="/budget/new">
            <div className="inline-flex items-center px-5 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition shadow-sm cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Novo Orçamento
            </div>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;