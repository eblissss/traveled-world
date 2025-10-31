import Fuse from 'fuse.js';
import Papa from 'papaparse';
import type { CityRecord } from '../types/city';

let fuse: Fuse<CityRecord> | null = null;
let cities: CityRecord[] = [];

// Message handler
self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'LOAD_CSV':
      try {
        const response = await fetch('/data/worldcities.csv');
        const text = await response.text();
        
        Papa.parse<CityRecord>(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          quoteChar: '"',
          escapeChar: '"',
          complete: (results) => {
            // Filter cities with population >= 10000 and valid coordinates
            cities = results.data
              .filter((city) => 
                city &&
                typeof city === 'object' &&
                city.population &&
                city.population >= 10000 &&
                typeof city.lat === 'number' &&
                typeof city.lng === 'number' &&
                !isNaN(city.lat) &&
                !isNaN(city.lng) &&
                city.city &&
                city.country
              )
              .sort((a, b) => (b.population || 0) - (a.population || 0));

            // Initialize Fuse.js
            fuse = new Fuse(cities, {
              keys: [
                { name: 'city', weight: 0.7 },
                { name: 'city_ascii', weight: 0.5 },
                { name: 'country', weight: 0.3 },
                { name: 'admin_name', weight: 0.2 }
              ],
              threshold: 0.3,
              minMatchCharLength: 2,
              shouldSort: true,
              location: 0,
              distance: 100,
              useExtendedSearch: false,
              ignoreLocation: true
            });

            self.postMessage({ type: 'CSV_LOADED', payload: { count: cities.length } });
          },
          error: (error: Error) => {
            self.postMessage({ type: 'ERROR', payload: { error: error.message } });
          }
        });
      } catch (error) {
        self.postMessage({ type: 'ERROR', payload: { error: (error as Error).message } });
      }
      break;

    case 'SEARCH': {
      if (!fuse) {
        self.postMessage({ type: 'ERROR', payload: { error: 'Search index not initialized' } });
        return;
      }

      const query = payload.query as string;
      if (query.length < 2) {
        self.postMessage({ type: 'SEARCH_RESULTS', payload: { results: [] } });
        return;
      }

      const fuseResults = fuse.search(query, { limit: 10 }); // Get more results for re-ranking
      
      
      const rankedResults = fuseResults.map(r => r.item);
      
      self.postMessage({ 
        type: 'SEARCH_RESULTS', 
        payload: { results: rankedResults } 
      });
      break;
    }

    default:
      self.postMessage({ type: 'ERROR', payload: { error: 'Unknown message type' } });
  }
};

