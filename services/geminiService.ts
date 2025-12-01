import { GoogleGenAI } from "@google/genai";
import { Product } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateProductDescription = async (
  productName: string,
  base64Image: string | null
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Erro: Chave de API não configurada.";

  try {
    const prompt = `
      Atue como um especialista em marketing de moda e copywriter.
      Crie uma descrição atraente, sofisticada e vendedora para uma camisa chamada "${productName}".
      A descrição deve ter no máximo 300 caracteres, focando no estilo, conforto e ocasião de uso.
      Use emojis com moderação. O tom deve ser "vitrine de luxo".
      Responda apenas com a descrição.
    `;

    let response;

    if (base64Image) {
        // Remove header data uri scheme if present (e.g., "data:image/jpeg;base64,")
        const cleanBase64 = base64Image.split(',')[1];
        
        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: 'image/jpeg', // Assuming jpeg for simplicity, or detect from string
                            data: cleanBase64
                        }
                    }
                ]
            }
        });
    } else {
        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
    }

    return response.text || "Não foi possível gerar a descrição.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "Erro ao conectar com a IA do Gemini. Tente novamente.";
  }
};

export const suggestPrice = async (productName: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "";
  
    try {
      const prompt = `
        Para uma camisa de moda chamada "${productName}", sugira um preço realista em Reais (BRL) para um e-commerce brasileiro de médio/alto padrão.
        Responda APENAS com o número (ex: 129.90). Não coloque R$ ou texto.
      `;
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
  
      return response.text?.trim() || "";
    } catch (error) {
      console.error("Error suggesting price:", error);
      return "";
    }
  };

export const chatWithStylist = async (userMessage: string, products: Product[]): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "Desculpe, o serviço de IA está temporariamente indisponível. Verifique a chave de API.";
  
    try {
      const productList = products.map(p => 
        `- ${p.name} (${p.category}): R$ ${p.price.toFixed(2)}. Descrição: ${p.description}`
      ).join('\n');
  
      const prompt = `
        Você é um consultor de moda experiente e sofisticado da loja "Vitrine Style".
        Seu objetivo é ajudar o cliente a escolher produtos da nossa loja baseados no catálogo abaixo.
  
        CATÁLOGO DA LOJA:
        ${productList}
  
        PERGUNTA DO CLIENTE: "${userMessage}"
  
        INSTRUÇÕES:
        1. Recomende produtos específicos do catálogo que se adequem ao pedido, citando o nome exato.
        2. Use um tom elegante, prestativo e vendedor.
        3. Se o cliente perguntar algo não relacionado a roupas/moda, gentilmente traga o assunto de volta para a loja.
        4. Mencione os preços de forma natural.
        5. Seja breve (máximo 4 frases).
      `;
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
  
      return response.text?.trim() || "Desculpe, não consegui formular uma resposta agora.";
    } catch (error) {
      console.error("Chat Error:", error);
      return "Estou tendo dificuldades de conexão. Tente novamente em breve.";
    }
  };