import React, { useState } from 'react';
import { ProjectInfoType } from '@/lib/useBudgetCalculator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save, FolderOpen } from 'lucide-react';

interface ProjectInformationProps {
  projectInfo: ProjectInfoType;
  updateProjectInfo: (info: Partial<ProjectInfoType>) => void;
}

interface DeliveryLevelPricing {
  basic: number;
  executive: number;
  premium: number;
}

// Valores padrão por metro quadrado para cada tipo de projeto e nível de entrega
const defaultPricing: Record<string, DeliveryLevelPricing> = {
  residential: {
    basic: 80,
    executive: 120,
    premium: 180
  },
  commercial: {
    basic: 100,
    executive: 150,
    premium: 220
  },
  corporate: {
    basic: 120,
    executive: 180,
    premium: 250
  },
  retail: {
    basic: 110,
    executive: 160,
    premium: 230
  },
  hospitality: {
    basic: 130,
    executive: 190,
    premium: 270
  }
};

// Dados dos modelos salvos (simulação)
const savedModels = [
  { id: 1, name: 'Apartamento Padrão', type: 'residential', deliveryLevel: 'basic' },
  { id: 2, name: 'Loja Comercial', type: 'retail', deliveryLevel: 'executive' },
  { id: 3, name: 'Escritório Corporativo', type: 'corporate', deliveryLevel: 'premium' }
];

