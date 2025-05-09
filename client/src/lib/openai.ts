// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

/**
 * Serviço para comunicação com a API da OpenAI
 * 
 * Este arquivo contém funções para interagir com os modelos de IA da OpenAI,
 * utilizados para análise de clientes, geração de sugestões para projetos,
 * análise de perfil, entre outros recursos de IA na plataforma.
 */

// URL base para a API da OpenAI
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Função para analisar o perfil de um cliente e retornar insights
 * 
 * @param clientData Dados do cliente para análise
 * @returns Objeto com análise e sugestões
 */
export async function analyzeClientProfile(clientData: any) {
  const prompt = `
    Analise o perfil deste cliente de arquitetura/design de interiores e forneça insights úteis:
    
    Nome: ${clientData.name}
    Email: ${clientData.email}
    Telefone: ${clientData.phone}
    Endereço: ${clientData.address || 'Não informado'}
    Origem: ${clientData.origin || 'Não informada'}
    Observações: ${clientData.notes || 'Nenhuma observação'}
    
    Forneça as seguintes informações em formato JSON:
    1. Uma análise concisa do perfil do cliente (considerando origem, localização e outras informações disponíveis)
    2. Sugestões de abordagem para melhor atendimento
    3. Possíveis serviços que poderiam interessar o cliente com base no perfil
    4. Recomendações para comunicação (estilo, frequência, canal preferencial)
    
    Responda apenas com o JSON, sem texto introdutório ou explicações adicionais.
  `;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Você é um consultor especializado em marketing e vendas para escritórios de arquitetura e design de interiores." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Erro ao analisar perfil do cliente:", error);
    return {
      error: true,
      message: "Não foi possível analisar o perfil do cliente no momento."
    };
  }
}

/**
 * Função para gerar uma descrição de projeto baseada em características fornecidas
 * 
 * @param projectData Dados do projeto para geração da descrição
 * @returns Objeto com a descrição gerada e sugestões
 */
export async function generateProjectDescription(projectData: any) {
  const prompt = `
    Gere uma descrição profissional para este projeto de arquitetura/design de interiores:
    
    Nome do Projeto: ${projectData.name}
    Cliente: ${projectData.clientName || 'Não informado'}
    Tipo de Projeto: ${projectData.projectType || 'Não informado'}
    Tipo de Propriedade: ${projectData.propertyType || 'Não informado'}
    Área: ${projectData.area || 'Não informada'} m²
    Nível de Detalhe: ${projectData.detailLevel || 'Não informado'}
    Observações Técnicas: ${projectData.technicalNotes || 'Nenhuma observação'}
    
    Forneça as seguintes informações em formato JSON:
    1. Uma descrição profissional e concisa do projeto (em torno de 3-4 parágrafos)
    2. Sugestões de etapas de projeto adequadas para este tipo de trabalho
    3. Materiais e acabamentos que poderiam ser considerados
    4. Possíveis desafios técnicos a serem antecipados
    5. Estimativa de tempo para conclusão (em semanas)
    
    Responda apenas com o JSON, sem texto introdutório ou explicações adicionais.
  `;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Você é um arquiteto experiente especializado em descrições técnicas de projetos." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Erro ao gerar descrição do projeto:", error);
    return {
      error: true,
      message: "Não foi possível gerar a descrição do projeto no momento."
    };
  }
}

/**
 * Função para analisar dados históricos de um cliente e gerar insights
 * 
 * @param clientHistory Histórico de projetos e interações do cliente
 * @returns Objeto com análise e recomendações baseadas no histórico
 */
export async function analyzeClientHistory(clientHistory: any) {
  const prompt = `
    Analise o histórico deste cliente de arquitetura/design de interiores e forneça insights úteis:
    
    Nome do Cliente: ${clientHistory.name}
    Projetos Anteriores: ${JSON.stringify(clientHistory.projects || [])}
    Interações: ${JSON.stringify(clientHistory.interactions || [])}
    Preferências Conhecidas: ${JSON.stringify(clientHistory.preferences || {})}
    
    Forneça as seguintes informações em formato JSON:
    1. Uma análise do histórico do cliente (padrões de projetos, preferências recorrentes)
    2. Oportunidades para novos projetos ou serviços complementares
    3. Recomendações para melhorar o relacionamento e a satisfação
    4. Pontos de atenção baseados em interações passadas
    
    Responda apenas com o JSON, sem texto introdutório ou explicações adicionais.
  `;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Você é um analista de CRM especializado em clientes de arquitetura e design." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Erro ao analisar histórico do cliente:", error);
    return {
      error: true,
      message: "Não foi possível analisar o histórico do cliente no momento."
    };
  }
}

/**
 * Função para sugerir próximas etapas para um projeto em andamento
 * 
 * @param projectData Dados atuais do projeto
 * @returns Objeto com sugestões de próximas etapas
 */
export async function suggestNextSteps(projectData: any) {
  const prompt = `
    Sugira as próximas etapas para este projeto de arquitetura/design de interiores:
    
    Nome do Projeto: ${projectData.name}
    Status Atual: ${projectData.status || 'Em andamento'}
    Etapa Atual: ${projectData.currentStage || 'Não informada'}
    Progresso: ${projectData.progress || '0'}%
    Etapas Concluídas: ${JSON.stringify(projectData.completedStages || [])}
    Etapas Pendentes: ${JSON.stringify(projectData.pendingStages || [])}
    Desafios Atuais: ${projectData.challenges || 'Nenhum desafio informado'}
    
    Forneça as seguintes informações em formato JSON:
    1. Recomendações para as 3 próximas etapas imediatas, com detalhamento
    2. Alertas de possíveis gargalos ou questões a serem resolvidas
    3. Sugestões de recursos ou ferramentas que podem ajudar nas próximas etapas
    4. Recomendações para comunicação com o cliente neste ponto do projeto
    
    Responda apenas com o JSON, sem texto introdutório ou explicações adicionais.
  `;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Você é um gerente de projetos especializado em arquitetura e design de interiores." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Erro ao sugerir próximas etapas:", error);
    return {
      error: true,
      message: "Não foi possível gerar sugestões de próximas etapas no momento."
    };
  }
}