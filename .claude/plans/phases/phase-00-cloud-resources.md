# Fase 00: Cloud Resources — Crear D1, KV, R2 en Cloudflare

**Plan padre:** @.claude/plans/cloudflare-full-migration.md
**Estado:** pendiente
**Depende de:** ninguna (primera fase absoluta)
**Desbloquea:** @.claude/plans/phases/phase-01-scaffolding.md (los IDs reales van directo en wrangler.jsonc)

## Agentes

| Rol | Agente | Activo |
|-----|--------|--------|
| Researcher | — | No (no requiere research) |
| Engineer | `engineer-p00` | **Sí** — ejecuta wrangler commands |
| Tester | — | No (no hay código que testear) |
| Reviewer | — | No (no hay código que revisar) |

## Objetivo

Crear los 3 recursos cloud necesarios (D1 database, KV namespace, R2 bucket) en la cuenta de Cloudflare y obtener sus IDs reales. Esto permite que Fase 01 configure `wrangler.jsonc` con IDs definitivos en lugar de placeholders.

## Prerrequisitos

- [x] Cuenta de Cloudflare creada
- [x] `wrangler login` completado (`wrangler whoami` funciona)

## Tareas

### 0.1 Verificar autenticación

- [ ] EXECUTE: `wrangler whoami`
  - Debe mostrar account name y account ID
  - **Guardar el Account ID** — se necesita como referencia

### 0.2 Crear D1 Database

- [ ] EXECUTE: `wrangler d1 create portfolio-db`

Salida esperada:
```
✅ Successfully created DB 'portfolio-db'

[[d1_databases]]
binding = "DB"
database_name = "portfolio-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

- [ ] **ANOTAR** el `database_id` → se usa en `wrangler.jsonc` Fase 01

### 0.3 Crear KV Namespace

- [ ] EXECUTE: `wrangler kv namespace create CACHE`

Salida esperada:
```
✅ Successfully created KV namespace "CACHE"

[[kv_namespaces]]
binding = "CACHE"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

- [ ] **ANOTAR** el `id` → se usa en `wrangler.jsonc` Fase 01

**Opcional — namespace preview (para desarrollo remoto):**
- [ ] EXECUTE: `wrangler kv namespace create CACHE --preview`
- [ ] **ANOTAR** el `preview_id` si se crea

### 0.4 Crear R2 Bucket

- [ ] EXECUTE: `wrangler r2 bucket create rominarotela-images`

Salida esperada:
```
✅ Successfully created bucket "rominarotela-images"
```

> R2 buckets no tienen un ID UUID como D1/KV — se referencian por nombre (`bucket_name`) en wrangler.jsonc.

### 0.5 Configurar secreto de producción (API_KEY)

- [ ] EXECUTE: `wrangler secret put API_KEY`
  - Ingresará un prompt para escribir el valor del secreto
  - Usar una clave segura (mínimo 32 caracteres, alfanumérica)
  - Este secreto protege los endpoints POST/PUT/DELETE de la API

> **Nota:** Este comando configura el secreto para producción. Para desarrollo local, el secreto va en `.dev.vars` (se crea en Fase 01).

### 0.6 Verificar recursos creados

- [ ] EXECUTE: `wrangler d1 list` — debe mostrar `portfolio-db`
- [ ] EXECUTE: `wrangler kv namespace list` — debe mostrar `CACHE`
- [ ] EXECUTE: `wrangler r2 bucket list` — debe mostrar `rominarotela-images`

## Resumen de IDs obtenidos

Al completar esta fase, anotar los valores para usarlos en Fase 01:

```
D1 database_id:  ________________________________
KV id:           ________________________________
KV preview_id:   ________________________________ (opcional)
R2 bucket_name:  rominarotela-images
API_KEY:         (configurado como secreto, no anotar en texto plano)
```

Estos valores reemplazan los placeholders en `wrangler.jsonc` de la Fase 01:

```jsonc
{
  "d1_databases": [{
    "binding": "DB",
    "database_name": "portfolio-db",
    "database_id": "<pegar D1 database_id aquí>"
  }],
  "kv_namespaces": [{
    "binding": "CACHE",
    "id": "<pegar KV id aquí>"
  }],
  "r2_buckets": [{
    "binding": "STORAGE",
    "bucket_name": "rominarotela-images"
  }]
}
```

## Validación de Fase

```bash
wrangler whoami                    # Autenticado
wrangler d1 list                   # portfolio-db aparece
wrangler kv namespace list         # CACHE aparece
wrangler r2 bucket list            # rominarotela-images aparece
```

Todos los recursos existen y los IDs están anotados para la siguiente fase.

## Siguiente fase

→ @.claude/plans/phases/phase-01-scaffolding.md (usar los IDs reales en wrangler.jsonc)