const ProjectInformation: React.FC<ProjectInformationProps> = ({ 
  projectInfo, 
  updateProjectInfo 
}) => {
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [isSaveModelDialogOpen, setIsSaveModelDialogOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');

  // Obtém o valor por m² baseado no tipo de projeto e nível de entrega
  const getPricePerSqMeter = (type: string, level: 'basic' | 'executive' | 'premium') => {
    return defaultPricing[type]?.[level] || 0;
  };

  // Manipulador para aplicar um modelo
  const handleApplyModel = (modelId: number) => {
    const model = savedModels.find(m => m.id === modelId);
    if (model) {
      updateProjectInfo({
        type: model.type,
        deliveryLevel: model.deliveryLevel as 'basic' | 'executive' | 'premium'
      });
      setIsModelDialogOpen(false);
    }
  };

  // Manipulador para salvar um novo modelo
  const handleSaveModel = () => {
    if (newModelName) {
      // Aqui, em uma implementação real, você salvaria o modelo no backend
      // Por enquanto, apenas mostramos um feedback visual
      alert(`Modelo "${newModelName}" salvo com sucesso!`);
      setNewModelName('');
      setIsSaveModelDialogOpen(false);
    }
  };

  return (
    <>
      <div className="bg-card rounded-lg shadow-sm mb-6 overflow-hidden border border-border">
        <div className="p-5 flex justify-between items-center border-b border-border">
          <h2 className="text-lg font-semibold flex items-center">
            Informações do Projeto
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModelDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <FolderOpen className="h-4 w-4" /> Usar Modelo
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsSaveModelDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Save className="h-4 w-4" /> Salvar Modelo
            </Button>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Projeto</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
                placeholder="Ex: Apartamento Jardins" 
                value={projectInfo.name} 
                onChange={(e) => updateProjectInfo({ name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Projeto</label>
              <select 
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                value={projectInfo.type}
                onChange={(e) => updateProjectInfo({ type: e.target.value })}
              >
                <option value="residential">Residencial</option>
                <option value="commercial">Comercial</option>
                <option value="corporate">Corporativo</option>
                <option value="retail">Loja/Varejo</option>
                <option value="hospitality">Hotelaria</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Área (m²)</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
                placeholder="Ex: 120" 
                value={projectInfo.area || ''}
                onChange={(e) => updateProjectInfo({ area: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cidade</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
                placeholder="Ex: São Paulo" 
                value={projectInfo.city}
                onChange={(e) => updateProjectInfo({ city: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Nível de Entrega</label>
              <div className="grid grid-cols-3 gap-3 mt-1">
                <div className="relative">
                  <input 
                    type="radio" 
                    id="basic" 
                    name="deliveryLevel" 
                    className="absolute opacity-0" 
                    checked={projectInfo.deliveryLevel === 'basic'}
                    onChange={() => updateProjectInfo({ deliveryLevel: 'basic' })}
                  />
                  <label 
                    htmlFor="basic" 
                    className={`flex flex-col items-center justify-center p-3 bg-background border ${projectInfo.deliveryLevel === 'basic' ? 'border-[#FFD600]' : 'border-border'} rounded-md cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition`}
                  >
                    <i className="fa-solid fa-file-lines text-lg mb-1 text-muted-foreground"></i>
                    <span className="text-sm font-medium">Básico</span>
                    <span className="text-xs mt-1 text-muted-foreground">R$ {getPricePerSqMeter(projectInfo.type, 'basic')}/m²</span>
                  </label>
                </div>
                <div className="relative">
                  <input 
                    type="radio" 
                    id="executive" 
                    name="deliveryLevel" 
                    className="absolute opacity-0"
                    checked={projectInfo.deliveryLevel === 'executive'}
                    onChange={() => updateProjectInfo({ deliveryLevel: 'executive' })}
                  />
                  <label 
                    htmlFor="executive" 
                    className={`flex flex-col items-center justify-center p-3 bg-background border ${projectInfo.deliveryLevel === 'executive' ? 'border-[#FFD600]' : 'border-border'} rounded-md cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition`}
                  >
                    <i className="fa-solid fa-file-invoice text-lg mb-1 text-muted-foreground"></i>
                    <span className="text-sm font-medium">Executivo</span>
                    <span className="text-xs mt-1 text-muted-foreground">R$ {getPricePerSqMeter(projectInfo.type, 'executive')}/m²</span>
                  </label>
                </div>
                <div className="relative">
                  <input 
                    type="radio" 
                    id="premium" 
                    name="deliveryLevel" 
                    className="absolute opacity-0"
                    checked={projectInfo.deliveryLevel === 'premium'}
                    onChange={() => updateProjectInfo({ deliveryLevel: 'premium' })}
                  />
                  <label 
                    htmlFor="premium" 
                    className={`flex flex-col items-center justify-center p-3 bg-background border ${projectInfo.deliveryLevel === 'premium' ? 'border-[#FFD600]' : 'border-border'} rounded-md cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition`}
                  >
                    <i className="fa-solid fa-file-shield text-lg mb-1 text-muted-foreground"></i>
                    <span className="text-sm font-medium">Premium</span>
                    <span className="text-xs mt-1 text-muted-foreground">R$ {getPricePerSqMeter(projectInfo.type, 'premium')}/m²</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog para escolher um modelo */}
      <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Selecionar Modelo</DialogTitle>
            <DialogDescription>
              Escolha um modelo para aplicar ao projeto atual.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            {savedModels.map(model => (
              <div 
                key={model.id} 
                className="p-3 border border-border rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                onClick={() => handleApplyModel(model.id)}
              >
                <div className="font-medium">{model.name}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-between">
                  <span>{model.type === 'residential' ? 'Residencial' : 
                         model.type === 'commercial' ? 'Comercial' : 
                         model.type === 'corporate' ? 'Corporativo' : 
                         model.type === 'retail' ? 'Loja/Varejo' : 'Hotelaria'}</span>
                  <span className="bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded text-xs">
                    {model.deliveryLevel === 'basic' ? 'Básico' : 
                     model.deliveryLevel === 'executive' ? 'Executivo' : 'Premium'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModelDialogOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para salvar um modelo */}
      <Dialog open={isSaveModelDialogOpen} onOpenChange={setIsSaveModelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Salvar como Modelo</DialogTitle>
            <DialogDescription>
              Salve as configurações atuais como um modelo para uso futuro.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-1">Nome do Modelo</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
              placeholder="Ex: Apartamento Padrão" 
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveModelDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveModel}>Salvar Modelo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectInformation;
