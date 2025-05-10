import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface MeetingSummaryResult {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  questions: string[];
  decisions: string[];
}

/**
 * Analisa a transcrição de uma reunião usando Claude para gerar um resumo inteligente
 */
export async function analyzeMeetingTranscript(
  transcript: string, 
  meetingTitle?: string, 
  participants?: string[]
): Promise<MeetingSummaryResult> {
  try {
    // Criar um prompt estruturado para a análise da reunião
    const prompt = `
    Você é um assistente especializado em análise de reuniões de arquitetura e design. 
    Por favor, analise a seguinte transcrição de reunião e forneça um resumo estruturado.
    
    ${meetingTitle ? `Título da Reunião: ${meetingTitle}` : ''}
    ${participants?.length ? `Participantes: ${participants.join(', ')}` : ''}
    
    Transcrição:
    ${transcript}
    
    Por favor, forneça uma análise nos seguintes formatos:
    1. Um resumo executivo conciso da reunião (máximo 3 parágrafos)
    2. Os pontos-chave discutidos (em tópicos)
    3. Itens de ação identificados (em tópicos, com responsáveis se mencionados)
    4. Perguntas importantes levantadas ou que requerem acompanhamento
    5. Decisões tomadas durante a reunião
    
    A resposta deve seguir o formato JSON exato abaixo:
    {
      "summary": "resumo executivo aqui",
      "keyPoints": ["ponto 1", "ponto 2", ...],
      "actionItems": ["ação 1", "ação 2", ...],
      "questions": ["pergunta 1", "pergunta 2", ...],
      "decisions": ["decisão 1", "decisão 2", ...]
    }
    `;

    // Enviar para o Claude e receber a resposta
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      system: "Você é um assistente especializado em analisar transcrições de reuniões de arquitetura e design. Forneça respostas precisas no formato JSON solicitado.",
      max_tokens: 2000,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    // Extrair a resposta JSON do texto
    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("Não foi possível extrair JSON da resposta");
    }
    
    const result: MeetingSummaryResult = JSON.parse(jsonMatch[0]);
    return result;
  } catch (error) {
    console.error("Erro ao analisar transcrição:", error);
    return {
      summary: "Não foi possível gerar um resumo devido a um erro na análise.",
      keyPoints: [],
      actionItems: [],
      questions: [],
      decisions: []
    };
  }
}

/**
 * Analisa uma imagem ou gravação de tela da reunião
 */
export async function analyzeMeetingVisuals(
  base64Image: string
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: "Esta é uma captura de tela de uma reunião de arquitetura/design. Por favor, descreva o que está sendo mostrado, identifique desenhos, plantas ou diagramas visíveis, e extraia qualquer informação relevante sobre o projeto que está sendo discutido."
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }]
    });

    return response.content[0].text;
  } catch (error) {
    console.error("Erro ao analisar imagem da reunião:", error);
    return "Não foi possível analisar a imagem da reunião devido a um erro.";
  }
}