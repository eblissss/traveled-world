declare module 'leaflet.markercluster' {
  import * as L from 'leaflet';
  
  export class MarkerClusterGroup extends L.LayerGroup {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any);
    addLayer(layer: L.Layer): this;
    removeLayer(layer: L.Layer): this;
  }
  
  export default MarkerClusterGroup;
}

declare module 'leaflet' {
  namespace L {
    interface MarkerClusterGroup extends LayerGroup {
      addLayer(layer: Layer): this;
      removeLayer(layer: Layer): this;
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function markerClusterGroup(options?: any): MarkerClusterGroup;
  }
}

