// Provider configuration types
export interface AIProviderConfig {
  type: 'deepseek' | 'qwen' | 'openrouter-free';
  apiKey?: string;
  isBYOK?: boolean;
}

export interface GenerationOptions {
  maxTokens?: number;
  temperature?: number;
  system?: string;
  model?: string;
}

export interface AIProvider {
  generateText(prompt: string, options?: GenerationOptions): Promise<string>;
  generateEmbedding(text: string): Promise<number[]>;
  getModelName(): string;
  getProviderName(): string;
}

// OpenRouter API client
class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(
    model: string,
    messages: Array<{ role: string; content: string }>,
    options: GenerationOptions = {}
  ): Promise<{ text: string; tokensIn: number; tokensOut: number }> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://aetherlearn.app',
        'X-Title': 'AetherLearn',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    return {
      text: data.choices[0]?.message?.content || '',
      tokensIn: data.usage?.prompt_tokens || 0,
      tokensOut: data.usage?.completion_tokens || 0,
    };
  }

  async embeddings(model: string, text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter embeddings error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.data[0]?.embedding || [];
  }
}

// DeepSeek Provider (via OpenRouter)
export class DeepSeekProvider implements AIProvider {
  private client: OpenRouterClient;
  private model: string;

  constructor(apiKey: string, model: string = 'deepseek/deepseek-chat') {
    this.client = new OpenRouterClient(apiKey);
    this.model = model;
  }

  async generateText(prompt: string, options: GenerationOptions = {}): Promise<string> {
    const messages = [];
    
    if (options.system) {
      messages.push({ role: 'system', content: options.system });
    }
    
    messages.push({ role: 'user', content: prompt });

    const result = await this.client.chat(this.model, messages, options);
    return result.text;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // DeepSeek doesn't have embeddings via OpenRouter, use Qwen instead
    const qwenClient = new OpenRouterClient(process.env.OPENROUTER_API_KEY || '');
    return qwenClient.embeddings('qwen/qwen-2.5-7b-instruct', text);
  }

  getModelName(): string {
    return 'DeepSeek V3';
  }

  getProviderName(): string {
    return 'deepseek';
  }
}

// Qwen Provider (via OpenRouter)
export class QwenProvider implements AIProvider {
  private client: OpenRouterClient;
  private model: string;
  private embeddingModel: string;

  constructor(
    apiKey: string,
    model: string = 'qwen/qwen-2.5-72b-instruct',
    embeddingModel: string = 'qwen/qwen-2.5-7b-instruct'
  ) {
    this.client = new OpenRouterClient(apiKey);
    this.model = model;
    this.embeddingModel = embeddingModel;
  }

  async generateText(prompt: string, options: GenerationOptions = {}): Promise<string> {
    const messages = [];
    
    if (options.system) {
      messages.push({ role: 'system', content: options.system });
    }
    
    messages.push({ role: 'user', content: prompt });

    const result = await this.client.chat(this.model, messages, options);
    return result.text;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.client.embeddings(this.embeddingModel, text);
  }

  getModelName(): string {
    return 'Qwen 2.5 72B';
  }

  getProviderName(): string {
    return 'qwen';
  }
}

// OpenRouter Free Provider (free models like Llama, Mistral)
export class OpenRouterFreeProvider implements AIProvider {
  private client: OpenRouterClient;
  private model: string;
  private embeddingModel: string;

  constructor(
    apiKey: string,
    model: string = 'meta-llama/llama-3.1-8b-instruct:free',
    embeddingModel: string = 'qwen/qwen-2.5-7b-instruct'
  ) {
    this.client = new OpenRouterClient(apiKey);
    this.model = model;
    this.embeddingModel = embeddingModel;
  }

  async generateText(prompt: string, options: GenerationOptions = {}): Promise<string> {
    const messages = [];
    
    if (options.system) {
      messages.push({ role: 'system', content: options.system });
    }
    
    messages.push({ role: 'user', content: prompt });

    const result = await this.client.chat(this.model, messages, options);
    return result.text;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.client.embeddings(this.embeddingModel, text);
  }

  getModelName(): string {
    return 'Llama 3.1 8B (Free)';
  }

  getProviderName(): string {
    return 'openrouter-free';
  }
}

// Factory function to get the appropriate provider
export function getProvider(config: AIProviderConfig): AIProvider {
  const apiKey = config.apiKey || process.env.OPENROUTER_API_KEY || '';

  if (!apiKey) {
    throw new Error('Geen API-key geconfigureerd. Voeg je eigen key toe in de instellingen.');
  }

  switch (config.type) {
    case 'deepseek':
      return new DeepSeekProvider(apiKey);
    case 'qwen':
      return new QwenProvider(apiKey);
    case 'openrouter-free':
      return new OpenRouterFreeProvider(apiKey);
    default:
      return new OpenRouterFreeProvider(apiKey);
  }
}

// Get default provider for free users
export function getDefaultProvider(): AIProvider {
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  
  if (!apiKey) {
    throw new Error('Platform AI niet geconfigureerd. Neem contact op met support.');
  }

  return new OpenRouterFreeProvider(apiKey);
}
