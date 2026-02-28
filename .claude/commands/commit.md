---
description: Valida, prepara y crea un commit atómico siguiendo las convenciones del proyecto.
---

# Commit — Commit Atómico con Validación

## Paso 1: Inspeccionar Estado

Ejecuta en paralelo:

```bash
git status --short
git diff --stat
git diff --cached --stat
git log --oneline -5
```

Si no hay cambios (staged o unstaged), informa al usuario y detente.

## Paso 2: Validación Pre-Commit

Ejecuta la suite de validación antes de commitear. Usa los mismos comandos del comando `/validate`:

```bash
npx biome check src/
npx tsc --noEmit
npx vitest --run
```

Si algún check falla, reporta los errores y pregunta al usuario si desea:
- (a) Corregir los errores antes de commitear
- (b) Commitear de todas formas (no recomendado)

Si el usuario elige (a), corrige y vuelve a validar.

## Paso 3: Analizar Cambios

Revisa `git diff` (staged y unstaged) para entender qué se cambió. Agrupa los cambios por propósito lógico. Si hay cambios que deberían ser commits separados, sugiere al usuario dividirlos.

## Paso 4: Redactar Mensaje de Commit

**Convención del proyecto: mensajes en español.**

Analiza los últimos 5 commits con `git log --oneline -5` para mantener consistencia de estilo.

Reglas para el mensaje:
- Idioma: español
- Primera línea: descripción concisa del cambio (máximo 72 caracteres)
- Si es necesario, cuerpo explicativo separado por línea en blanco
- Verbos en gerundio o infinitivo según el estilo detectado en el historial

## Paso 5: Crear Commit

Presenta el mensaje propuesto al usuario. Si el usuario aprueba o no objeta:

1. Stage los archivos relevantes (`git add` de archivos específicos, NO `git add -A`)
2. Crea el commit con el mensaje aprobado
3. Verifica con `git log --oneline -3` que el commit se creó correctamente

No hagas push automáticamente. Informa al usuario que el commit fue creado y pregunta si desea push.
