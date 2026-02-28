---
description: Implementa el fix documentado en un RCA para un issue de GitHub.
argument-hint: ID del issue de GitHub (ej. 42)
---

# Implement Fix — Implementar Corrección desde RCA

**Issue ID:** #$ARGUMENTS

---

## Paso 1: Leer el RCA

Lee el documento RCA correspondiente:

```
docs/rca/issue-$ARGUMENTS.md
```

Si el archivo no existe, informa al usuario que debe ejecutar `/github_bug_fix/rca $ARGUMENTS` primero.

Lee también `CLAUDE.md` y las secciones referenciadas para tener las reglas del proyecto en contexto.

## Paso 2: Preparar Entorno

```bash
git status --short
git log --oneline -3
```

Si hay cambios sin commitear, notifica al usuario. Crea una rama de trabajo:

```bash
git checkout -b fix/issue-$ARGUMENTS
```

## Paso 3: Implementar el Fix

Sigue la sección "Fix Propuesto" del RCA. Para cada archivo a modificar:

1. Lee el archivo completo antes de editarlo
2. Realiza el cambio documentado
3. Asegúrate de cumplir con las reglas de CLAUDE.md (tipos, TSDoc, naming)
4. Ejecuta validación parcial tras cada cambio significativo:

```bash
npx tsc --noEmit
```

## Paso 4: Crear Tests

Implementa los tests documentados en la sección "Tests a Crear" del RCA:

- Tests unitarios que reproduzcan el bug (deben fallar sin el fix)
- Tests que verifiquen el comportamiento correcto tras el fix
- Tests de regresión para casos edge relacionados

Ejecuta los tests:

```bash
npx vitest --run
```

## Paso 5: Validación Completa

Ejecuta la suite completa de validación:

```bash
npx biome check src/
npx tsc --noEmit
npx vitest --run
wrangler deploy --dry-run
```

Si algún check falla, corrige y vuelve a validar.

## Paso 6: Resumen

Presenta un resumen al usuario:

| Campo | Detalle |
|---|---|
| **Issue** | #$ARGUMENTS |
| **Rama** | fix/issue-$ARGUMENTS |
| **Archivos modificados** | {lista} |
| **Tests creados** | {lista} |
| **Validación** | PASS/FAIL por nivel |

### Cambios Realizados
- {Descripción de cada cambio}

### Divergencias del RCA
- {Si hubo cambios no previstos en el RCA, documentar aquí}

### Próximos Pasos Sugeridos
- Crear commit con `/commit`
- Crear PR referenciando el issue: `gh pr create --title "Fix #$ARGUMENTS: {título}" --body "Closes #$ARGUMENTS"`
