const fs = require('fs');
const path = require('path');

const outputDirectory = path.join(process.cwd(), '.next');
const manifestPaths = [
  path.join(outputDirectory, 'build-manifest.json'),
  path.join(outputDirectory, 'app-build-manifest.json'),
];

const assetPaths = new Set();

function collectAssets(value) {
  if (typeof value === 'string' && value.startsWith('static/')) {
    assetPaths.add(value);
  } else if (Array.isArray(value)) {
    value.forEach(collectAssets);
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach(collectAssets);
  }
}

for (const manifestPath of manifestPaths) {
  collectAssets(JSON.parse(fs.readFileSync(manifestPath, 'utf8')));
}

for (const assetPath of assetPaths) {
  const targetPath = path.join(outputDirectory, assetPath);
  if (fs.existsSync(targetPath)) continue;

  const directory = path.dirname(targetPath);
  const extension = path.extname(targetPath);
  const baseName = path.basename(targetPath, extension);
  if (!fs.existsSync(directory)) continue;

  const sourceName = fs
    .readdirSync(directory)
    .find((fileName) => fileName.startsWith(`${baseName}-`) && fileName.endsWith(extension));
  if (sourceName) {
    fs.copyFileSync(path.join(directory, sourceName), targetPath);
  }
}

function copyFirstMatch(directory, targetName, matcher) {
  const sourceName = fs.readdirSync(directory).find(matcher);
  if (sourceName)
    fs.copyFileSync(path.join(directory, sourceName), path.join(directory, targetName));
}

const chunksDirectory = path.join(outputDirectory, 'static', 'chunks');
const appChunksDirectory = path.join(chunksDirectory, 'app');
copyFirstMatch(chunksDirectory, 'main-app.js', (name) => /^main-app-.+\.js$/.test(name));
copyFirstMatch(appChunksDirectory, 'layout.js', (name) => /^layout-.+\.js$/.test(name));
copyFirstMatch(appChunksDirectory, 'page.js', (name) => /^page-.+\.js$/.test(name));
copyFirstMatch(appChunksDirectory, 'error.js', (name) => /^error-.+\.js$/.test(name));
copyFirstMatch(appChunksDirectory, 'global-error.js', (name) => /^global-error-.+\.js$/.test(name));

const internalsSource = fs.readdirSync(chunksDirectory).find((name) => {
  if (!name.endsWith('.js') || name.startsWith('main-app-')) return false;
  return fs.readFileSync(path.join(chunksDirectory, name), 'utf8').includes('app-router');
});
if (internalsSource) {
  fs.copyFileSync(
    path.join(chunksDirectory, internalsSource),
    path.join(chunksDirectory, 'app-pages-internals.js')
  );
} else {
  copyFirstMatch(chunksDirectory, 'app-pages-internals.js', (name) =>
    /^fd9d1056-.+\.js$/.test(name)
  );
}

const layoutAssets =
  JSON.parse(fs.readFileSync(path.join(outputDirectory, 'app-build-manifest.json'), 'utf8')).pages[
    '/layout'
  ] || [];
const layoutStyles = layoutAssets.filter((asset) => asset.startsWith('static/css/'));
if (layoutStyles.length) {
  const cssDirectory = path.join(outputDirectory, 'static', 'css');
  const imports = layoutStyles
    .map((asset) => `@import url('./${path.basename(asset)}');`)
    .join('\n');
  fs.writeFileSync(path.join(cssDirectory, 'layout.css'), imports);
}
