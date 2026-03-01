---
description: Realiza un Root Cause Analysis (RCA) para un issue de GitHub.
argument-hint: ID del issue de GitHub (ej. 42)
---

# RCA — Root Cause Analysis

**Issue ID:** #$ARGUMENTS

---

## Paso 1: Obtener Información del Issue

```bash
gh issue view $ARGUMENTS --json title,body,labels,assignees,comments,createdAt,state
```

Si el comando falla, verifica que `gh` esté autenticado y que el repositorio tenga un remote configurado. Si no hay remote, pide al usuario la URL del issue.

Lee el título, descripción y comentarios para entender el problema reportado.

## Paso 2: Reproducir el Contexto

Identifica las áreas del código mencionadas en el issue:

- Busca archivos, funciones o endpoints mencionados explícitamente
- Busca términos clave del error en el codebase con grep/ripgrep
- Lee los archivos relevantes COMPLETOS (no solo fragmentos)

```bash
# Ejemplo de búsqueda
grep -rn "término_del_error" src/ --include="*.ts"
```

## Paso 3: Revisar Historial de Git

Busca commits recientes que puedan haber introducido el bug:

```bash
git log --oneline -20 -- src/
git log --all --oneline --grep="keyword_del_issue" -10
```

Si se identifica un commit sospechoso, revisa su diff:

```bash
git show {commit_hash} --stat
git show {commit_hash} -- {archivo_afectado}
```

## Paso 4: Análisis de Causa Raíz

Investiga siguiendo esta jerarquía:

1. **Síntoma** — Qué observa el usuario o qué falla
2. **Causa inmediata** — Qué línea de código o configuración produce el síntoma
3. **Causa raíz** — Por qué existe esa línea/configuración incorrecta
4. **Causa sistémica** — Qué falta en el proceso para prevenir este tipo de bug (test faltante, validación ausente, tipo incorrecto)

## Paso 5: Evaluación de Impacto

- **Severidad:** crítica / alta / media / baja
- **Alcance:** qué funcionalidades se ven afectadas
- **Usuarios afectados:** todos / subset / edge case
- **Datos en riesgo:** sí / no (y detalle)

## Paso 6: Propuesta de Fix

Propone una solución concreta:

- Archivos a modificar con descripción del cambio
- Tests a crear o actualizar
- Validaciones a ejecutar
- Riesgos de regresión

## Modo Team (issues complejos)

Si el issue afecta 5+ archivos o cruza múltiples dominios:

1. Agrupa los cambios por dominio (API, datos, lógica, configuración)
2. Identifica dependencias entre los cambios
3. Sugiere orden de implementación
4. Marca qué cambios pueden hacerse en paralelo

## Paso 7: Generar Documento RCA

Crea el directorio si no existe y guarda el documento:

```bash
mkdir -p docs/rca
```

Guarda en `docs/rca/issue-$ARGUMENTS.md` con esta estructura:

```markdown
# RCA: Issue #$ARGUMENTS — {Título del Issue}

**Fecha:** {YYYY-MM-DD}
**Severidad:** {crítica|alta|media|baja}
**Estado:** investigado

## Síntoma
{Descripción del problema observado}

## Causa Inmediata
{Qué produce el error directamente}

## Causa Raíz
{Por qué existe el problema}

## Causa Sistémica
{Qué falta en el proceso}

## Impacto
{Alcance y severidad del problema}

## Fix Propuesto
{Descripción detallada de la solución}

### Archivos a Modificar
- `path/to/file.ts` — {qué cambiar}

### Tests a Crear
- `tests/path/to/test.ts` — {qué validar}

## Validación del Fix
{Comandos para verificar que el fix es correcto}

## Prevención Futura
{Qué agregar para evitar bugs similares}
```

Confirma al usuario la ubicación del documento generado.
