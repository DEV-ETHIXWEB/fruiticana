/**
 * Lazy MapLibre loader. The worker is served from /vendor (copied on
 * postinstall) because bundlers can't reliably resolve MapLibre's
 * module-worker URL. Tiles: OpenFreeMap, free and key-less.
 */
export const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

let ready: Promise<typeof import("maplibre-gl")> | null = null;

export function loadMapLibre() {
  ready ??= import("maplibre-gl").then((ml) => {
    ml.setWorkerUrl("/vendor/maplibre-gl-worker.mjs");
    return ml;
  });
  return ready;
}
