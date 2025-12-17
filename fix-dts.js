// @ts-check

/* global Bun */

/**
 * Edit the type definition file bundled by API Extractor such that sub-submodules are no longer exported as
 * both sub-submodules (correct) and top-level exports (incorrect).
 * @param {string} filePath Path to the type definition file
 */
async function fixDTS(filePath) {
  const file = Bun.file(filePath);
  const fileContent = await file.text();
  await Bun.write(file, fileContent.replace(/^export (?=declare namespace (廣韻|切韻) \{$)/gm, ''));
}

await fixDTS('dist/tshet-uinh.d.ts');

export {};
