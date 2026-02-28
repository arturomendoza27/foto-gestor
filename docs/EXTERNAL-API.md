# API Externa - Documentación

## 📋 Descripción
Endpoint seguro para aplicaciones externas que necesitan acceder a los registros de fotos de clientes. Protegido con autenticación Bearer Token.

## 🚀 Endpoint Principal
```
GET /api/external/photos
```

## 🔐 Autenticación
### Header requerido:
```http
Authorization: Bearer TU_TOKEN_AQUI
```

### Configuración de tokens:
Los tokens se configuran en la variable de entorno `API_TOKENS`:

**Formato:**
```
API_TOKENS=NOMBRE_CLIENTE_1=token1,NOMBRE_CLIENTE_2=token2
```

**Ejemplos:**
```bash
# Desarrollo (.env.local)
API_TOKENS=CLIENTE_MOVIL=abc123def456,CLIENTE_WEB=xyz789uvw012

# Producción (.env.production)
API_TOKENS=PRODUCCION_APP=prod_token_123,SISTEMA_EXTERNO=prod_token_456
```

## 📊 Parámetros de Consulta (opcionales)

| Parámetro | Tipo | Descripción | Valores | Default |
|-----------|------|-------------|---------|---------|
| `cedula` | string | Filtrar por cédula del cliente (búsqueda parcial, case-insensitive) | Cualquier texto | - |
| `limit` | number | Número máximo de registros a retornar | 1-1000 | 100 |

## 📦 Estructura de Respuesta

### Respuesta Exitosa (200)
```json
[
  {
    "cedula": "123456789",
    "nombreCompleto": "Juan Pérez",
    "fotoConGorra": "F-001",
    "fotoSinGorra": "F-002",
    "fotoDeFrente": "F-003"
  },
  {
    "cedula": "987654321",
    "nombreCompleto": "María García",
    "fotoConGorra": "F-004",
    "fotoSinGorra": "F-005",
    "fotoDeFrente": "F-006"
  }
]
```

### Headers de Respuesta
- `Content-Type: application/json`
- `Cache-Control: public, max-age=300, s-maxage=600` (5 min cache, 10 min CDN)
- `Access-Control-Allow-Origin: *`
- `X-Client-Authorized: NOMBRE_CLIENTE`

## ⚠️ Códigos de Error

| Código | Descripción | Ejemplo de Respuesta |
|--------|-------------|---------------------|
| 200 | ✅ Éxito | Array de fotos |
| 400 | ❌ Parámetros inválidos | `{"error": "El parámetro 'limit' debe estar entre 1 y 1000"}` |
| 401 | ❌ Autenticación fallida | `{"error": "Invalid or expired token"}` |
| 500 | ❌ Error interno del servidor | `{"error": "Error interno del servidor"}` |

## 💻 Ejemplos de Consumo

### 1. JavaScript/TypeScript con fetch
```javascript
async function obtenerFotos() {
  const response = await fetch('http://localhost:3000/api/external/photos?limit=10', {
    headers: {
      'Authorization': 'Bearer abc123def456'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}`);
  }
  
  return await response.json();
}
```

### 2. TypeScript con cliente reutilizable
```typescript
import { ExternalApiClient } from '../examples/external-api-consumer';

const client = new ExternalApiClient({
  token: 'abc123def456',
  baseUrl: 'http://localhost:3000/api/external'
});

// Obtener todas las fotos
const fotos = await client.getPhotos({ limit: 50 });

// Buscar por cédula
const fotosCliente = await client.getPhotos({ 
  cedula: '123456', 
  limit: 5 
});
```

### 3. Python con requests
```python
import requests

url = "http://localhost:3000/api/external/photos"
headers = {"Authorization": "Bearer abc123def456"}
params = {"cedula": "123", "limit": 10}

response = requests.get(url, headers=headers, params=params)
fotos = response.json()
```

### 4. cURL (línea de comandos)
```bash
# Obtener todas las fotos
curl -H "Authorization: Bearer abc123def456" \
     "http://localhost:3000/api/external/photos"

# Filtrar por cédula
curl -H "Authorization: Bearer abc123def456" \
     "http://localhost:3000/api/external/photos?cedula=123&limit=5"

# Guardar en archivo
curl -H "Authorization: Bearer abc123def456" \
     "http://localhost:3000/api/external/photos?limit=100" \
     -o fotos.json
```

## 🛠️ Configuración del Proyecto

### Archivos creados:
```
src/lib/auth/api-token.ts          # Módulo de autenticación
src/app/api/external/photos/route.ts # Endpoint principal
examples/external-api-consumer.ts  # Ejemplos de consumo
docs/EXTERNAL-API.md              # Documentación
```

### Variables de entorno necesarias:
```bash
# .env.local
API_TOKENS=CLIENTE_1=token_secreto_123,CLIENTE_2=token_secreto_456
```

## 🔧 Desarrollo y Pruebas

### 1. Configurar tokens de prueba:
```bash
# En .env.local
API_TOKENS=TEST_CLIENT=test_token_123,MOBILE_APP=mobile_token_456
```

### 2. Probar el endpoint:
```bash
# Usando curl
curl -H "Authorization: Bearer test_token_123" \
     "http://localhost:3000/api/external/photos?limit=2"

# Usando el script de ejemplo
node -e "require('./examples/external-api-consumer').exampleClientUsage()"
```

### 3. Verificar logs:
El endpoint registra accesos en la consola:
```
[External API] Acceso autorizado para cliente: TEST_CLIENT
```

## 📈 Consideraciones de Producción

### Seguridad:
1. **Tokens únicos por cliente**: Cada aplicación externa debe tener su propio token
2. **Rotación periódica**: Cambiar tokens cada 3-6 meses
3. **Registro de acceso**: Todos los accesos son logueados
4. **Rate limiting**: Considerar implementar límites de tasa (ej: 1000 requests/hora)

### Performance:
1. **Caché**: Respuestas cacheadas por 5 minutos
2. **Paginación**: Uso obligatorio del parámetro `limit`
3. **Consulta optimizada**: Solo se seleccionan campos necesarios
4. **Índices**: Asegurar índices en `cedula` y `createdAt`

### Monitoreo:
1. **Logs de acceso**: Verificar clientes autorizados
2. **Errores 401**: Alertar sobre intentos de acceso no autorizados
3. **Uso de API**: Monitorear volumen de requests por cliente

## 🚨 Solución de Problemas

### Error 401 - No autorizado:
1. Verificar que el header `Authorization` esté presente
2. Confirmar que el token esté correctamente configurado en `API_TOKENS`
3. Asegurar formato: `Bearer TOKEN` (con espacio)

### Error 400 - Parámetros inválidos:
1. `limit` debe ser número entre 1 y 1000
2. `cedula` debe ser string válido

### Error 500 - Error interno:
1. Verificar conexión a base de datos
2. Revisar logs del servidor
3. Confirmar que las tablas existan

## 📞 Soporte
Para problemas con la API externa:
1. Revisar esta documentación
2. Verificar logs del servidor
3. Contactar al administrador del sistema

---

**Última actualización:** Febrero 2026  
**Versión API:** 1.0.0  
**Mantenido por:** Equipo de Desarrollo