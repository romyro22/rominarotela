---
description: Meta-análisis del proceso. Compara plan vs ejecución, clasifica divergencias y sugiere mejoras al sistema de trabajo.
---

# System Review — Revisión del Proceso de Trabajo

**NOTA:** Este comando NO es un code review. Revisa el PROCESO de trabajo (plan -> ejecución -> resultado), no el código en sí.

---

## Paso 1: Recopilar Artefactos del Proceso

Busca y lee los artefactos más recientes del ciclo PIV:

```bash
ls -t .claude/plans/*.md 2>/dev/null | head -3
ls -t .claude/execution-reports/*.md 2>/dev/null | head -3
ls -t .claude/code-reviews/*.md 2>/dev/null | head -3
```

Lee el plan más reciente y su reporte de ejecución correspondiente. Si no hay artefactos, informa al usuario que necesita al menos un plan y un reporte de ejecución para hacer la revisión.

Lee también `CLAUDE.md` para evaluar si las reglas actuales son adecuadas.

## Paso 2: Comparar Plan vs Ejecución

Para cada tarea del plan:

| Tarea | Plan | Ejecución | Divergencia |
|---|---|---|---|
| {tarea} | {lo planificado} | {lo ejecutado} | {ninguna / positiva / negativa} |

## Paso 3: Clasificar Divergencias

Para cada divergencia encontrada, clasifica como:

### Divergencias Positivas (mejorar el plan)
- El desarrollador encontró una mejor solución durante la implementación
- Se descubrió un requisito no previsto que se incorporó correctamente

### Divergencias Negativas (mejorar el proceso)
- Se omitió una tarea sin justificación
- Se implementó algo diferente a lo planificado sin documentar
- La validación detectó problemas que el plan debió prever

### Divergencias Neutras
- Cambios cosméticos o de organización que no afectan la funcionalidad

## Paso 4: Trazar Causas Raíz

Para cada divergencia negativa, identifica:

1. **En qué fase falló** — ¿Planificación insuficiente? ¿Ejecución descuidada? ¿Validación tardía?
2. **Qué información faltó** — ¿Faltó leer algún archivo? ¿Faltó investigar una API?
3. **Qué regla falta** — ¿Hay algo que debería estar en CLAUDE.md y no está?

## Paso 5: Evaluar Herramientas del Proceso

Evalúa la efectividad de:

- **Plan template** — ¿El formato del plan fue suficiente? ¿Sobró o faltó algo?
- **Validation suite** — ¿Los checks detectaron los problemas a tiempo?
- **Commit conventions** — ¿Se siguieron? ¿Son adecuadas?
- **Commands** — ¿Los slash commands cubrieron las necesidades?

## Paso 6: Generar Reporte y Recomendaciones

Crea el directorio si no existe:

```bash
mkdir -p .claude/system-reviews
```

Guarda en `.claude/system-reviews/review-{YYYY-MM-DD}.md`:

```markdown
# System Review — {Fecha}

## Ciclo Evaluado
- Plan: {path al plan}
- Ejecución: {path al reporte}
- Periodo: {fecha inicio} — {fecha fin}

## Métricas del Proceso
- Tareas planificadas: X
- Tareas completadas: Y (Z%)
- Divergencias positivas: N
- Divergencias negativas: M
- Score del proceso: {bueno|aceptable|necesita mejoras}

## Análisis de Divergencias

### Positivas
1. {Divergencia}: {lección aprendida}

### Negativas
1. {Divergencia}: {causa raíz} -> {acción correctiva}

## Recomendaciones

### Para CLAUDE.md
- {Regla a agregar o modificar}

### Para Commands
- {Comando a mejorar o crear}

### Para Validation
- {Check a agregar o modificar}

### Para el Proceso General
- {Mejora del flujo PIV}

## Conclusión
{Evaluación general y próximos pasos para mejorar el proceso}
```

Presenta el resumen al usuario e indica la ubicación del reporte.
