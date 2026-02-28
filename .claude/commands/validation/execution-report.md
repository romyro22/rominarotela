---
description: Genera un reporte de ejecución post-implementación. Documenta resultados, divergencias y recomendaciones.
---

# Execution Report — Reporte Post-Implementación

## Paso 1: Recopilar Información

Ejecuta los siguientes comandos para entender qué se implementó:

```bash
git log --oneline -20
git diff --stat HEAD~10 HEAD 2>/dev/null
git diff --name-only HEAD~10 HEAD 2>/dev/null
```

Busca el plan de implementación más reciente:

```bash
ls -t .claude/plans/*.md 2>/dev/null | head -3
```

Si hay un plan relacionado, léelo para comparar lo planificado vs lo ejecutado.

## Paso 2: Estado de Validación Actual

Ejecuta la suite de validación:

```bash
npx biome check src/ 2>&1 | tail -5
npx tsc --noEmit 2>&1 | tail -10
npx vitest --run 2>&1 | tail -15
wrangler deploy --dry-run 2>&1 | tail -5
```

## Paso 3: Analizar Archivos Cambiados

Lee los archivos más significativos que fueron creados o modificados. Identifica:

- Nuevas funcionalidades agregadas
- Refactorizaciones realizadas
- Configuraciones modificadas
- Tests añadidos

## Paso 4: Generar Reporte

Crea el directorio si no existe:

```bash
mkdir -p .claude/execution-reports
```

Guarda en `.claude/execution-reports/report-{YYYY-MM-DD-HHmm}.md`:

```markdown
# Reporte de Ejecución — {Fecha}

## Resumen
{1-2 párrafos describiendo qué se implementó}

## Plan de Referencia
- **Archivo:** {path al plan o "sin plan formal"}
- **Adherencia:** {alta|media|baja}

## Qué se Implementó
| # | Tarea | Estado | Notas |
|---|---|---|---|
| 1 | {descripción} | Completada / Parcial / Omitida | {detalle} |

## Archivos Afectados
### Creados
- `path/to/new/file.ts` — {propósito}

### Modificados
- `path/to/file.ts` — {qué se cambió}

### Eliminados
- `path/to/old/file.ts` — {razón}

## Resultados de Validación
| Nivel | Herramienta | Resultado |
|---|---|---|
| Lint + Format | Biome | PASS/FAIL |
| Type Check | TypeScript | PASS/FAIL |
| Tests | Vitest | PASS/FAIL (X/Y) |
| Build | Wrangler | PASS/FAIL |

## Desafíos Encontrados
1. **{Desafío}** — {cómo se resolvió o su estado actual}

## Divergencias del Plan
1. **{Divergencia}** — {justificación, clasificar como positiva/negativa}

## Items Omitidos
1. **{Item}** — {razón de la omisión, impacto}

## Recomendaciones
1. {Recomendación para el siguiente paso}
2. {Mejora técnica sugerida}
3. {Deuda técnica identificada}

## Métricas
- Archivos creados: X
- Archivos modificados: Y
- Tests añadidos: Z
- Cobertura estimada: {si disponible}
```

Presenta el resumen al usuario e indica la ubicación del reporte.
