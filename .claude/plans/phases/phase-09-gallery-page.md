# Fase 09: Gallery Page — Migración de galeria.html con datos dinámicos

**Plan padre:** @.claude/plans/cloudflare-full-migration.md
**Estado:** pendiente
**Depende de:** @.claude/plans/phases/phase-05-services.md, @.claude/plans/phases/phase-06-design-layout.md
**Desbloquea:** Fase 11 (Testing), Fase 12 (Validation)

## Agentes

| Rol | Agente | Activo | Tarea principal |
|-----|--------|--------|-----------------|
| Researcher | `researcher-p09` | **Sí** | Leer galeria.html completo (862 líneas). Analizar lógica de search/filter/modal JS. Verificar Astro data-* attributes pattern para client-side filtering. Verificar `<dialog>` element compatibility. |
| Engineer | `engineer-p09` | **Sí** | Crear ArtworkCard.astro, ArtworkModal.astro, GallerySearch.astro, galeria.astro. Conectar con D1 data via services. Implementar client-side search/filter/modal JS. |
| Tester | — | No | Validación funcional manual |
| Reviewer | `reviewer-p09` | **Sí** | Verificar que los 7 artworks cargan desde D1. Verificar search/filter funcionalidad. Verificar modal con datos correctos. Comparación visual vs galeria.html original. Verificar XSS safety en escapeHtml. |

## Objetivo

Galería de arte que carga datos de D1 e imágenes de R2, con búsqueda, filtro por técnica y modal de detalle. Toda la funcionalidad de galeria.html preservada pero con datos dinámicos.

## Contexto

**Leer antes de implementar:**
- `galeria.html` — archivo completo (862 líneas):
  - CSS galería (lines 8-380) — paleta oscura diferente al portfolio
  - HTML estructura (lines 383-456) — header con search/filter, grid, modal dialog
  - JS data + lógica (lines 458-859) — artworks array, render, search, modal, i18n
- `src/services/artwork-service.ts` — `getAllArtworks()`, `getDistinctTechniques()` (Fase 05)
- `src/services/cache-service.ts` — `getCachedOrFetch()` (Fase 05)
- `src/i18n/utils.ts` — `t()`, `localizedField()` (Fase 04)

**Diferencia clave vs HTML original:**
- Datos vienen de D1 (server-side) en lugar de array JS hardcodeado
- Imágenes se sirven desde `/api/images/{key}` (R2) en lugar de `img/galeria/`
- Búsqueda y filtro siguen siendo client-side JS (filter/hide DOM elements)
- Modal sigue siendo client-side JS (`<dialog>`)

## Tareas

### 9.1 Componentes de galería

- [ ] CREATE `src/components/ArtworkCard.astro`:

```astro
---
import type { Artwork } from "../types/artwork";
import { localizedField } from "../i18n/utils";

interface Props {
  artwork: Artwork;
  locale: string;
}

const { artwork, locale } = Astro.props;
const name = localizedField(locale, artwork.nameEs, artwork.nameEn);
const description = localizedField(locale, artwork.descriptionEs, artwork.descriptionEn);
const technique = localizedField(locale, artwork.techniqueEs, artwork.techniqueEn);
const imageUrl = `/api/images/${artwork.imageKey}`;
---

<article class="card" data-artwork-id={artwork.id}
  data-name={name}
  data-description={description}
  data-technique-es={artwork.techniqueEs}
  data-technique={technique}
  data-searchable={`${name} ${description} ${technique} ${artwork.tags.join(" ")}`}>
  <a href="#" class="thumb">
    <img loading="lazy" src={imageUrl} alt={`Vista previa de ${name}`} />
  </a>
  <div class="body">
    <h3 class="title">{name}</h3>
    <p class="desc">{description}</p>
    <div class="tags">
      <span class="tag">{technique}</span>
      <span class="tag">{artwork.size}</span>
    </div>
  </div>
</article>
```

> Los `data-*` attributes permiten al JS client-side filtrar/buscar sin re-fetch.

