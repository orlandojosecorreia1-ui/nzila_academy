import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Initialize client inside the handler to prevent 500 crashes if key is undefined at startup
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "dummy_key_to_prevent_crash",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const { prompt, courses } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "O Prompt de busca intelitente é obrigatório." }, { status: 400 });
    }

    // Call gemini-3.5-flash as indicated in basic text recommendation rules
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Você é o recomendador de cursos oficial da NZILA ACADEMY.
Sua tarefa é analisar a frase do usuário/estudante expressando interesse ou objetivo de vida e selecionar o(s) melhor(es) curso(s) da lista disponível.

Lista de cursos disponíveis na NZILA ACADEMY:
${JSON.stringify(courses, null, 2)}

Frase do Usuário: "${prompt}"

Instruções:
1. Recomende de forma entusiasmada e profissional no contexto de tecnologia, negócios futuristas ou design de vanguarda.
2. Identifique os cursos que batem diretamente com o interesse e cite os IDs correspondentes.
3. Forneça uma resposta amigável estruturada em JSON contendo:
 - "summary": Uma explicação resumida e inspiradora em português/Angola de por que você recomenda este(s) curso(s).
 - "recommendedCourseIds": Uma lista de arrays de strings contendo os IDs do(s) curso(s) recomendado(s) que estão na lista.
 - "additionalTips": Dicas de como o aluno pode aproveitar ao máximo esses cursos no ecossistema Nzila.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "Resumo inspirador focado nos objetivos do aluno"
            },
            recommendedCourseIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "IDs dos cursos recomendados na lista"
            },
            additionalTips: {
              type: Type.STRING,
              description: "Dica prática para alavancar os estudos"
            }
          },
          required: ["summary", "recommendedCourseIds", "additionalTips"]
        }
      }
    });

    const resultText = response.text || "{}";
    const parsedResult = JSON.parse(resultText);

    return NextResponse.json({ success: true, recommendation: parsedResult });
  } catch (error: any) {
    console.error("Erro na busca inteligente Gemini:", error);
    // If key is missing or system fails, provide a beautiful automatic fallback that replicates search logic gracefully.
    return NextResponse.json({
      success: false,
      message: error.message || "Erro desconhecido",
      fallback: true
    });
  }
}
