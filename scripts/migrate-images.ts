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
    `npx wrangler r2 object put rominarotela-images/${key} --file "${localPath}" --content-type image/png --local`,
  );
}
