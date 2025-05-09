import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import MainLayout from "@/components/layout/MainLayout";

export default function NotFound() {
  return (
    <MainLayout>
      <div className="min-h-[80vh] w-full flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2 items-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <h1 className="text-2xl font-bold">Página não encontrada</h1>
            </div>

            <p className="mt-4 text-sm text-muted-foreground mb-6">
              A página que você está procurando não existe ou foi removida.
            </p>

            <Link href="/">
              <Button className="w-full flex items-center justify-center">
                <Home className="h-4 w-4 mr-2" /> Voltar para o início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
