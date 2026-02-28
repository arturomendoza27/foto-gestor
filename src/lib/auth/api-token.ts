// ============================================
// MÓDULO DE AUTENTICACIÓN POR BEARER TOKEN
// Para endpoints externos - Usa tokens estáticos en variables de entorno
// ============================================

import { NextRequest } from "next/server";

// Configuración de tokens API permitidos
// Formato: TOKEN_NOMBRE=valor_del_token
// Ejemplo: EXTERNAL_CLIENT_1=abc123def456
const API_TOKENS = process.env.API_TOKENS || "";
const TOKEN_MAP = new Map<string, string>();

// Inicializar mapa de tokens desde variable de entorno
if (API_TOKENS) {
  const tokenPairs = API_TOKENS.split(',').map(pair => pair.trim());
  for (const pair of tokenPairs) {
    const [name, token] = pair.split('=');
    if (name && token) {
      TOKEN_MAP.set(token, name);
    }
  }
}

// Tipos de error
export class ApiTokenError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'ApiTokenError';
  }
}

/**
 * Valida un token Bearer desde el header Authorization
 * @param request - Request de Next.js
 * @returns Nombre del cliente asociado al token
 * @throws ApiTokenError si la validación falla
 */
export function validateApiToken(request: NextRequest): string {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    throw new ApiTokenError('Authorization header missing', 401);
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new ApiTokenError('Invalid authorization format. Expected: Bearer TOKEN', 401);
  }

  const token = authHeader.substring(7).trim();
  
  if (!token) {
    throw new ApiTokenError('Token missing', 401);
  }

  const clientName = TOKEN_MAP.get(token);
  
  if (!clientName) {
    throw new ApiTokenError('Invalid or expired token', 401);
  }

  return clientName;
}

/**
 * Middleware para proteger endpoints con Bearer Token
 * @param request - Request de Next.js
 * @returns Nombre del cliente si el token es válido
 * @throws ApiTokenError si la validación falla
 */
export function protectWithApiToken(request: NextRequest): string {
  try {
    return validateApiToken(request);
  } catch (error) {
    if (error instanceof ApiTokenError) {
      throw error;
    }
    throw new ApiTokenError('Authentication failed', 500);
  }
}

/**
 * Verifica si hay tokens configurados
 * @returns true si hay al menos un token configurado
 */
export function hasApiTokensConfigured(): boolean {
  return TOKEN_MAP.size > 0;
}

/**
 * Obtiene información sobre los tokens configurados (sin exponer los tokens reales)
 * @returns Array con nombres de clientes configurados
 */
export function getConfiguredClients(): string[] {
  return Array.from(TOKEN_MAP.values());
}