export type AppTheme = 'light' | 'dark' | 'system';

export type AIProvider = 'openai' | 'deepseek';

export type AISettings = {
  enabled: boolean;
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export type AppSettings = {
  theme: AppTheme,
  language: string,
  ai?: AISettings
}

export type Program = {
  id: string;
  name: string;
  description?: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}
