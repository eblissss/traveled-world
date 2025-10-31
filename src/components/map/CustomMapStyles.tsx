
export interface MapStyle {
  id: string;
  name: string;
  description: string;
  icon: string;
  attribution: string;
  url: string;
  maxZoom?: number;
  subdomains?: string[];
}

/**
 * Collection of beautiful custom map styles
 * Using free tile providers and custom styling options
 */
export const MAP_STYLES: Record<string, MapStyle> = {
  // Standard styles
  light: {
    id: 'light',
    name: 'Light',
    description: 'Clean and modern light theme',
    icon: '☀️',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19
  },

  dark: {
    id: 'dark',
    name: 'Dark',
    description: 'Elegant dark theme for night viewing',
    icon: '🌙',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    maxZoom: 19
  },

  satellite: {
    id: 'satellite',
    name: 'Satellite',
    description: 'High-resolution satellite imagery',
    icon: '🛰️',
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19
  },

  // Beautiful custom styles
  watercolor: {
    id: 'watercolor',
    name: 'Watercolor',
    description: 'Artistic watercolor painting style',
    icon: '🎨',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg',
    maxZoom: 16,
    subdomains: ['a', 'b', 'c', 'd']
  },

  toner: {
    id: 'toner',
    name: 'Toner',
    description: 'High-contrast black and white style',
    icon: '⚫',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png',
    maxZoom: 20,
    subdomains: ['a', 'b', 'c', 'd']
  },

  terrain: {
    id: 'terrain',
    name: 'Terrain',
    description: 'Detailed topographic map',
    icon: '🏔️',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    maxZoom: 17
  },

  vintage: {
    id: 'vintage',
    name: 'Vintage',
    description: 'Retro-style map with warm colors',
    icon: '📜',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}{r}.png',
    maxZoom: 20,
    subdomains: ['a', 'b', 'c', 'd']
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean minimal style with subtle colors',
    icon: '🎯',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png',
    maxZoom: 20,
    subdomains: ['a', 'b', 'c', 'd']
  },

  // Additional beautiful styles
  positron: {
    id: 'positron',
    name: 'Positron',
    description: 'Clean gray-scale style',
    icon: '🌫️',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    maxZoom: 19
  },

  voyager: {
    id: 'voyager',
    name: 'Voyager',
    description: 'Detailed map with rich information',
    icon: '🗺️',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    maxZoom: 19
  }
};

/**
 * Get tile layer for a specific map style
 */
export const createTileLayer = (styleId: string): L.TileLayer => {
  const style = MAP_STYLES[styleId];
  if (!style) {
    if (import.meta.env.DEV) console.warn(`Map style '${styleId}' not found, falling back to 'light'`);
    return createTileLayer('light');
  }

  return L.tileLayer(style.url, {
    attribution: style.attribution,
    maxZoom: style.maxZoom || 18,
    subdomains: style.subdomains || ['a', 'b', 'c']
  });
};

/**
 * Get all available map style options
 */
export const getMapStyleOptions = (): MapStyle[] => {
  return Object.values(MAP_STYLES);
};

/**
 * Get map style by ID
 */
export const getMapStyle = (id: string): MapStyle | undefined => {
  return MAP_STYLES[id];
};

/**
 * Get recommended styles for different use cases
 */
export const getRecommendedStyles = () => ({
  default: ['light', 'dark', 'satellite'],
  artistic: ['watercolor', 'toner', 'vintage'],
  detailed: ['terrain', 'voyager', 'minimal'],
  all: Object.keys(MAP_STYLES)
});
