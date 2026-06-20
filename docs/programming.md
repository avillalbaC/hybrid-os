# Programaciones

## Objetivo

Programaciones permite importar sesiones propuestas, verlas por fecha y ejecutarlas por bloques. Es una capa operativa separada del historial real de entrenamientos.

Esta sección no crea `training_sessions`, no toca `raw_imports`, no normaliza ejercicios y no pasa por `HybridOSAppInput`.

## Schema

Tabla: `public.programming_sessions`.

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null`
- `title text not null`
- `type text not null`
- `scheduled_date date not null`
- `estimated_duration_minutes integer null`
- `status text not null default 'planned'`
- `source text not null default 'manual'`
- `blocks jsonb not null default '[]'`
- `final_log jsonb null`
- `started_at timestamptz null`
- `completed_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

RLS está activo con políticas por `auth.uid() = user_id`. La API deriva `user_id` del usuario autenticado y no acepta `user_id` desde el cliente.

## Estados

Estados de sesión:

- `planned`
- `in_progress`
- `completed`
- `partially_completed`
- `skipped`

Estados de bloque:

- `pending`
- `in_progress`
- `completed`
- `skipped`

Tipos permitidos:

- `gimnasticos`
- `running`
- `fuerza`
- `halterofilia`
- `crossfit`
- `hyrox`
- `movilidad`
- `mixed`
- `other`

## Formato JSON de importación

Pantalla: `/programming`, botón `Importar JSON`.

Endpoint: `POST /api/programming-sessions`.

Borrado: `DELETE /api/programming-sessions/:id`.

El MVP acepta una única sesión por petición. No acepta arrays.

Campos obligatorios:

- `title`
- `type`
- `scheduledDate`
- `blocks`

Campos opcionales:

- `estimatedDurationMinutes`
- `status`
- `source`

Cada bloque debe tener:

- `id`
- `order`
- `title`

Cada bloque puede tener:

- `durationMinutes`
- `status`
- `focus`
- `items`
- `notes`
- `maxVolume`
- `dontDo`

## Ejemplo mínimo

```json
{
  "title": "Running suave",
  "type": "running",
  "scheduledDate": "2026-06-22",
  "blocks": [
    {
      "id": "run",
      "order": 1,
      "title": "Rodaje suave"
    }
  ]
}
```

## Ejemplo completo

```json
{
  "title": "Gimnásticos técnica estricta",
  "type": "gimnasticos",
  "scheduledDate": "2026-06-22",
  "estimatedDurationMinutes": 50,
  "status": "planned",
  "source": "manual",
  "blocks": [
    {
      "id": "warmup",
      "order": 1,
      "title": "Calentamiento",
      "durationMinutes": 10,
      "status": "pending",
      "focus": "Activación escapular y línea corporal",
      "items": [
        "2 rondas",
        "8 scap pull-ups",
        "8 hollow rocks",
        "20 segundos arch hold"
      ],
      "notes": "Sin fatiga",
      "maxVolume": [],
      "dontDo": []
    },
    {
      "id": "strict-pull",
      "order": 2,
      "title": "Strict pull-up strength",
      "durationMinutes": 18,
      "status": "pending",
      "focus": "Fuerza estricta sin romper línea",
      "items": [
        "5 series de 3 strict pull-ups",
        "Descanso 90 segundos",
        "RPE técnico máximo 7"
      ],
      "notes": "Usar banda si la tercera repetición pierde control",
      "maxVolume": [
        "15 strict pull-ups totales"
      ],
      "dontDo": [
        "No kipping",
        "No llegar al fallo"
      ]
    },
    {
      "id": "core-line",
      "order": 3,
      "title": "Línea corporal",
      "durationMinutes": 12,
      "status": "pending",
      "focus": "Control hollow y compresión",
      "items": [
        "3 rondas",
        "25 segundos hollow hold",
        "10 seated leg lifts",
        "8 wall slides"
      ],
      "notes": "Priorizar calidad sobre volumen",
      "maxVolume": [
        "3 rondas"
      ],
      "dontDo": [
        "No compensar con lumbar"
      ]
    }
  ]
}
```

## Registro final

Al finalizar desde `/programming/[id]`, se guarda `final_log` con esta forma:

```json
{
  "actualDurationMinutes": 48,
  "technicalRpe": 7,
  "discomfort": "Ligera carga en antebrazo derecho",
  "finalNote": "Buena calidad técnica, sin fatiga alta",
  "nextSessionDecision": "mantener"
}
```

`nextSessionDecision` acepta:

- `mantener`
- `subir`
- `bajar`
- `cancelar`

## Limitaciones

- No crea entrenamientos reales automáticamente.
- El borrado elimina solo la fila de `programming_sessions`; no borra entrenamientos reales.
- No se integra con calendario.
- No importa Markdown.
- No convierte bloques en `training_exercises`.
- No preserva raw import en `raw_imports`; el JSON vive en `blocks` dentro de `programming_sessions`.
- No hay importación masiva en el MVP.

## Futuro

- Parser Markdown con preview antes de guardar.
- Integración con calendario.
- Conversión explícita y revisable a entrenamiento real.
- Plantillas de ciclos y sesiones recurrentes.
