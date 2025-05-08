import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import MainLayout from '@/components/layout/MainLayout';
import { Plus, ChevronRight, Loader } from 'lucide-react';

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
      <div className="container mx-auto max-w-7xl p-4 md:p-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Acompanhe seus orçamentos e desempenho</p>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Orçamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rascunhos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.drafts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Finalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.final}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Budgets */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Orçamentos Recentes</CardTitle>
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
                    <a className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md">
                      Criar Orçamento
                    </a>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentBudgets.map(budget => (
                    <div key={budget.id} className="flex items-center justify-between p-3 bg-secondary rounded-md">
                      <div>
                        <div className="font-medium">{budget.name}</div>
                        <div className="text-sm text-muted-foreground">{formatDate(budget.date)}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(budget.value)}</div>
                          <div className={`text-xs ${budget.status === 'draft' ? 'text-warning' : 'text-success'}`}>
                            {budget.status === 'draft' ? 'Rascunho' : 'Finalizado'}
                          </div>
                        </div>
                        <Link href={`/budget/${budget.id}`}>
                          <a className="p-2 text-primary hover:text-primary/80">
                            <ChevronRight className="h-5 w-5" />
                          </a>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/budget/saved">
                <a className="text-primary hover:underline">Ver todos os orçamentos</a>
              </Link>
            </CardFooter>
          </Card>

          {/* Project Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Tipo</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <i className="fa-solid fa-circle-notch fa-spin text-primary text-2xl"></i>
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
              <CardTitle>Faturamento por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <i className="fa-solid fa-circle-notch fa-spin text-primary text-2xl"></i>
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
            <a className="inline-flex items-center px-5 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition shadow-sm">
              <i className="fa-solid fa-plus mr-2"></i> Novo Orçamento
            </a>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
