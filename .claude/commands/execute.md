---
description: Ejecuta un plan de implementación previamente generado, tarea por tarea.
argument-hint: Ruta al archivo de plan (ej. .claude/plans/mi-feature.md)
---

# Execute — Ejecución de Plan

**Archivo de plan:** $ARGUMENTS

---

## IMPORTANTE: Conversación Nueva

Este comando debe ejecutarse idealmente en una **conversación nueva** para evitar contaminación de contexto. Si estás en una conversación existente, ten en cuenta que el contexto previo puede influir en las decisiones.

## Paso 1: Leer el Plan

Lee el archivo de plan completo proporcionado como argumento. Si el archivo no existe, informa al usuario y detente.

Lee también `CLAUDE.md` y las secciones referenciadas para tener las reglas del proyecto en contexto.

## Paso 2: Leer Archivos Previos

Lee todos los archivos listados en la sección "Archivos a Leer" del plan. Esto te da el contexto necesario antes de hacer cambios.

## Paso 3: Crear Save State

Antes de comenzar cualquier cambio:

```bash
git stash list
git status --short
git log --oneline -3
```

Si hay cambios sin commitear, notifica al usuario y sugiere hacer stash o commit antes de continuar. Crea una rama de trabajo si el plan lo requiere o si estás en `main`:

```bash
git checkout -b feature/{nombre-del-plan}
```

## Paso 4: Ejecutar Tareas

Ejecuta cada tarea del plan EN ORDEN. Para cada tarea:

1. **Anuncia** qué tarea estás ejecutando (número y título)
2. **Ejecuta** cada acción (CREATE, UPDATE, ADD, REMOVE)
3. **Sigue los patrones** definidos en CLAUDE.md — tipos estrictos, TSDoc, naming conventions
4. **Valida** al encontrar un paso VALIDATE en el plan, ejecuta el comando indicado
5. **Si la validación falla**, corrige el error antes de continuar a la siguiente tarea
6. **Si una tarea no puede completarse**, documenta el motivo y continúa con la siguiente

### Reglas de Ejecución

- NO te saltes pasos de validación
- NO cambies el enfoque del plan sin documentar la divergencia
- Si encuentras un problema no previsto en el plan, resuélvelo y documenta
- Cada archivo creado o modificado debe cumplir con las reglas de CLAUDE.md
- TypeScript strict: no `any`, tipos explícitos, TSDoc en exports

## Paso 5: Validación Final

Al terminar todas las tareas, ejecuta la suite completa:

```bash
npx biome check src/
npx tsc --noEmit
npx vitest --run
wrangler deploy --dry-run
```

## Paso 6: Reporte de Completación

Produce un reporte con esta estructura:

### Reporte de Ejecución

| Campo | Detalle |
|---|---|
| **Plan ejecutado** | {nombre del plan} |
| **Tareas completadas** | X de Y |
| **Tareas omitidas** | {lista o "ninguna"} |
| **Archivos creados** | {lista} |
| **Archivos modificados** | {lista} |
| **Archivos eliminados** | {lista o "ninguno"} |

### Desafíos Encontrados
- {Desafío 1}: {cómo se resolvió}

### Divergencias del Plan
- {Divergencia 1}: {justificación}

### Resultados de Validación
- Biome: PASS/FAIL
- TypeScript: PASS/FAIL
- Tests: PASS/FAIL (X passed, Y failed)
- Build: PASS/FAIL

### Recomendaciones
- {Recomendación 1}
- {Recomendación 2}
