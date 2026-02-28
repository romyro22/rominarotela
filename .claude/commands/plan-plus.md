---
description: Genera un plan de implementación estructurado para una feature o tarea.
argument-hint: Descripción de la feature o tarea a planificar
---

# Plan — Planificación de Feature

**Feature solicitada:** $ARGUMENTS

---

## Fase A: Vibe Planning (Exploración)

Antes de generar un plan estructurado, explora el problema:

1. **Comprensión** — Reformula la feature en tus propias palabras. Identifica ambigüedades.
2. **Preguntas** — Genera al menos 3 preguntas clarificadoras sobre la feature. Presenta las preguntas al usuario y ESPERA respuestas antes de continuar a la Fase B. Si el usuario indica que continúes sin responder, usa tu mejor criterio.
3. **Opciones** — Propone al menos 3 enfoques diferentes para implementar la feature. Para cada uno indica: descripción breve, pros, contras, complejidad estimada (baja/media/alta).
4. **Recomendación** — Indica cuál opción recomendarías y por qué.

---

## Fase B: Plan Estructurado (5 fases de análisis)

### B1. Comprensión de la Feature

- Descripción clara y concisa de qué se va a construir
- User story en formato: "Como [usuario], quiero [acción], para [beneficio]"
- Criterios de aceptación como lista verificable

### B2. Inteligencia del Codebase

Lee `CLAUDE.md` y las secciones referenciadas. Examina la estructura actual:

- Ejecuta `find src/ -type f -name '*.ts' 2>/dev/null | head -40`
- Lee `wrangler.jsonc` o `wrangler.toml` para entender los bindings
- Lee `package.json` para dependencias disponibles
- Identifica patrones existentes en el código que deben respetarse
- Lista los archivos que deberán ser leídos durante la implementación

### B3. Investigación Externa

Si la feature requiere APIs de Cloudflare, D1, KV, R2 u otra tecnología:

- Consulta documentación relevante
- Identifica limitaciones conocidas (tamaño de D1, límites de Workers, etc.)
- Verifica compatibilidad con las versiones del stack

### B4. Pensamiento Estratégico

- Identifica riesgos técnicos y mitigaciones
- Determina si hay decisiones arquitectónicas que tomar
- Evalúa impacto en archivos existentes
- Considera la estrategia de testing

### B5. Generación del Plan

Genera el archivo de plan en `.claude/plans/{feature-name}.md` con esta estructura exacta:

```markdown
# Plan: {Nombre de la Feature}

**Fecha:** {YYYY-MM-DD}
**Estado:** pendiente
**Confianza:** X/10

## Descripción
{Descripción clara de la feature}

## User Story
Como {usuario}, quiero {acción}, para {beneficio}.

## Enfoque Seleccionado
{Descripción del enfoque y justificación}

## Decisiones Técnicas
- {Decisión 1}: {justificación}
- {Decisión 2}: {justificación}

## Archivos a Leer (antes de implementar)
- `path/to/file.ts` — razón
- `path/to/other.ts` — razón

## Tareas

### Tarea 1: {Título}
- [ ] CREATE `src/path/to/file.ts` — {descripción}
- [ ] UPDATE `src/existing/file.ts` — {qué cambiar}
- [ ] ADD dependencia `{paquete}` — {razón}
- [ ] VALIDATE: `npx biome check src/`

### Tarea 2: {Título}
- [ ] CREATE `src/path/to/file.ts` — {descripción}
- [ ] VALIDATE: `npx tsc --noEmit`

{... más tareas ...}

### Tarea N: Testing
- [ ] CREATE `tests/path/to/file.test.ts` — {qué testea}
- [ ] VALIDATE: `npx vitest --run`

## Estrategia de Testing
- Tests unitarios: {qué se testea}
- Tests de integración: {qué se testea}
- Cobertura objetivo: {porcentaje}

## Criterios de Aceptación
- [ ] {Criterio 1}
- [ ] {Criterio 2}
- [ ] {Criterio N}

## Suite de Validación
```bash
npx biome check src/
npx tsc --noEmit
npx vitest --run
wrangler deploy --dry-run
```

## Estructura del Codebase (tras implementación)
```
src/
├── {estructura esperada tras completar el plan}
```
```

### Test "No Prior Knowledge"

Antes de finalizar, revisa el plan y pregúntate: "¿Podría un desarrollador que nunca vio este proyecto ejecutar este plan sin preguntas adicionales?" Si la respuesta es no, agrega más contexto.

### Reglas del Plan

- Todos los ejemplos de código deben ser TypeScript
- Usa las keywords CREATE, UPDATE, ADD, REMOVE para cada acción
- Cada grupo de tareas debe terminar con un paso VALIDATE
- La confianza X/10 refleja qué tan seguro estás de que el plan es correcto y completo
- Si la confianza es < 7/10, indica explícitamente qué falta investigar

Confirma al usuario cuando el plan esté guardado e indica el path del archivo.
