import { describe, it, expect } from 'vitest';
import {
  adjustDuration,
  createTransition,
  DURATIONS,
  createDropdownVariants,
  createCardVariants
} from '../../lib/animations';

describe('animations', () => {
  describe('adjustDuration', () => {
    it('should reduce duration for faster animation speed', () => {
      const result = adjustDuration(200, 2.0);
      expect(result).toBe(100); // 200 / 2.0 = 100
    });

    it('should increase duration for slower animation speed', () => {
      const result = adjustDuration(200, 0.5);
      expect(result).toBe(400); // 200 / 0.5 = 400
    });

    it('should return same duration for speed 1.0', () => {
      const result = adjustDuration(200, 1.0);
      expect(result).toBe(200);
    });
  });

  describe('createTransition', () => {
    it('should create transition with adjusted duration', () => {
      const transition = createTransition(300, 1.5);
      expect(transition.duration).toBeCloseTo(0.2, 2); // 300 / 1.5 / 1000
    });

    it('should include delay when provided', () => {
      const transition = createTransition(200, 1.0, 'easeOut', 100);
      expect(transition.delay).toBeCloseTo(0.1, 2);
    });
  });

  describe('createDropdownVariants', () => {
    it('should create variants with animation speed', () => {
      const variants = createDropdownVariants(2.0);
      expect(variants).toHaveProperty('hidden');
      expect(variants).toHaveProperty('visible');
      expect(variants.visible.transition).toBeDefined();
    });
  });

  describe('createCardVariants', () => {
    it('should create card variants', () => {
      const variants = createCardVariants(1.0);
      expect(variants).toHaveProperty('hidden');
      expect(variants).toHaveProperty('visible');
    });
  });

  describe('DURATIONS', () => {
    it('should have correct duration constants', () => {
      expect(DURATIONS.micro).toBe(150);
      expect(DURATIONS.component).toBe(300);
      expect(DURATIONS.page).toBe(500);
      expect(DURATIONS.visualization).toBe(1000);
    });
  });
});

