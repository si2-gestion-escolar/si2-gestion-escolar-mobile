// Genera los assets de icono/splash de la app a partir de un glifo SVG simple
// (gorro de graduacion). No depende de ningun logo existente: no hay uno en
// el proyecto todavia (ver frontend/src/app/config/branding.ts, solo texto).
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const aqui = dirname(fileURLToPath(import.meta.url))
const destino = join(aqui, '..', 'assets')
mkdirSync(destino, { recursive: true })

const AZUL = '#1d4ed8'
const BLANCO = '#ffffff'

// Glifo: gorro de graduacion simple, centrado en un viewBox de 200x200.
const glifo = (color) => `
  <g fill="${color}">
    <polygon points="100,38 168,80 100,122 32,80" />
    <circle cx="100" cy="80" r="9" />
    <path d="M100 80 L132 118" stroke="${color}" stroke-width="7" stroke-linecap="round" fill="none" />
    <circle cx="132" cy="121" r="7" />
  </g>
`

const svgIconoCompleto = (tamano) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="${tamano}" height="${tamano}" viewBox="0 0 200 200">
    <rect width="200" height="200" rx="28" fill="${AZUL}" />
    ${glifo(BLANCO)}
  </svg>
`

const svgSoloGlifo = (tamano, color, transparente = true) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="${tamano}" height="${tamano}" viewBox="0 0 200 200">
    ${transparente ? '' : `<rect width="200" height="200" fill="${AZUL}" />`}
    ${glifo(color)}
  </svg>
`

const svgFondoSolido = (tamano) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="${tamano}" height="${tamano}" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="${AZUL}" />
  </svg>
`

const svgSplash = (tamano) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="${tamano}" height="${tamano}" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="${BLANCO}" />
    ${glifo(AZUL)}
  </svg>
`

const archivos = [
  ['icon.png', svgIconoCompleto(1024), 1024],
  ['android-icon-foreground.png', svgSoloGlifo(1024, BLANCO, true), 1024],
  ['android-icon-background.png', svgFondoSolido(1024), 1024],
  ['android-icon-monochrome.png', svgSoloGlifo(1024, BLANCO, true), 1024],
  ['favicon.png', svgIconoCompleto(196), 196],
  ['splash-icon.png', svgSplash(1024), 1024],
]

for (const [nombre, svg, tamano] of archivos) {
  await sharp(Buffer.from(svg), { density: 300 })
    .resize(tamano, tamano)
    .png()
    .toFile(join(destino, nombre))
  console.log('Generado', nombre)
}
