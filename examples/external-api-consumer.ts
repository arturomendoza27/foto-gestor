// ============================================
// EJEMPLO DE CONSUMO DE API EXTERNA
// Para consumir el endpoint /api/external/photos
// ============================================

/**
 * EJEMPLO 1: Uso básico con fetch
 */
async function fetchWithBearerToken() {
  const API_URL = 'https://foto-gestor.vercel.app//api/external/photos';
  const BEARER_TOKEN = 'TU_TOKEN_AQUI'; // Reemplazar con token real

  try {
    const response = await fetch(`${API_URL}?limit=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error ${response.status}: ${error.error || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Datos obtenidos:', data);
    return data;
  } catch (error) {
    console.error('Error al consumir API:', error);
    throw error;
  }
}

/**
 * EJEMPLO 2: Uso con axios (TypeScript)
 */
import axios from 'axios';

async function axiosWithBearerToken() {
  const API_URL = 'https://foto-gestor.vercel.app/api/external/photos';
  const BEARER_TOKEN = 'TU_TOKEN_AQUI';

  try {
    const response = await axios.get(API_URL, {
      params: {
        cedula: '123', // Filtrar por cédula que contenga "123"
        limit: 5       // Obtener máximo 5 registros
      },
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`
      }
    });

    console.log('Datos obtenidos con axios:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error de axios:', error.response?.data || error.message);
    } else {
      console.error('Error desconocido:', error);
    }
    throw error;
  }
}

/**
 * EJEMPLO 3: Cliente reutilizable con TypeScript
 */
interface ExternalPhoto {
  cedula: string;
  nombreCompleto: string;
  fotoConGorra: string | null;
  fotoSinGorra: string | null;
  fotoDeFrente: string | null;
}

interface ApiOptions {
  baseUrl?: string;
  token: string;
}

class ExternalApiClient {
  private baseUrl: string;
  private token: string;

  constructor(options: ApiOptions) {
    this.baseUrl = options.baseUrl || 'https://foto-gestor.vercel.app/api/external';
    this.token = options.token;
  }

  async getPhotos(options?: {
    cedula?: string;
    limit?: number;
  }): Promise<ExternalPhoto[]> {
    const params = new URLSearchParams();
    
    if (options?.cedula) {
      params.append('cedula', options.cedula);
    }
    
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }

    const url = `${this.baseUrl}/photos${params.toString() ? '?' + params.toString() : ''}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`API Error ${response.status}: ${error.error || 'Unknown error'}`);
    }

    return await response.json();
  }

  async getPhotoByCedula(cedula: string): Promise<ExternalPhoto[]> {
    return this.getPhotos({ cedula, limit: 1 });
  }
}

/**
 * EJEMPLO 4: Uso del cliente
 */
async function exampleClientUsage() {
  const client = new ExternalApiClient({
    token: 'TU_TOKEN_AQUI',
    baseUrl: 'https://foto-gestor.vercel.app//api/external'
  });

  try {
    // Obtener todas las fotos (limitado a 100 por defecto)
    const allPhotos = await client.getPhotos();
    console.log(`Total de fotos obtenidas: ${allPhotos.length}`);

    // Buscar por cédula específica
    const specificPhotos = await client.getPhotos({ cedula: '123456', limit: 10 });
    console.log(`Fotos para cédula 123456: ${specificPhotos.length}`);

    // Obtener solo una foto por cédula
    const singlePhoto = await client.getPhotoByCedula('789012');
    console.log('Foto única:', singlePhoto[0]);

  } catch (error) {
    console.error('Error usando cliente:', error);
  }
}

/**
 * EJEMPLO 5: Script de prueba con curl (para terminal)
 */
const curlExamples = `
# Ejemplos de comandos curl para probar la API:

# 1. Obtener todas las fotos (limit 100 por defecto)
curl -H "Authorization: Bearer TU_TOKEN_AQUI" \\
     "https://foto-gestor.vercel.app//api/external/photos"

# 2. Filtrar por cédula y limitar a 5 resultados
curl -H "Authorization: Bearer TU_TOKEN_AQUI" \\
     "https://foto-gestor.vercel.app//api/external/photos?cedula=123&limit=5"

# 3. Solo ver headers de respuesta (útil para debugging)
curl -I -H "Authorization: Bearer TU_TOKEN_AQUI" \\
     "https://foto-gestor.vercel.app//api/external/photos"

# 4. Guardar respuesta en archivo JSON
curl -H "Authorization: Bearer TU_TOKEN_AQUI" \\
     "https://foto-gestor.vercel.app//api/external/photos?limit=10" \\
     -o fotos.json
`;

/**
 * EJEMPLO 6: Configuración de variables de entorno
 */
const envExample = `
# Archivo .env.local (para desarrollo)
API_TOKENS=CLIENTE_MOVIL=abc123def456,CLIENTE_WEB=xyz789uvw012

# Archivo .env.production (para producción)
API_TOKENS=PRODUCCION_CLIENTE_1=prod_token_123,PRODUCCION_CLIENTE_2=prod_token_456

# Cómo usar en código:
const tokens = process.env.API_TOKENS;
// tokens = "CLIENTE_MOVIL=abc123def456,CLIENTE_WEB=xyz789uvw012"
`;

// Exportar funciones para uso en otros módulos
export {
  fetchWithBearerToken,
  axiosWithBearerToken,
  ExternalApiClient,
  exampleClientUsage
};

console.log(`
============================================
EJEMPLOS DE CONSUMO DE API EXTERNA
============================================

Para usar estos ejemplos:

1. Reemplaza 'TU_TOKEN_AQUI' con tu token real
2. Asegúrate de que el servidor esté corriendo en localhost:3000
3. Configura los tokens en variables de entorno:

${envExample}

Comandos curl para prueba:
${curlExamples}
`);