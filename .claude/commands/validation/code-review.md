---
description: Code review exhaustivo de archivos recientemente modificados. Revisa lógica, seguridad, performance y calidad.
---

# Code Review — Revisión de Código

## Paso 1: Identificar Archivos a Revisar

Determina los archivos modificados recientemente:

```bash
git diff --name-only HEAD~1 HEAD 2>/dev/null
git diff --name-only 2>/dev/null
git diff --cached --name-only 2>/dev/null
```

Si no hay cambios en Git, pregunta al usuario qué archivos revisar.

Filtra solo archivos TypeScript (`.ts`, `.tsx`) y de configuración relevantes.

## Paso 2: Leer Reglas del Proyecto

Lee `CLAUDE.md` y las secciones referenciadas para tener las convenciones como checklist de revisión.

## Paso 3: Leer Archivos Completos

Lee cada archivo a revisar **completo** (no solo los diffs). El contexto completo es necesario para detectar problemas de lógica y consistencia.

## Paso 4: Revisión por Categoría

Para cada archivo, evalúa las siguientes categorías:

### 4.1 Correctitud Lógica
- Flujo de control correcto (condiciones, loops, early returns)
- Manejo de casos edge (null, undefined, arrays vacíos, strings vacíos)
- Manejo de errores (try/catch en operaciones async, errores de D1/KV/R2)
- Consistencia de tipos (no hay casteos inseguros ni `as any`)

### 4.2 Seguridad
- No hay secretos hardcodeados (API keys, tokens, passwords)
- Input validation en boundaries de API (parámetros de request)
- Queries D1 parametrizadas (no string interpolation en SQL)
- Headers de seguridad apropiados en responses
- No hay exposición de datos sensibles en logs o responses

### 4.3 Performance
- No hay queries N+1 a D1
- Uso apropiado de KV para cache
- No hay operaciones bloqueantes innecesarias
- Tamaño de payload razonable en responses

### 4.4 Calidad de Código
- Naming: camelCase funciones/variables, PascalCase tipos, nombres descriptivos
- TSDoc en todas las funciones y tipos exportados
- Archivos < 300 líneas
- No hay código muerto o comentado
- No hay TODOs sin issue asociado
- Imports organizados

### 4.5 Cumplimiento de CLAUDE.md
- TypeScript strict (no `any` sin justificación)
- Patrones del proyecto respetados
- Logging estructurado (si aplica)
- Tests existentes para el archivo

## Modo Team (6+ archivos)

Si hay 6 o más archivos a revisar:

1. Agrupa por dominio funcional
2. Prioriza: archivos de API > lógica de negocio > utilidades > configuración
3. Revisa en orden de prioridad
4. Marca dependencias entre archivos

## Paso 5: Generar Reporte

Crea el directorio si no existe:

```bash
mkdir -p .claude/code-reviews
```

Guarda en `.claude/code-reviews/review-{YYYY-MM-DD-HHmm}.md`:

```markdown
# Code Review — {Fecha}

## Resumen
- Archivos revisados: X
- Issues encontrados: Y (Z críticos, W menores)
- Recomendación: APROBAR / APROBAR CON CAMBIOS / RECHAZAR

## Issues por Archivo

### `path/to/file.ts`

| # | Severidad | Categoría | Línea | Descripción | Sugerencia |
|---|---|---|---|---|---|
| 1 | alta | seguridad | 42 | SQL sin parametrizar | Usar .bind() |
| 2 | baja | calidad | 15 | Nombre poco descriptivo | Renombrar a X |

{... más archivos ...}

## Issues Críticos (requieren fix)
1. {Descripción y ubicación}

## Mejoras Sugeridas (opcionales)
1. {Descripción y ubicación}

## Puntos Positivos
- {Qué está bien hecho}
```

Presenta el resumen al usuario e indica la ubicación del reporte completo.
