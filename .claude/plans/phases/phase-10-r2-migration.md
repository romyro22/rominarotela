# Fase 10: R2 — Migración de imágenes existentes

**Plan padre:** @.claude/plans/cloudflare-full-migration.md
**Estado:** pendiente
**Depende de:** @.claude/plans/phases/phase-07-api-routes.md
**Desbloquea:** Fase 12 (Validation)

## Agentes

| Rol | Agente | Activo |
|-----|--------|--------|
| Researcher | — | No (mapping definido en la fase) |
| Engineer | `engineer-p10` | **Sí** — crea script y ejecuta wrangler r2 commands |
| Tester | — | No (validación via curl) |
| Reviewer | — | No (verificación incluida en Engineer tasks) |

## Objetivo

Subir las 7 imágenes de galería actuales a R2 local con las keys definidas en el seed de D1. Verificar que el endpoint GET `/api/images/` las sirve correctamente.

## Contexto

**Leer antes de implementar:**
- `migrations/0002_seed_artworks.sql` — campo `image_key` de cada artwork
- `src/pages/api/images/[...key].ts` — endpoint de serving (Fase 07)
- `img/galeria/` — imágenes actuales

**Mapping de imágenes:**

| Artwork ID | Archivo local | R2 Key |
|-----------|--------------|--------|
| perla_inu | `img/galeria/pintura.png` | `artworks/perla_inu/pintura.png` |
| el_retrato_de_una_culpa_silenciosa | `img/galeria/oleo.png` | `artworks/el_retrato_de_una_culpa_silenciosa/oleo.png` |
| la_tristeza_del_guason | `img/galeria/gouache.png` | `artworks/la_tristeza_del_guason/gouache.png` |
| la_nina_y_el_gato_negro | `img/galeria/ilustracion.png` | `artworks/la_nina_y_el_gato_negro/ilustracion.png` |
| pedro_pedro_pedro | `img/galeria/ilustración.png` | `artworks/pedro_pedro_pedro/ilustracion.png` |
| las_aventuras_de_capi_y_pajarito | `img/galeria/pixelart.png` | `artworks/las_aventuras_de_capi_y_pajarito/pixelart.png` |
| madre_e_hijo | `img/galeria/dibujo.png` | `artworks/madre_e_hijo/dibujo.png` |

> **Nota:** `ilustración.png` (con tilde) es el archivo de "Pedro" — el R2 key usa `ilustracion.png` (sin tilde) para evitar problemas de encoding en URLs.

## Tareas

### 10.1 Script de migración

- [ ] CREATE `scripts/migrate-images.ts`:

```typescript
/**
 * One-time migration: upload gallery images from local filesystem to R2.
 *
 * Run: npx tsx scripts/migrate-images.ts
 * Or execute the generated wrangler commands manually.
 */

const imageMap: Record<string, string> = {
  "artworks/perla_inu/pintura.png": "img/galeria/pintura.png",
  "artworks/el_retrato_de_una_culpa_silenciosa/oleo.png": "img/galeria/oleo.png",
  "artworks/la_tristeza_del_guason/gouache.png": "img/galeria/gouache.png",
  "artworks/la_nina_y_el_gato_negro/ilustracion.png": "img/galeria/ilustracion.png",
  "artworks/pedro_pedro_pedro/ilustracion.png": "img/galeria/ilustración.png",
  "artworks/las_aventuras_de_capi_y_pajarito/pixelart.png": "img/galeria/pixelart.png",
  "artworks/madre_e_hijo/dibujo.png": "img/galeria/dibujo.png",
};

console.log("# R2 Image Migration Commands (run each one):\n");
for (const [key, localPath] of Object.entries(imageMap)) {
  console.log(
    `npx wrangler r2 object put rominarotela-images/${key} --file "${localPath}" --content-type image/png --local`
  );
}
```

### 10.2 Ejecutar migración local

- [ ] EXECUTE cada comando generado por el script:

```bash
npx wrangler r2 object put rominarotela-images/artworks/perla_inu/pintura.png --file "img/galeria/pintura.png" --content-type image/png --local
npx wrangler r2 object put rominarotela-images/artworks/el_retrato_de_una_culpa_silenciosa/oleo.png --file "img/galeria/oleo.png" --content-type image/png --local
npx wrangler r2 object put rominarotela-images/artworks/la_tristeza_del_guason/gouache.png --file "img/galeria/gouache.png" --content-type image/png --local
npx wrangler r2 object put rominarotela-images/artworks/la_nina_y_el_gato_negro/ilustracion.png --file "img/galeria/ilustracion.png" --content-type image/png --local
npx wrangler r2 object put rominarotela-images/artworks/pedro_pedro_pedro/ilustracion.png --file "img/galeria/ilustración.png" --content-type image/png --local
npx wrangler r2 object put rominarotela-images/artworks/las_aventuras_de_capi_y_pajarito/pixelart.png --file "img/galeria/pixelart.png" --content-type image/png --local
npx wrangler r2 object put rominarotela-images/artworks/madre_e_hijo/dibujo.png --file "img/galeria/dibujo.png" --content-type image/png --local
```

### 10.3 Cleanup de imágenes locales

Después de verificar que R2 funciona:

- [ ] REMOVE `img/galeria/` del root — ya no se necesita (imágenes en R2)

> **Precaución:** Solo eliminar después de verificar que todas las imágenes se sirven correctamente desde `/api/images/`.

## Validación de Fase

```bash
# Verificar que R2 tiene las 7 imágenes
npx wrangler r2 object list rominarotela-images --local --prefix "artworks/"
# Debe listar 7 objetos

# Verificar serving via API
npm run dev &
curl -I http://localhost:4321/api/images/artworks/perla_inu/pintura.png
# Debe retornar: 200, Content-Type: image/png, Cache-Control: public...

# Verificar todas las imágenes
for key in perla_inu/pintura el_retrato_de_una_culpa_silenciosa/oleo la_tristeza_del_guason/gouache la_nina_y_el_gato_negro/ilustracion pedro_pedro_pedro/ilustracion las_aventuras_de_capi_y_pajarito/pixelart madre_e_hijo/dibujo; do
  echo -n "artworks/$key.png: "
  curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/api/images/artworks/$key.png
  echo
done
# Todas deben ser 200
```

## Para deploy a producción (futuro)

```bash
# Crear bucket R2
npx wrangler r2 bucket create rominarotela-images

# Upload remoto (sin --local)
npx wrangler r2 object put rominarotela-images/artworks/... --file ... --content-type image/png
```

## Siguiente fase

→ @.claude/plans/phases/phase-12-validation.md
