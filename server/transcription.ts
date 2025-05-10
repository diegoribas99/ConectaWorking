import Anthropic from '@anthropic-ai/sdk';
import { createReadStream } from 'fs';
import { MeetingAnalytic } from '@shared/schema';

// Inicializar o cliente da Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Função para transcrever um arquivo de áudio usando a API da Anthropic
export async function transcribeAudio(audioFilePath: string): Promise<string> {
  try {
    // Aqui simulamos a transcrição, em uma implementação real
    // usaríamos uma API como a Whisper da OpenAI ou similar
    console.log(`Transcrevendo arquivo: ${audioFilePath}`);
    
    // Em uma implementação real, essa função usaria o Whisper ou similar
    // para processar o arquivo de áudio e retornar a transcrição
    
    // Simulamos o resultado da transcrição para fins de demonstração
    const transcript = "Esta é uma transcrição simulada de uma reunião. Em uma implementação real, aqui estaria o texto transcrito do áudio da videoconferência.";
    
    return transcript;
  } catch (error) {
    console.error("Erro ao transcrever áudio:", error);
    throw new Error(`Falha ao transcrever o áudio: ${error.message}`);
  }
}

// Função para analisar a transcrição e gerar insights usando Claude da Anthropic
export async function analyzeTranscription(
  transcript: string,
  meetingInfo: {
    title: string;
    description?: string;
    participants: { name: string; role: string }[];
    duration: number;
  }
): Promise<MeetingAnalytic> {
  try {
    console.log("Analisando transcrição com Claude");
    
    // Criar o prompt para o Claude
    const prompt = `
    Você é um assistente especializado em análise de reuniões. Analise a transcrição abaixo de uma reunião intitulada "${meetingInfo.title}" ${meetingInfo.description ? `com descrição: "${meetingInfo.description}"` : ''}.
    A reunião durou ${meetingInfo.duration} minutos e teve ${meetingInfo.participants.length} participantes: ${meetingInfo.participants.map(p => `${p.name} (${p.role})`).join(', ')}.
    
    TRANSCRIÇÃO:
    ${transcript}
    
    Com base na transcrição acima, forneça uma análise completa no formato JSON com os seguintes campos:
    1. summary: um resumo detalhado (máximo 300 palavras) capturando os principais pontos da reunião
    2. keyPoints: um array com 3-5 pontos-chave discutidos (cada item com máximo 100 caracteres)
    3. actionItems: um array com 3-5 itens de ação identificados (cada item com máximo 100 caracteres) 
    4. sentimentScore: uma pontuação de sentimento entre 0 e 1, onde 0 é muito negativo e 1 é muito positivo
    5. topicsCovered: um array de objetos, cada um contendo { topic: string, timeSpent: number, sentiment: 'positive' | 'neutral' | 'negative' }
    6. speakingDistribution: um array de objetos estimando quanto cada participante falou, cada um contendo { participant: string, timePercentage: number }
    
    Retorne APENAS o objeto JSON, sem texto adicional antes ou depois.
    `;

    // O modelo mais recente é o "claude-3-7-sonnet-20250219", lançado em 24/02/2025
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1500,
      temperature: 0.4,
      system: "Você é um assistente especializado em análise de reuniões que fornece resultados apenas em formato JSON válido.",
      messages: [{ role: 'user', content: prompt }]
    });

    // Extrair o JSON da resposta
    const content = response.content[0].text;
    let analyticsData;
    
    try {
      analyticsData = JSON.parse(content);
    } catch (e) {
      console.error("Erro ao fazer parse do JSON:", e);
      // Fallback para um objeto simulado se o parse falhar
      analyticsData = {
        summary: "Não foi possível gerar um resumo preciso da transcrição.",
        keyPoints: ["Ponto chave 1", "Ponto chave 2", "Ponto chave 3"],
        actionItems: ["Item de ação 1", "Item de ação 2", "Item de ação 3"],
        sentimentScore: 0.5,
        topicsCovered: [
          { topic: "Tópico 1", timeSpent: 10, sentiment: "neutral" },
          { topic: "Tópico 2", timeSpent: 15, sentiment: "positive" }
        ],
        speakingDistribution: meetingInfo.participants.map((p, i) => ({
          participant: p.name,
          timePercentage: 100 / meetingInfo.participants.length
        }))
      };
    }

    // Criar o objeto de análise final
    const meetingAnalytics: MeetingAnalytic = {
      id: 0, // será definido no banco de dados
      meetingId: 0, // será definido na chamada
      summary: analyticsData.summary,
      duration: meetingInfo.duration,
      participantsCount: meetingInfo.participants.length,
      actionItems: analyticsData.actionItems,
      keyPoints: analyticsData.keyPoints,
      sentimentScore: analyticsData.sentimentScore,
      topicsCovered: JSON.stringify(analyticsData.topicsCovered),
      speakingDistribution: JSON.stringify(analyticsData.speakingDistribution),
      transcript: transcript,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return meetingAnalytics;
  } catch (error) {
    console.error("Erro ao analisar a transcrição:", error);
    throw new Error(`Falha ao analisar a transcrição: ${error.message}`);
  }
}