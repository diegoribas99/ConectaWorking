import React from 'react';
import { ProjectInfoType } from '@/lib/useBudgetCalculator';

interface ProjectInformationProps {
  projectInfo: ProjectInfoType;
  updateProjectInfo: (info: Partial<ProjectInfoType>) => void;
}

const ProjectInformation: React.FC<ProjectInformationProps> = ({ 
  projectInfo, 
  updateProjectInfo 
}) => {
  return (
    <div className="bg-background rounded-lg shadow-sm mb-6 overflow-hidden">
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center">
          <i className="fa-solid fa-info-circle text-primary mr-2"></i>
          Informações do Projeto
        </h2>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Projeto</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
              placeholder="Ex: Apartamento Jardins" 
              value={projectInfo.name} 
              onChange={(e) => updateProjectInfo({ name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Projeto</label>
            <select 
              className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
              placeholder="Ex: 120" 
              value={projectInfo.area || ''}
              onChange={(e) => updateProjectInfo({ area: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cidade</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
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
                  className={`flex flex-col items-center justify-center p-3 bg-secondary border ${projectInfo.deliveryLevel === 'basic' ? 'border-primary' : 'border-border'} rounded-md cursor-pointer hover:bg-muted transition`}
                >
                  <i className="fa-solid fa-cube text-lg mb-1"></i>
                  <span className="text-sm font-medium">Básico</span>
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
                  className={`flex flex-col items-center justify-center p-3 bg-secondary border ${projectInfo.deliveryLevel === 'executive' ? 'border-primary' : 'border-border'} rounded-md cursor-pointer hover:bg-muted transition`}
                >
                  <i className="fa-solid fa-building text-lg mb-1"></i>
                  <span className="text-sm font-medium">Executivo</span>
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
                  className={`flex flex-col items-center justify-center p-3 bg-secondary border ${projectInfo.deliveryLevel === 'premium' ? 'border-primary' : 'border-border'} rounded-md cursor-pointer hover:bg-muted transition`}
                >
                  <i className="fa-solid fa-crown text-lg mb-1"></i>
                  <span className="text-sm font-medium">Premium</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInformation;
