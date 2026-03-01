# Fase 06: Design System — CSS global y Layout base

**Plan padre:** @.claude/plans/cloudflare-full-migration.md
**Estado:** pendiente
**Depende de:** @.claude/plans/phases/phase-04-i18n.md
**Desbloquea:** Fase 08 (Portfolio Page), Fase 09 (Gallery Page)

## Agentes

| Rol | Agente | Activo | Tarea principal |
|-----|--------|--------|-----------------|
| Researcher | `researcher-p06` | **Sí** | Leer CSS completo de index.html (lines 8-640) y galeria.html (lines 8-380). Extraer custom properties, grid systems, breakpoints. Buscar Astro component patterns (Props interface, class:list, slots) en Context7. |
| Engineer | `engineer-p06` | **Sí** | Crear global.css, BaseLayout.astro, Header.astro, Footer.astro, LanguageSwitcher.astro. Extraer CSS preservando diseño visual exacto. |
| Tester | — | No | Validación visual, no unit tests |
| Reviewer | `reviewer-p06` | **Sí** | Verificar que CSS custom properties coinciden con el original. Verificar accesibilidad (aria-labels, semantic HTML). Verificar que LanguageSwitcher usa links (no localStorage). |

## Objetivo

Extraer el CSS de los HTML inline a un archivo global y crear los componentes de layout Astro (BaseLayout, Header, Footer, LanguageSwitcher). Al completar, las pages tienen un shell visual funcional.

## Contexto

**Leer antes de implementar:**
- `index.html` lines 8-640 — CSS completo del portfolio (~600 líneas)
- `galeria.html` lines 8-380 — CSS de la galería (~370 líneas)
- `src/i18n/utils.ts` — funciones `t()` y `getCvPath()` de Fase 04

**CSS design system actual:**
```css
:root {
  --bg-900: #190B33;  --bg-800: #22104A;  --bg-700: #2B1561;
  --accent-magenta: #FF3C8E;  --accent-orange: #FF8A00;
  --accent-teal: #22C6C6;  --accent-yellow: #FFD24D;  --accent-blue: #3AA0FF;
  --card: #24124D;  --text: #FFFFFF;  --muted: #C9C6D8;
  --radius: 18px;  --shadow: 0 12px 30px rgba(0, 0, 0, .25);
}
```

**Nota importante:** El portfolio y la galería tienen paletas ligeramente diferentes. El portfolio usa la paleta de arriba (purples/magentas), la galería usa una paleta más oscura (`--bg: #0f1115`, `--accent: #7c5cff`). Unificar en `global.css` con scope classes o mantener como variantes.

## Tareas

### 6.1 CSS Global

- [ ] CREATE `src/styles/global.css`:

Extraer de index.html y galeria.html:
- **CSS custom properties** (`:root`)
- **Reset** (box-sizing, margin, body background)
- **Typography** (font-family, clamp sizes)
- **Grid systems** (`.container`, `.grid-2`, `.grid-3`, `.grid-4`, `.grid`)
- **Card styles** (`.card`)
- **Button styles** (`.btn`, `.btn-primary`, `.btn-ghost`, `.btn.primary`)
- **Form inputs** (`.input`, `select`, `button`)
- **Tags/pills** (`.tag`, `.pill`, `.chip`)
- **Header sticky** con backdrop-filter
- **Responsive breakpoints** (`@media` queries existentes)
- **Utilidades** (`.sr-only`, `.muted`)

> Duplicar las ~600+370 líneas de CSS es aceptable inicialmente. Refactorizar después si es necesario.

### 6.2 Base Layout

- [ ] CREATE `src/layouts/BaseLayout.astro`:

```astro
---
import "../styles/global.css";
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";

interface Props {
  title: string;
  description?: string;
  bodyClass?: string;
}

const { title, description, bodyClass } = Astro.props;
const locale = Astro.currentLocale ?? "es";
---

<!doctype html>
<html lang={locale}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
  </head>
  <body class={bodyClass}>
    <Header locale={locale} />
    <slot />
    <Footer locale={locale} />
  </body>
</html>
```

### 6.3 Header

- [ ] CREATE `src/components/Header.astro`:

Extraer del HTML original. Incluye:
- Logo (`/img/logomrri.png`)
- Tagline chip con i18n
- LanguageSwitcher component
- Contact link

### 6.4 Footer

- [ ] CREATE `src/components/Footer.astro`:

Extraer del HTML original. Incluye:
- CTA text con i18n
- Botones: WhatsApp, CV download (ruta dinámica según locale), GitHub
- Copyright con año dinámico

### 6.5 Language Switcher

- [ ] CREATE `src/components/LanguageSwitcher.astro`:

```astro
---
interface Props {
  locale: string;
  currentPath: string;
}

const { locale, currentPath } = Astro.props;

function getAlternateUrl(path: string, currentLocale: string): string {
  if (currentLocale === "en") {
    return path.replace(/^\/en\/?/, "/") || "/";
  }
  return `/en${path === "/" ? "/" : path}`;
}

const alternateUrl = getAlternateUrl(currentPath, locale);
---

<div class="lang-switcher">
  <a
    href={locale === "es" ? currentPath : alternateUrl}
    class:list={["lang-btn", { active: locale === "es" }]}
    aria-label="Español"
  >ES</a>
  <a
    href={locale === "en" ? currentPath : alternateUrl}
    class:list={["lang-btn", { active: locale === "en" }]}
    aria-label="English"
  >EN</a>
</div>
```

> **Diferencia clave vs HTML original:** El language switcher ahora usa links (`<a>`) en lugar de buttons con localStorage. Astro maneja el idioma via URL routing, no client-side state.

## Validación de Fase

```bash
npx astro check         # Sin errores
npm run dev             # Arranca, layout visible con header/footer
```

Verificación manual:
- Header muestra logo, tagline, language switcher
- Footer muestra CTA, botones, copyright
- Cambiar idioma navega a `/en/` (EN) y `/` (ES)
- CSS custom properties se aplican correctamente

## Siguiente fase

→ @.claude/plans/phases/phase-08-portfolio-page.md
→ @.claude/plans/phases/phase-09-gallery-page.md
