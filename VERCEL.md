# Despliegue en Vercel - FotoGestor

## ⚠️ Importante: Base de Datos

Vercel es **serverless** y NO soporta SQLite porque el sistema de archivos es efímero.
Debes usar una base de datos externa:

### Opciones recomendadas:

| Base de Datos | Proveedor | DATABASE_URL |
|---------------|-----------|--------------|
| PostgreSQL | [Vercel Postgres](https://vercel.com/storage/postgres) | Automático |
| PostgreSQL | [Supabase](https://supabase.com) (Gratis) | `postgresql://...` |
| PostgreSQL | [Neon](https://neon.tech) (Gratis) | `postgresql://...` |
| MySQL | [PlanetScale](https://planetscale.com) | `mysql://...` |

---

## Pasos para desplegar

### 1. Crear base de datos externa

**Opción A: Vercel Postgres (Más fácil)**
1. Ve a tu proyecto en Vercel → Storage → Create → Postgres
2. Se conectará automáticamente

**Opción B: Supabase (Recomendado - Gratis)**
1. Crea cuenta en [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Project Settings → Database → Connection string
4. Copia la URL de conexión

### 2. Configurar variables de entorno en Vercel

Ve a tu proyecto → Settings → Environment Variables:

```
DATABASE_URL=postgresql://usuario:password@host:5432/database
NEXTAUTH_SECRET=tu-clave-secreta-muy-segura-32-caracteres-minimo
NEXTAUTH_URL=https://tu-proyecto.vercel.app
```

### 3. Modificar prisma/schema.prisma

Cambiar el provider de SQLite a PostgreSQL:

```prisma
// Comentamos SQLite
// datasource db {
//   provider = "sqlite"
//   url      = env("DATABASE_URL")
// }

// Usamos PostgreSQL
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4. Generar clave NEXTAUTH_SECRET

```bash
# En tu terminal local
openssl rand -base64 32
```

### 5. Desplegar

**Opción A: Desde GitHub (Recomendado)**
1. Sube tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa tu repositorio
4. Vercel detectará Next.js automáticamente
5. Configura las variables de entorno
6. Deploy

**Opción B: Desde CLI**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar
vercel --prod
```

---

## Ejecutar migraciones en Vercel

Vercel ejecutará automáticamente `prisma generate` durante el build.

Para las migraciones, tienes dos opciones:

### Opción 1: Build Command personalizado
En `vercel.json` o Settings → Build Command:
```bash
prisma generate && prisma db push && next build
```

### Opción 2: Ejecutar migraciones localmente
Antes de desplegar, ejecuta:
```bash
# Conectado a la base de datos de producción
DATABASE_URL="tu-url-produccion" npx prisma db push
```

---

## Estructura de archivos para Vercel

```
├── prisma/
│   └── schema.prisma      # Schema con provider: postgresql
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── .env                    # Solo local
├── vercel.json             # Config Vercel
└── package.json
```

---

## Problemas comunes

### Error: "Can't reach database server"
- Verifica que DATABASE_URL esté correcta
- Asegúrate que la base de datos permite conexiones externas

### Error: "Prisma Client not found"
- Agrega `prisma generate` al build command

### Error: "NEXTAUTH_URL is required"
- Configura NEXTAUTH_URL con tu dominio de Vercel
- Ejemplo: `https://foto-gestor.vercel.app`

---

## Usuarios por defecto

Después de desplegar, crea usuarios manualmente o con seed:

```bash
# En local conectado a la BD de producción
DATABASE_URL="tu-url-produccion" bun run prisma/db/seed.ts
```
