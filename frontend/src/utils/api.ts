import { getValidAccessToken } from './auth';

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    const token = await getValidAccessToken(); // Ottieni un token valido
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`, // Aggiungi l'header di autorizzazione
      'Content-Type': 'application/json',
    };

    return await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error('Error during API request:', error);
    throw error; // Rilancia l'errore per una gestione successiva
  }
}
