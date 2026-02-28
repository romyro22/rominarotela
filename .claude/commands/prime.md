---
description: Carga contexto completo del proyecto. Lee CLAUDE.md, secciones, archivos clave y resume el estado actual.
---

# Prime — Carga de Contexto del Proyecto

## Paso 1: Leer reglas del proyecto

Lee el archivo `CLAUDE.md` en la raíz del proyecto. Este archivo referencia secciones adicionales con la sintaxis `@.claude/sections/*.md`. Lee TODAS las secciones referenciadas para obtener las reglas completas del proyecto.

## Paso 2: Leer configuración del stack

Lee los siguientes archivos de configuración si existen:

- `wrangler.jsonc` o `wrangler.toml` — configuración de Cloudflare Workers (bindings D1, KV, R2, rutas, compatibilidad)
- `package.json` — dependencias, scripts disponibles, metadata del proyecto
- `tsconfig.json` — configuración de TypeScript
- `biome.json` o `biome.jsonc` — configuración de linter/formatter

## Paso 3: Leer archivos fuente clave

Lee los siguientes archivos si existen. No falles si alguno no existe todavía (el proyecto está en migración):

- `src/index.ts` — entry point del Worker
- `src/router.ts` o `src/routes.ts` — definición de rutas (si existe)
- `src/types.ts` o `src/types/index.ts` — tipos compartidos (si existe)

## Paso 4: Descubrir estructura actual

Ejecuta `find src/ -type f -name '*.ts' | head -30` para ver los archivos TypeScript existentes.
Ejecuta `ls -la migrations/ 2>/dev/null` para ver migraciones D1 existentes.
Ejecuta `ls -la .claude/plans/` para ver planes pendientes o completados.

## Paso 5: Revisar estado de Git

Ejecuta `git status --short` y `git log --oneline -5` para entender el estado actual del repositorio y los cambios recientes.

## Paso 6: Generar resumen

Produce un resumen estructurado con:

1. **Estado del proyecto** — fase actual de la migración, qué existe y qué falta
2. **Stack confirmado** — tecnologías detectadas en los archivos de configuración
3. **Archivos clave** — lista de archivos fuente principales y su propósito
4. **Bindings activos** — D1, KV, R2 configurados en wrangler
5. **Scripts disponibles** — comandos npm/wrangler listos para usar
6. **Planes pendientes** — planes en `.claude/plans/` no completados
7. **Últimos cambios** — resumen de los últimos 5 commits
8. **Próximos pasos sugeridos** — basados en el estado detectado

Mantén el resumen conciso. No repitas el contenido completo de CLAUDE.md, solo confirma que fue leído y destaca cualquier inconsistencia detectada entre las reglas y el estado actual del código.
