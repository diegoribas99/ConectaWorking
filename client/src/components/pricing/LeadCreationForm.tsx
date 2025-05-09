import React, { useState, useEffect } from 'react';
import { ProjectInfoType, CollaboratorType } from '@/lib/useBudgetCalculator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Save, 
  FolderOpen, 
  Users, 
  Search, 
  X, 
  Brain, 
  Upload, 
  Calendar, 
  MapPin, 
  Smartphone, 
  Mail, 
  Building, 
  Flame, 
  Info,
  ArrowRight,
  FileText,
  Image,
  FileCode
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Client } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface LeadCreationFormProps {
  projectInfo: ProjectInfoType;
  updateProjectInfo: (info: Partial<ProjectInfoType>) => void;
  collaborators: CollaboratorType[];
}

// Lista de origens para o lead
const leadSources = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'site', label: 'Site' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'indicacao', label: 'Indicação' },
  { id: 'google', label: 'Google' },
  { id: 'evento', label: 'Evento' },
  { id: 'outros', label: 'Outros' }
];

const LeadCreationForm: React.FC<LeadCreationFormProps> = ({ 
  projectInfo, 
  updateProjectInfo,
  collaborators
}) => {
  const { user } = useAuth();
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isObservationsOpen, setIsObservationsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para o formulário de cliente
  const [showAddressFields, setShowAddressFields] = useState(false);
  const [zipCodeLoading, setZipCodeLoading] = useState(false);
  const [zipCodeError, setZipCodeError] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [leadOrigin, setLeadOrigin] = useState('site');
  const [leadStatus, setLeadStatus] = useState<'quente' | 'morno' | 'frio'>(
    (projectInfo.classification as 'quente' | 'morno' | 'frio') || 'quente'
  );
  
  // Atualizar classificação no estado do projeto quando o status muda
  useEffect(() => {
    updateProjectInfo({ classification: leadStatus });
  }, [leadStatus, updateProjectInfo]);
  
  // Dados simulados de modelos salvos
  const savedModels = [
    { id: 1, name: 'Apartamento Padrão', type: 'residential', deliveryLevel: 'executive', area: 120 },
    { id: 2, name: 'Escritório Básico', type: 'corporate', deliveryLevel: 'basic', area: 80 },
    { id: 3, name: 'Loja Shopping', type: 'retail', deliveryLevel: 'premium', area: 60 }
  ];
  
  // Consulta para buscar clientes
  const { isLoading, data: clients = [] } = useQuery({
    queryKey: ['/api/users/1/clients/search', searchTerm],
    queryFn: () => fetch(`/api/users/1/clients/search?q=${encodeURIComponent(searchTerm)}`)
      .then(res => {
        if (res.status === 401) return [] as Client[];
        if (!res.ok) throw new Error('Erro ao buscar clientes');
        return res.json() as Promise<Client[]>;
      }),
    enabled: isClientDialogOpen,
  });

  // Função para buscar CEP usando a API ViaCEP
  const fetchAddressByCep = async (cep: string) => {
    if (!cep || cep.length !== 8) {
      setZipCodeError('CEP deve ter 8 dígitos');
      return;
    }

    setZipCodeLoading(true);
    setZipCodeError('');

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setZipCodeError('CEP não encontrado');
        return;
      }

      // Atualiza os campos de endereço
      updateProjectInfo({
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf
      });

      setShowAddressFields(true);
    } catch (error) {
      setZipCodeError('Erro ao buscar CEP');
    } finally {
      setZipCodeLoading(false);
    }
  };

  // Manipulador de mudança de CEP
  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 8);
    updateProjectInfo({ zipCode: value });
    
    if (value.length === 8) {
      fetchAddressByCep(value);
    }
  };

  // Manipulador para aplicar um modelo
  const handleApplyModel = (modelId: number) => {
    const selectedModel = savedModels.find(model => model.id === modelId);
    if (selectedModel) {
      updateProjectInfo({
        name: selectedModel.name,
        type: selectedModel.type,
        area: selectedModel.area,
        deliveryLevel: selectedModel.deliveryLevel as 'basic' | 'executive' | 'premium',
      });
      setIsModelDialogOpen(false);
    }
  };
  
  // Manipulador para selecionar um cliente
  const handleSelectClient = (client: Client) => {
    updateProjectInfo({
      clientId: client.id,
      clientName: client.name,
      email: client.email || undefined,
      whatsapp: client.phone || undefined,
      city: client.city || undefined,
    });
    setIsClientDialogOpen(false);
  };
  
  // Manipulador para pesquisar cliente
  const handleSearchClient = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Manipulador para limpar cliente selecionado
  const handleClearClient = () => {
    updateProjectInfo({
      clientId: undefined,
      clientName: '',
      email: '',
      whatsapp: '',
    });
  };

  // Manipulador para seleção de múltiplos arquivos
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...filesArray]);
    }
  };
  
  // Função para remover um arquivo
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Acesso ao toast
  const { toast } = useToast();

  // Manipulador para salvar o lead
  const handleSaveLead = () => {
    // Verificar campos obrigatórios
    if (!projectInfo.clientName) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do cliente é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    if (!projectInfo.name) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do projeto é obrigatório",
        variant: "destructive"
      });
      return;
    }

    // Aqui salvaríamos o lead em um sistema real
    // Adicionando automaticamente:
    // status: "lead"
    // origem: leadOrigin
    // data_criacao: new Date()
    // classificacao: leadStatus (quente, morno ou frio)

    // Exibir feedback de sucesso
    toast({
      title: "Lead salvo com sucesso!",
      description: "Os dados foram enviados para a página de Clientes, na aba 'Leads'.",
      variant: "default"
    });
    
    // Opcionalmente, podemos redirecionar para a página de clientes ou limpar o formulário
  };

  return (
    <>
      <div className="bg-card rounded-lg shadow-sm mb-6 overflow-hidden border border-border">
        {/* Cabeçalho com título e status de lead */}
        <div className="p-5">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-5">
            <h2 className="text-lg font-semibold">Novo Lead / Projeto</h2>
            
            {/* Status do Lead (à direita do título) */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                leadStatus === 'quente' ? 'bg-red-500' : 
                leadStatus === 'morno' ? 'bg-yellow-500' : 'bg-blue-500'
              }`}>
                <Flame className="h-5 w-5 text-white" />
              </div>
              
              <div className="flex gap-1">
                <button
                  type="button"
                  className={`text-xs font-medium rounded-full px-3 py-1 ${
                    leadStatus === 'quente' ? 'bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-300 border-2 border-red-500' : 
                    'bg-red-100/50 text-red-900/70 dark:bg-red-900/10 dark:text-red-300/70 border border-transparent'
                  }`}
                  onClick={() => setLeadStatus('quente')}
                >
                  Quente
                </button>
                <button
                  type="button"
                  className={`text-xs font-medium rounded-full px-3 py-1 ${
                    leadStatus === 'morno' ? 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-300 border-2 border-yellow-500' : 
                    'bg-yellow-100/50 text-yellow-900/70 dark:bg-yellow-900/10 dark:text-yellow-300/70 border border-transparent'
                  }`}
                  onClick={() => setLeadStatus('morno')}
                >
                  Morno
                </button>
                <button
                  type="button"
                  className={`text-xs font-medium rounded-full px-3 py-1 ${
                    leadStatus === 'frio' ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300 border-2 border-blue-500' : 
                    'bg-blue-100/50 text-blue-900/70 dark:bg-blue-900/10 dark:text-blue-300/70 border border-transparent'
                  }`}
                  onClick={() => setLeadStatus('frio')}
                >
                  Frio
                </button>
              </div>
            </div>
          </div>
          
          {/* Barra de Ações */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button 
              className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
              onClick={() => setShowFileUpload(!showFileUpload)}
            >
              <Upload className="h-4 w-4 mr-2" /> 
              Anexar Arquivos
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setIsClientDialogOpen(true)}
              className="flex items-center justify-center gap-1"
            >
              <Users className="h-4 w-4" /> Importar Cliente
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setIsModelDialogOpen(true)}
              className="flex items-center justify-center gap-1"
            >
              <FolderOpen className="h-4 w-4" /> Usar Modelo
            </Button>
          </div>
          
          {/* Conteúdo em uma coluna vertical */}
          <div className="space-y-6">
            {/* Informações do Cliente */}
            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-md">
              <h3 className="text-sm font-semibold mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2" /> Informações do Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
                    placeholder="Ex: João Silva" 
                    value={projectInfo.clientName || ''} 
                    onChange={(e) => updateProjectInfo({ clientName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">WhatsApp</label>
                  <div className="flex relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 pl-9 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
                      placeholder="(00) 00000-0000"
                      value={projectInfo.whatsapp || ''} 
                      onChange={(e) => updateProjectInfo({ whatsapp: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">E-mail</label>
                  <div className="flex relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                      type="email" 
                      className="w-full px-3 py-2 pl-9 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
                      placeholder="email@exemplo.com"
                      value={projectInfo.email || ''} 
                      onChange={(e) => updateProjectInfo({ email: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Origem</label>
                  <select 
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                    value={leadOrigin}
                    onChange={(e) => setLeadOrigin(e.target.value)}
                  >
                    {leadSources.map(source => (
                      <option key={source.id} value={source.id}>{source.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Informações do Projeto */}
            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-md">
              <h3 className="text-sm font-semibold mb-3 flex items-center">
                <Building className="h-4 w-4 mr-2" /> Informações do Projeto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Projeto <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
                    placeholder="Ex: Apartamento Jardins" 
                    value={projectInfo.name} 
                    onChange={(e) => updateProjectInfo({ name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Colaborador Responsável</label>
                  <select 
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                    value={projectInfo.responsibleId || ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const responsible = collaborators.find(c => c.id === id);
                      updateProjectInfo({ 
                        responsibleId: id,
                        responsibleName: responsible?.name 
                      });
                    }}
                  >
                    <option value="">Selecione um colaborador</option>
                    {collaborators.map(collaborator => (
                      <option key={collaborator.id} value={collaborator.id}>
                        {collaborator.name}
                      </option>
                    ))}
                  </select>
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
                    <option value="reform">Reforma</option>
                    <option value="interior">Interiores</option>
                    <option value="other">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Área Aproximada (m²)</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
                    placeholder="Ex: 120" 
                    value={projectInfo.area || ''}
                    onChange={(e) => updateProjectInfo({ area: Number(e.target.value) })}
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="urgency" 
                      className="h-4 w-4 rounded border-gray-300 text-[#FFD600] focus:ring-[#FFD600]"
                      checked={projectInfo.urgency || false}
                      onChange={(e) => updateProjectInfo({ urgency: e.target.checked })}
                    />
                    <label htmlFor="urgency" className="ml-2 text-sm font-medium">Projeto Urgente</label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Observações para IA */}
            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-md">
              <h3 className="text-sm font-semibold mb-3 flex items-center">
                <Brain className="h-4 w-4 mr-2" /> Observações para IA
              </h3>
              <textarea 
                className="w-full h-24 px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                placeholder="Adicione observações que serão analisadas pela IA na criação da proposta..."
                value={projectInfo.observations || ''}
                onChange={(e) => updateProjectInfo({ observations: e.target.value })}
              ></textarea>
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3 mr-1" />
                Estas observações serão utilizadas pela IA para geração de insights.
              </div>
            </div>
            
            {/* Upload de Arquivos */}
            {showFileUpload && (
              <div className="bg-black/5 dark:bg-white/5 p-4 rounded-md">
                <h3 className="text-sm font-semibold mb-3 flex items-center">
                  <Upload className="h-4 w-4 mr-2" /> Anexar Arquivos
                </h3>
                <div 
                  className="border-2 border-dashed border-[#FFD600] rounded-md p-6 mb-3 bg-[#FFD600]/5 transition-all"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.add('border-[#FFD600]', 'bg-[#FFD600]/10');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove('border-[#FFD600]', 'bg-[#FFD600]/10');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove('border-[#FFD600]', 'bg-[#FFD600]/10');
                    
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const filesArray = Array.from(e.dataTransfer.files);
                      setUploadedFiles(prev => [...prev, ...filesArray]);
                    }
                  }}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.dwg,.skp"
                    multiple
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <Upload className="h-10 w-10 text-[#FFD600]" />
                    <span className="text-sm font-medium">
                      Clique para selecionar arquivos
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ou arraste e solte arquivos aqui
                    </span>
                    <span className="text-xs text-muted-foreground mt-1 bg-[#FFD600]/10 px-2 py-1 rounded-full">
                      Aceita PDF, JPG, DWG, SKP (máx. 10MB)
                    </span>
                  </label>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">Arquivos anexados</h4>
                    {uploadedFiles.map((file, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between bg-background p-2 rounded-md border border-border"
                      >
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded flex items-center justify-center mr-2 ${
                              file.name.endsWith('.pdf') ? 'bg-red-500/10 text-red-500' : 
                              file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.png') ? 'bg-green-500/10 text-green-500' :
                              file.name.endsWith('.dwg') || file.name.endsWith('.skp') ? 'bg-blue-500/10 text-blue-500' : 
                              'bg-[#FFD600]/10 text-[#FFD600]'
                            }`}
                          >
                            {file.name.endsWith('.pdf') ? <FileText className="h-4 w-4" /> : 
                             file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.png') ? <Image className="h-4 w-4" /> :
                             file.name.endsWith('.dwg') || file.name.endsWith('.skp') ? <FileCode className="h-4 w-4" /> : 
                             <FileText className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate max-w-[180px]">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Botão de ação */}
          <div className="flex justify-between mt-6">
            <Button 
              className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
              onClick={() => setShowFileUpload(!showFileUpload)}
            >
              <Upload className="h-4 w-4 mr-2" /> 
              Anexar Arquivos
            </Button>
            
            <Button 
              className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black px-6"
              onClick={handleSaveLead}
            >
              <Save className="h-4 w-4 mr-2" /> Salvar Lead
            </Button>
          </div>
          
          {/* Endereço - Movido para o final */}
          <div className="mt-6">
            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold flex items-center">
                  <MapPin className="h-4 w-4 mr-2" /> Endereço
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAddressFields(!showAddressFields)}
                  className="text-xs"
                >
                  {showAddressFields ? 'Esconder' : 'Mostrar'} campos
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">CEP</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      maxLength={8}
                      className={`w-full px-3 py-2 bg-background border ${zipCodeError ? 'border-red-500' : 'border-border'} rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]`}
                      placeholder="00000-000" 
                      value={projectInfo.zipCode || ''}
                      onChange={handleZipCodeChange}
                    />
                    {zipCodeLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-[#FFD600] border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                  {zipCodeError && <p className="text-red-500 text-xs mt-1">{zipCodeError}</p>}
                </div>
                
                {showAddressFields && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Rua / Logradouro</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
                        placeholder="Av. Paulista"
                        value={projectInfo.street || ''}
                        onChange={(e) => updateProjectInfo({ street: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Número</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
                        placeholder="123"
                        value={projectInfo.number || ''}
                        onChange={(e) => updateProjectInfo({ number: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Complemento</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
                        placeholder="Apto 101, Bloco B"
                        value={projectInfo.complement || ''}
                        onChange={(e) => updateProjectInfo({ complement: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Bairro</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
                        placeholder="Centro"
                        value={projectInfo.neighborhood || ''}
                        onChange={(e) => updateProjectInfo({ neighborhood: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Cidade</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
                        placeholder="São Paulo"
                        value={projectInfo.city || ''}
                        onChange={(e) => updateProjectInfo({ city: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Estado</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
                        placeholder="SP"
                        maxLength={2}
                        value={projectInfo.state || ''}
                        onChange={(e) => updateProjectInfo({ state: e.target.value.toUpperCase() })}
                      />
                    </div>
                  </>
                )}
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
      
      {/* Dialog para buscar cliente */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Importar Cliente</DialogTitle>
            <DialogDescription>
              Busque e selecione um cliente para este projeto.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente por nome, telefone ou email..."
                className="pl-9"
                value={searchTerm}
                onChange={handleSearchClient}
              />
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="p-6 text-center text-muted-foreground">
                  Carregando clientes...
                </div>
              ) : clients && clients.length > 0 ? (
                clients.map((client: Client) => (
                  <div
                    key={client.id}
                    className="p-3 border border-border rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => handleSelectClient(client)}
                  >
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center justify-between">
                      <div className="flex flex-col text-xs">
                        {client.company && <span>{client.company}</span>}
                        {client.email && <span>{client.email}</span>}
                      </div>
                      {client.city && (
                        <span className="text-xs bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">
                          {client.city} {client.state ? `- ${client.state}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : searchTerm ? (
                <div className="p-6 text-center text-muted-foreground">
                  Nenhum cliente encontrado para "{searchTerm}".
                </div>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  Busque por nome, email ou telefone.
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClientDialogOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LeadCreationForm;