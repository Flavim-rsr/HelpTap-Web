/**
 * Ponto único de troca mock → back-end real.
 * Quando a API Spring Boot estiver pronta, defina VITE_API_URL no .env
 * e substitua o miolo de auth.ts e paciente.ts por fetch(`${API_URL}/...`).
 * As assinaturas das funções NÃO mudam — nenhuma página é alterada.
 */
export const API_URL: string | undefined = import.meta.env.VITE_API_URL;
