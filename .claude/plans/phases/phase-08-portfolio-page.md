# Fase 08: Portfolio Page — Migración de index.html

**Plan padre:** @.claude/plans/cloudflare-full-migration.md
**Estado:** pendiente
**Depende de:** @.claude/plans/phases/phase-06-design-layout.md
**Desbloquea:** Fase 12 (Validation)

## Agentes

| Rol | Agente | Activo | Tarea principal |
|-----|--------|--------|-----------------|
| Researcher | `researcher-p08` | **Sí** | Leer index.html completo (~1637 líneas). Mapear cada sección HTML a un componente Astro. Identificar JS interactivo (tabs, smooth scroll, ripple) que necesita `<script>` tags. Verificar Astro component patterns para client-side JS. |
| Engineer | `engineer-p08` | **Sí** | Crear 7 componentes de sección + index.astro. Mover assets estáticos a public/. Preservar JS interactivo en `<script>` tags. |
| Tester | — | No | Validación visual manual |
| Reviewer | `reviewer-p08` | **Sí** | Comparación visual pixel-by-pixel vs index.html original. Verificar i18n en todos los textos. Verificar accesibilidad ARIA. Verificar que todos los links/imágenes funcionan. |

## Objetivo

Convertir index.html en componentes Astro manteniendo el diseño visual idéntico. Cada sección del portfolio se convierte en un componente independiente.

## Contexto

**Leer antes de implementar:**
- `index.html` — archivo completo (~1637 líneas). Contiene:
  - Header (lines 644-662)
  - Hero (lines 666-683)
  - Professional Development (lines 685-827) — 4 subsecciones colapsables
  - Work Experience (lines 829-876) — 4 empleos
  - Soft/Hard Skills (lines 914-929) — 7 badges
  - Work Projects (lines 935-1046) — 6 proyecto cards
  - Personal Projects (lines 1050-1242) — 4 tabs
  - Footer (lines 1250-1265)
  - JavaScript (lines 1269-1637) — tabs, smooth scroll, ripple, language switch
- `src/i18n/translations.ts` — traducciones extraídas en Fase 04
- `src/i18n/utils.ts` — función `t()` y `getCvPath()`
- `src/layouts/BaseLayout.astro` — layout creado en Fase 06

**JavaScript interactivo:**
El index.html tiene JS para: tab navigation (personal projects), smooth scroll, ripple effect en buttons, CV language switch. Este JS se preserva en `<script>` tags dentro de los componentes Astro relevantes.

## Tareas

### 8.1 Componentes de sección

Cada componente recibe `locale: string` como prop y usa `t(locale, "key")` para textos.

- [ ] CREATE `src/components/Hero.astro`:
  - Portrait con gradient background
  - Greeting tag, título, subtítulo (i18n)
  - CTA buttons: "Ver proyectos" y "Habilidades"
  - Ripple effect JS en `<script>` tag

- [ ] CREATE `src/components/DevelopmentSection.astro`:
  - 4 cards colapsables: Educación, Idiomas, Habilidades técnicas, Cursos, Certificados
  - Toggle open/close JS en `<script>` tag
  - Contenido textual vía i18n

- [ ] CREATE `src/components/ExperienceSection.astro`:
  - 4 entradas de trabajo con títulos y bullet points
  - Todo el contenido vía i18n

- [ ] CREATE `src/components/SkillBadges.astro`:
  - 7 pill badges para soft/hard skills
  - Labels vía i18n

- [ ] CREATE `src/components/WorkProjects.astro`:
  - Grid de 6 ProjectCards

- [ ] CREATE `src/components/ProjectCard.astro`:
  - Card reutilizable: imagen, título, tech stack, descripción, link externo
  - Props: `{ image, title, techStack, description, url, locale }`

- [ ] CREATE `src/components/PersonalProjects.astro`:
  - 4 tabs: Emprendimientos, Desarrollo web, Ilustración, UX/UI
  - ARIA-compliant tab navigation
  - Tab switching JS en `<script>` tag (keyboard + click)
  - Cada panel con imagen y texto descriptivo

### 8.2 Page principal

- [ ] UPDATE `src/pages/index.astro` (reemplazar placeholder de Fase 01):

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import Hero from "../components/Hero.astro";
import DevelopmentSection from "../components/DevelopmentSection.astro";
import ExperienceSection from "../components/ExperienceSection.astro";
import SkillBadges from "../components/SkillBadges.astro";
import WorkProjects from "../components/WorkProjects.astro";
import PersonalProjects from "../components/PersonalProjects.astro";
import { t } from "../i18n/utils";

const locale = Astro.currentLocale ?? "es";
---

<BaseLayout title={t(locale, "page.portfolio.title")}>
  <Hero locale={locale} />
  <section id="desarrollo">
    <DevelopmentSection locale={locale} />
  </section>
  <section id="experiencia">
    <ExperienceSection locale={locale} />
  </section>
  <section id="habilidades">
    <SkillBadges locale={locale} />
  </section>
  <section id="proyectos">
    <WorkProjects locale={locale} />
  </section>
  <section id="personal">
    <PersonalProjects locale={locale} />
  </section>
</BaseLayout>
```

### 8.3 Mover assets estáticos

- [ ] MOVE `img/portrait.png`, `img/portrait1.png`, `img/portrait.jpg` → `public/img/`
- [ ] MOVE `img/logomrri.png` → `public/img/`
- [ ] MOVE `img/portalmeta.png`, `img/paraguayeduca.png`, `img/capiypajarito.png`, `img/metamatic.png`, `img/metamatic2.png`, `img/herramientasIA.png`, `img/pyensa.png`, `img/programacion.png`, `img/emprendimientos.png`, `img/ilustracion.png`, `img/figma.png` → `public/img/`
- [ ] MOVE `docs/cv_rominarotela.pdf`, `docs/cv_rominarotela_en.pdf` → `public/docs/`

> **Nota:** Las imágenes de galería (`img/galeria/`) NO se mueven a public — se migran a R2 en Fase 10.

### 8.4 Eliminar HTML legacy

- [ ] REMOVE `index.html` del root (reemplazado por `src/pages/index.astro`)

## Validación de Fase

```bash
npx astro check
npm run dev
```

Verificación manual:
- [ ] Portfolio se renderiza en `http://localhost:4321/`
- [ ] Cada sección es visualmente idéntica al index.html original
- [ ] Language switcher navega a `/en/` y los textos cambian a inglés
- [ ] Tabs de personal projects funcionan (click + keyboard)
- [ ] Smooth scroll funciona en anchor links
- [ ] Todas las imágenes cargan desde `/img/`
- [ ] CV button descarga el PDF correcto según idioma

## Siguiente fase

→ @.claude/plans/phases/phase-12-validation.md
