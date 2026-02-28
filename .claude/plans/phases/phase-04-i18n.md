# Fase 04: i18n — Traducciones y utilidades

**Plan padre:** @.claude/plans/cloudflare-full-migration.md
**Estado:** pendiente
**Depende de:** @.claude/plans/phases/phase-02-types-utils.md
**Desbloquea:** Fase 06 (Design/Layout), Fase 08 (Portfolio Page), Fase 09 (Gallery Page)

## Agentes

| Rol | Agente | Activo | Tarea principal |
|-----|--------|--------|-----------------|
| Researcher | `researcher-p04` | **Sí** | Extraer TODAS las 117+ translation keys de index.html y 15+ de galeria.html. Verificar Astro i18n routing en Context7 (currentLocale, prefixDefaultLocale). |
| Engineer | `engineer-p04` | **Sí** | Crear translations.ts con las keys extraídas y utils.ts con t(), localizedField(), getCvPath(). |
| Tester | — | No | Traducciones se validan con tsc + uso en componentes |
| Reviewer | `reviewer-p04` | **Sí** | Verificar que TODAS las keys del HTML original están presentes. Verificar que ninguna traducción fue inventada (deben coincidir textualmente). |

## Objetivo

Sistema de traducciones extraído de los HTML originales, integrado con el i18n nativo de Astro. Al completar, cualquier componente puede acceder a traducciones vía `t(locale, "key")`.

## Contexto

**Leer antes de implementar:**
- `index.html` — sección `<script>` con objeto `translations` (117+ keys ES/EN)
- `galeria.html` — sección `<script>` con traducciones de galería (15+ keys)
- `astro.config.ts` — configuración i18n ya definida en Fase 01

**Cómo funciona Astro i18n:**
- Default locale `es` → URLs sin prefijo: `/`, `/galeria`
- Locale `en` → URLs con prefijo: `/en/`, `/en/galeria`
- En pages/components: `Astro.currentLocale` devuelve `"es"` o `"en"`
- No se duplican pages — una sola `index.astro` sirve ambos idiomas

## Tareas

### 4.1 Archivo de traducciones

- [ ] CREATE `src/i18n/translations.ts`:

Extraer **todas** las keys de ambos HTML. Estructura:

```typescript
export const translations: Record<string, Record<string, string>> = {
  es: {
    // Header
    "header.tagline": "Desarrolladora Frontend & Artista Visual",
    "header.contact": "Contacto",
    // Hero
    "hero.greeting": "Hola! Soy",
    "hero.role": "Desarrollo Web & Arte Visual",
    "hero.subtitle": "Fusiono la tecnología con el arte...",
    "hero.cta.projects": "Ver proyectos",
    "hero.cta.skills": "Habilidades",
    // Gallery
    "gallery.title": "Galería de Arte",
    "gallery.search.placeholder": "Buscar por nombre...",
    "gallery.filter.all": "Todas las técnicas",
    "gallery.results.none": "Sin resultados",
    // Modal
    "modal.size": "Tamaño",
    "modal.technique": "Técnica",
    // ... (117+ keys totales)
    // Sections, Experience, Skills, Projects, Footer
  },
  en: {
    // Mismas keys en inglés
  },
};
```

> **Trabajo principal:** Extraer textualmente las 117+ keys de `index.html` y las 15+ keys de `galeria.html`. No inventar traducciones — usar las que ya existen en los HTML.

### 4.2 Utilidades de traducción

- [ ] CREATE `src/i18n/utils.ts`:

```typescript
import { translations } from "./translations";

type SupportedLocale = "es" | "en";

/** Get a translation by key for the given locale. Falls back to Spanish, then to the key itself. */
export function t(locale: string | undefined, key: string): string {
  const lang: SupportedLocale = locale === "en" ? "en" : "es";
  return translations[lang][key] ?? translations["es"][key] ?? key;
}

/** Pick the localized value from an ES/EN pair. */
export function localizedField(
  locale: string | undefined,
  esValue: string,
  enValue: string
): string {
  return locale === "en" && enValue ? enValue : esValue;
}

/** Get the CV download path based on locale. */
export function getCvPath(locale: string | undefined): string {
  return locale === "en" ? "/docs/cv_rominarotela_en.pdf" : "/docs/cv_rominarotela.pdf";
}
```

## Validación de Fase

```bash
npx tsc --noEmit        # Tipos compilan
npx biome check src/    # Lint pasa
```

Verificación manual:
- Importar `t("es", "hero.greeting")` → devuelve `"Hola! Soy"`
- Importar `t("en", "hero.greeting")` → devuelve `"Hi! I'm"`
- Importar `t("es", "nonexistent.key")` → devuelve `"nonexistent.key"` (fallback)

## Siguiente fase

→ @.claude/plans/phases/phase-06-design-layout.md
