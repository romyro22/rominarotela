---
description: Corrige los issues identificados en un code review, uno por uno.
argument-hint: Ruta al archivo de review o descripción del issue a corregir
---

# Code Review Fix — Corrección de Issues de Code Review

**Input:** $ARGUMENTS

---

## Paso 1: Leer el Review

Si el argumento es una ruta a un archivo de review (`.claude/code-reviews/*.md`), lee el archivo completo.

Si el argumento es una descripción textual, úsala directamente como lista de issues a corregir.

Si no se proporciona argumento, busca el review más reciente:

```bash
ls -t .claude/code-reviews/review-*.md 2>/dev/null | head -1
```

Lee también `CLAUDE.md` y las secciones referenciadas para aplicar las convenciones correctas.

## Paso 2: Priorizar Issues

Ordena los issues por severidad:
1. **Críticos** — Seguridad, crashes, pérdida de datos
2. **Altos** — Bugs lógicos, tipos incorrectos
3. **Medios** — Performance, mantenibilidad
4. **Bajos** — Estilo, naming, documentación

## Paso 3: Corregir Uno por Uno

Para cada issue, en orden de prioridad:

1. **Anuncia** qué issue estás corrigiendo (número, archivo, descripción)
2. **Lee** el archivo completo antes de editarlo
3. **Aplica** la corrección siguiendo la sugerencia del review
4. **Explica** brevemente qué se cambió y por qué
5. **Valida** con type check parcial tras cada corrección:

```bash
npx tsc --noEmit
```

Si la corrección requiere un test nuevo o actualizado, créalo inmediatamente.

## Paso 4: Crear Tests para Fixes Críticos

Para cada fix de severidad crítica o alta:

- Crea un test que habría detectado el problema
- Verifica que el test pasa con el fix aplicado

```bash
npx vitest --run
```

## Paso 5: Validación Final

Ejecuta la suite completa:

```bash
npx biome check src/
npx tsc --noEmit
npx vitest --run
```

## Paso 6: Resumen

Presenta al usuario:

| Issue | Severidad | Archivo | Estado |
|---|---|---|---|
| {Descripción} | {alta} | {path} | Corregido / No aplicable / Pendiente |

- **Issues corregidos:** X de Y
- **Tests creados:** {lista}
- **Validación:** PASS/FAIL
- **Issues pendientes:** {lista con justificación si hay}
