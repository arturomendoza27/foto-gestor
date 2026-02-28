// ============================================
// ENDPOINT EXTERNO PARA FOTOS
// GET /api/external/photos
// Protegido con Bearer Token
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { protectWithApiToken, ApiTokenError } from "@/lib/auth/api-token";

// Tipos TypeScript
interface ExternalPhotoResponse {
  cedula: string;
  nombreCompleto: string;
  fotoConGorra: string | null;
  fotoSinGorra: string | null;
  fotoDeFrente: string | null;
}

// ============================================
// GET - Obtener fotos para clientes externos
// ============================================
export async function GET(request: NextRequest) {
  try {
    // Validar token Bearer
    const clientName = protectWithApiToken(request);
    console.log(`[External API] Acceso autorizado para cliente: ${clientName}`);

    // Obtener parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const cedula = searchParams.get("cedula") || "";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 100;

    // Validar límite
    if (limit < 1 || limit > 1000) {
      return NextResponse.json(
        { error: "El parámetro 'limit' debe estar entre 1 y 1000" },
        { status: 400 }
      );
    }

    // Construir filtros
    const where: Record<string, unknown> = {};

    if (cedula) {
      where.client = {
        cedula: {
          contains: cedula,
          mode: "insensitive" as const
        }
      };
    }

    // Consulta optimizada - solo campos necesarios
    const photoRecords = await db.photoRecord.findMany({
      where,
      select: {
        fotoConGorra: true,
        fotoSinGorra: true,
        fotoDeFrente: true,
        client: {
          select: {
            cedula: true,
            nombreCompleto: true
          }
        }
      },
      orderBy: {
        createdAt: "desc" as const
      },
      take: limit
    });

    // Transformar datos al formato requerido
    const responseData: ExternalPhotoResponse[] = photoRecords.map(record => ({
      cedula: record.client.cedula,
      nombreCompleto: record.client.nombreCompleto,
      fotoConGorra: record.fotoConGorra,
      fotoSinGorra: record.fotoSinGorra,
      fotoDeFrente: record.fotoDeFrente
    }));

    // Headers para caché y CORS
    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300, s-maxage=600", // 5 min cache, 10 min CDN
      "Access-Control-Allow-Origin": "*",
      "X-Client-Authorized": clientName
    };

    return NextResponse.json(responseData, { headers });

  } catch (error) {
    console.error("[External API Error]:", error);

    if (error instanceof ApiTokenError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    // Error interno del servidor
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ============================================
// DOCUMENTACIÓN DEL ENDPOINT
// ============================================

/*
ENDPOINT: GET /api/external/photos

DESCRIPCIÓN:
Endpoint seguro para aplicaciones externas que necesitan acceder a los registros de fotos.
Protegido con autenticación Bearer Token.

AUTENTICACIÓN:
Header requerido:
  Authorization: Bearer TU_TOKEN_AQUI

Los tokens se configuran en la variable de entorno API_TOKENS:
  API_TOKENS=CLIENTE_1=token123,CLIENTE_2=token456

PARÁMETROS DE CONSULTA (opcionales):
  - cedula: Filtrar por cédula del cliente (búsqueda parcial, case-insensitive)
  - limit: Número máximo de registros a retornar (1-1000, default: 100)

RESPUESTA EXITOSA (200):
[
  {
    "cedula": "123456789",
    "nombreCompleto": "Juan Pérez",
    "fotoConGorra": "F-001",
    "fotoSinGorra": "F-002",
    "fotoDeFrente": "F-003"
  },
  ...
]

ERRORES:
  - 401: Token inválido, faltante o mal formado
  - 400: Parámetros inválidos
  - 500: Error interno del servidor

EJEMPLOS DE CONSUMO:

1. Con fetch (JavaScript):
   fetch('http://localhost:3000/api/external/photos?limit=50', {
     headers: {
       'Authorization': 'Bearer token123'
     }
   })
   .then(response => response.json())
   .then(data => console.log(data));

2. Con axios (TypeScript):
   import axios from 'axios';
   
   const response = await axios.get('http://localhost:3000/api/external/photos', {
     params: { cedula: '123', limit: 10 },
     headers: { Authorization: 'Bearer token123' }
   });

3. Con curl:
   curl -H "Authorization: Bearer token123" \
        "http://localhost:3000/api/external/photos?cedula=123&limit=5"
*/