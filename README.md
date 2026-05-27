# Hybrid OS

Aplicación privada para registrar entrenamientos híbridos, ver carga muscular y consultar métricas semanales.

## Desarrollo

```bash
npm install
npm run dev
```

La app usa un login local sencillo para mantener el dashboard privado durante el desarrollo.

## Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/training_sessions.sql` en el SQL Editor.
3. Crea `.env.local`:

```env
SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=TU_SECRET_O_SERVICE_ROLE_KEY
```

No uses una publishable/anon key para `SUPABASE_SERVICE_ROLE_KEY`. Esa variable se usa solo en API routes del servidor.

## Datos

- Supabase es la fuente principal para entrenamientos.
- El seed histórico sigue como fallback de solo lectura.
- `localStorage` se usa como respaldo temporal si Supabase falla.
- El backup JSON se exporta desde `/training`.
- Los backups se importan desde `/training/import`.

## Scripts

```bash
npm run lint
npm run build
```

