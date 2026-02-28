---
description: Genera un Product Requirements Document (PRD) completo para el proyecto o una feature.
argument-hint: Nombre del archivo de salida (ej. portfolio-v2)
---

# Create PRD — Generación de Product Requirements Document

**Archivo de salida:** `.claude/plans/$ARGUMENTS.md`

---

## Contexto

Lee `CLAUDE.md` y las secciones referenciadas para entender el proyecto, stack y convenciones actuales. Revisa la estructura del codebase existente.

## Modo Interactivo

Antes de generar el PRD, haz preguntas al usuario para entender el alcance:

1. **Alcance** — ¿Es un PRD para todo el proyecto o para una feature específica?
2. **Usuarios** — ¿Quiénes son los usuarios objetivo?
3. **MVP** — ¿Cuáles son las funcionalidades mínimas para un primer release?
4. **Restricciones** — ¿Hay restricciones técnicas, de tiempo o presupuesto?
5. **Inspiración** — ¿Hay sitios o proyectos de referencia?

ESPERA las respuestas del usuario antes de continuar.

## Modo Team (opcional)

Si el producto abarca múltiples dominios (backend, frontend, diseño, infraestructura), genera secciones específicas por dominio y marca las dependencias entre equipos.

## Estructura del PRD

Genera un documento con EXACTAMENTE estas 15 secciones:

### 1. Resumen Ejecutivo
Párrafo conciso que describe el producto, su propósito y propuesta de valor.

### 2. Misión y Visión
Misión (qué hace), visión (hacia dónde va), valores del producto.

### 3. Usuarios Objetivo
Personas/perfiles de usuario con necesidades, frustraciones y objetivos.

### 4. Alcance del MVP
Qué se incluye y qué se EXCLUYE explícitamente del MVP.

### 5. User Stories
Formato: "Como [rol], quiero [acción], para [beneficio]." Priorizadas (Must/Should/Could/Won't).

### 6. Arquitectura Técnica
Diagrama de componentes (ASCII o texto), flujo de datos, decisiones arquitectónicas. Stack: Cloudflare Workers + TypeScript + D1/KV/R2.

### 7. Features Detalladas
Para cada feature: descripción, criterios de aceptación, prioridad, estimación de complejidad.

### 8. Stack Tecnológico
Tabla completa de tecnologías con justificación de cada elección. Basado en el stack del proyecto (TypeScript, Cloudflare Workers, D1, KV, R2, Biome, Vitest).

### 9. Seguridad
Modelo de amenazas, medidas de mitigación, manejo de datos sensibles, autenticación/autorización si aplica.

### 10. Especificación de API
Endpoints, métodos HTTP, request/response schemas (TypeScript interfaces), códigos de error.

### 11. Criterios de Éxito
KPIs medibles, métricas de rendimiento, criterios de aceptación globales.

### 12. Fases de Implementación
Roadmap por fases con entregables concretos. Cada fase incluye: objetivo, tareas, dependencias, duración estimada.

### 13. Futuro (Post-MVP)
Features para fases posteriores. Ideas exploradas pero descartadas para el MVP.

### 14. Riesgos y Mitigaciones
Tabla de riesgos con probabilidad, impacto y plan de mitigación.

### 15. Apéndice
Glosario, referencias, links a documentación relevante, decisiones descartadas y su justificación.

---

## Reglas de Generación

- Todos los ejemplos de código en TypeScript
- Interfaces de API como tipos TypeScript, no JSON genérico
- Referenciar tecnologías del stack confirmado (no inventar nuevas sin justificar)
- Cada sección debe poder leerse de forma independiente
- El PRD debe ser útil como input para el comando `/plan-plus`

## Salida

Guarda el PRD en `.claude/plans/$ARGUMENTS.md`. Confirma al usuario el path del archivo generado y presenta un resumen de las secciones creadas.
