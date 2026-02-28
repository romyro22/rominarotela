# Security Audit — Escaneo de Patrones Inseguros

Ejecuta el script de seguridad y complementa con Biome:

## Paso 1: Ejecutar script de seguridad

```bash
npm run security-audit
```

## Paso 2: Ejecutar Biome lint

```bash
npx biome check src/ tests/
```

## Paso 3: Reporte

Si ambos pasan, reporta:

```
=== Security Audit ===
Script:  PASS
Biome:   PASS
```

Si hay findings del script, lista cada uno con:
- **Archivo:linea** — ubicacion del hallazgo
- **Severidad** — CRITICAL / HIGH / MEDIUM
- **Descripcion** — que se detecto
- **Sugerencia** — como corregirlo

Si Biome tiene warnings, listarlos tambien.
