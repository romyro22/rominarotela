---
description: Ejecuta la suite completa de validación de calidad en 5 niveles. Reporta PASS/FAIL por nivel.
---

# Validate — Suite de Validación de Calidad

Ejecuta todos los niveles de validación en orden. Si un nivel falla, continúa con los demás para dar un reporte completo. No te detengas en el primer fallo.

---

## Nivel 1: Lint + Formato (Biome)

```bash
npx biome check src/
```

Verifica que no haya errores de linting ni problemas de formato. Si falla, reporta los errores y sugiere:

```bash
npx biome check --write src/   # auto-fix
```

---

## Nivel 2: Type Check (TypeScript)

```bash
npx tsc --noEmit
```

Verifica que no haya errores de tipos. Si falla, clasifica los errores por tipo (missing types, incompatible types, missing imports, etc.) y sugiere correcciones específicas.

---

## Nivel 3: Tests Unitarios (Vitest)

```bash
npx vitest --run
```

Ejecuta todos los tests. Si falla, reporta qué tests fallaron y sugiere investigar los archivos afectados.

Si no hay tests configurados o no hay archivos de test, reporta como SKIP (no FAIL) e indica que se deben crear tests.

---

## Nivel 4: Tests de Integración

```bash
npx vitest --run tests/integration/ 2>/dev/null
```

Ejecuta tests de integración si el directorio existe. Si no existe, reporta como SKIP.

---

## Nivel 5: Build Verification (Wrangler)

```bash
wrangler deploy --dry-run 2>&1
```

Verifica que el proyecto compila correctamente para deploy. Si falla, revisa la configuración de `wrangler.jsonc` o `wrangler.toml` y los bindings.

---

## Reporte Final

Presenta los resultados en este formato:

```
=== REPORTE DE VALIDACIÓN ===

Nivel 1 — Biome (lint + format):  ✓ PASS | ✗ FAIL | ⊘ SKIP
Nivel 2 — TypeScript (tipos):     ✓ PASS | ✗ FAIL | ⊘ SKIP
Nivel 3 — Tests unitarios:        ✓ PASS | ✗ FAIL | ⊘ SKIP
Nivel 4 — Tests integración:      ✓ PASS | ✗ FAIL | ⊘ SKIP
Nivel 5 — Build (wrangler):       ✓ PASS | ✗ FAIL | ⊘ SKIP

Resultado: X/5 PASS
```

### Si hay fallos

Para cada nivel con FAIL, provee:

1. **Resumen del error** — qué falló y cuántos errores
2. **Errores principales** — los 5 errores más importantes
3. **Sugerencia de fix** — comando o acción para corregir
4. **Prioridad** — alta (bloquea deploy), media (degrada calidad), baja (cosmético)

### Criterio de Éxito

El código está listo para commit cuando los 5 niveles son PASS (o SKIP para niveles opcionales). Si algún nivel obligatorio (1, 2, 5) falla, el código NO está listo.
