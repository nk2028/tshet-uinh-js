// @ts-check

import { JSX } from 'typedoc';

/**
 * @param {import('typedoc').Application} app
 */
export function load(app) {
  app.renderer.hooks.on(
    'head.end',
    () =>
      JSX.createElement('script', {
        'defer': true,
        'src': 'https://static.cloudflareinsights.com/beacon.min.js',
        'data-cf-beacon': '{"token": "16ad6c356b37426cb31816318ed5a42d"}',
      }),
  );
}
