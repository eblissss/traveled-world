import { describe, it, expect } from 'vitest';
import { getCityPhoto, useCityPhoto } from '../../lib/photoService';

describe('getCityPhoto', () => {
  it('returns a city photo', () => {
    const result = getCityPhoto();

    expect(result).toHaveProperty('url');
    expect(result).toHaveProperty('thumbnail');
    expect(result).toHaveProperty('source');
    expect(result).toHaveProperty('attribution');
    expect(result.url).toContain('picsum.photos');
    expect(result.thumbnail).toContain('picsum.photos');
    expect(result.source).toBe('Picsum Photos');
    expect(result.attribution).toBe('City photo');
  });

  it('returns consistent results', () => {
    const result1 = getCityPhoto();
    const result2 = getCityPhoto();

    expect(result1).toEqual(result2);
  });
});

describe('useCityPhoto hook', () => {
  it('exists and can be imported', () => {
    expect(useCityPhoto).toBeDefined();
    expect(typeof useCityPhoto).toBe('function');
  });
});
