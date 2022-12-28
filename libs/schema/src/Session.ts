export interface AppSession {
  personas: string[];
}

export interface UserSession {
  id: number;
  personaId?: string;
  ns?: string;
}