- [ ] CREATE `src/components/ArtworkModal.astro`:

Estructura `<dialog>` idéntica a galeria.html:
- Imagen hero (izquierda)
- Info panel (derecha): título, técnica pill, descripción, metadata grid (tamaño/técnica), secciones opcionales (descripción larga, inspiración, materiales)
- Botones: "Copiar ficha", "Cerrar"
- JS en `<script>` para: openModal(id), closeModal(), clipboard copy

Recibe `artworks` como prop serializado a JSON en un `<script type="application/json">` para que el JS client-side pueda leer los datos completos.

- [ ] CREATE `src/components/GallerySearch.astro`:

Input de búsqueda + select de técnicas:
- Input type="search" con placeholder i18n
- Select con option "Todas las técnicas" + técnicas del backend
- JS en `<script>` que filtra los `.card` elements via `data-searchable` y `data-technique-es`
- Counter de resultados

### 9.2 Gallery Page

- [ ] CREATE `src/pages/galeria.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import ArtworkCard from "../components/ArtworkCard.astro";
import ArtworkModal from "../components/ArtworkModal.astro";
import GallerySearch from "../components/GallerySearch.astro";
import { getAllArtworks, getDistinctTechniques } from "../services/artwork-service";
import { getCachedOrFetch } from "../services/cache-service";
import { t } from "../i18n/utils";

const locale = Astro.currentLocale ?? "es";
const artworks = await getCachedOrFetch("artworks:all", getAllArtworks);
const techniques = await getCachedOrFetch("artworks:techniques", getDistinctTechniques);
---

<BaseLayout title={t(locale, "gallery.title")} bodyClass="gallery-theme">
  <header class="gallery-header">
    <div class="wrap">
      <div class="topbar">
        <h1>{t(locale, "gallery.title")}</h1>
        <GallerySearch locale={locale} techniques={techniques} />
      </div>
    </div>
  </header>

  <main class="wrap">
    <div id="results-count" class="muted"></div>
    <section id="grid" class="grid" aria-live="polite">
      {artworks.map((artwork) => (
        <ArtworkCard artwork={artwork} locale={locale} />
      ))}
    </section>
  </main>

  <ArtworkModal locale={locale} artworks={artworks} />
</BaseLayout>
```

### 9.3 CSS de galería

La galería tiene una paleta diferente al portfolio. Opciones:
- **Opción A:** Class `.gallery-theme` en body que overridea custom properties
- **Opción B:** Scoped `<style>` en galeria.astro

Implementar Opción A (ya definido en el BaseLayout con `bodyClass`).

- [ ] UPDATE `src/styles/global.css` — agregar scope `.gallery-theme`:

```css
.gallery-theme {
  --bg: #0f1115;
  --card: #151925;
  --muted: #9aa4b2;
  --text: #e8ecf1;
  --accent: #7c5cff;
  --accent-2: #18c6a3;
  --border: rgba(255, 255, 255, .08);
}
```

### 9.4 Eliminar HTML legacy

- [ ] REMOVE `galeria.html` del root (reemplazado por `src/pages/galeria.astro`)

## Validación de Fase

```bash
npx astro check
npm run dev
```

Verificación manual:
- [ ] Galería carga en `http://localhost:4321/galeria`
- [ ] Las 7 obras se muestran con imágenes (de R2 o fallback local)
- [ ] Búsqueda filtra cards en tiempo real (por nombre, técnica, tags)
- [ ] Select de técnicas filtra correctamente
- [ ] Click en card abre modal con datos completos
- [ ] Modal muestra imagen, título, técnica, tamaño, descripción
- [ ] "Copiar ficha" copia al clipboard
- [ ] ESC cierra modal
- [ ] `/en/galeria` muestra la galería en inglés
- [ ] Diseño visual idéntico a galeria.html original

## Siguiente fase

→ @.claude/plans/phases/phase-11-testing.md
→ @.claude/plans/phases/phase-12-validation.md
