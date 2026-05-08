import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

/**
 * Registers any environment providers required by the components library.
 *
 * The components in this library wrap Angular Material primitives, which in
 * v21+ use CSS-based animations and no longer require @angular/animations
 * to be wired up. This helper exists as the canonical entry point for
 * future provider needs (e.g. icon registry, locale, custom Material
 * defaults) without forcing every consumer to learn the per-feature APIs.
 */
export function provideTarComponents(): EnvironmentProviders {
  return makeEnvironmentProviders([]);
}
