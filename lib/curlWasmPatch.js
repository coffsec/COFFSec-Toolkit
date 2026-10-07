// curlconverter parses Bash with tree-sitter WASM. In the browser build it
// requests "/tree-sitter.wasm" and "/tree-sitter-bash.wasm" from the page root.
// This app doesn't host those files, so we patch window.fetch to redirect the
// two requests to the matching files on jsDelivr (versions pinned to the ones
// curlconverter@4.12.0 depends on). Must run before curlconverter is imported.

let patched = false;

const CDN = {
  '/tree-sitter.wasm':
    'https://cdn.jsdelivr.net/npm/web-tree-sitter@0.24.7/tree-sitter.wasm',
  '/tree-sitter-bash.wasm':
    'https://cdn.jsdelivr.net/npm/curlconverter@4.12.0/dist/tree-sitter-bash.wasm',
};

export function ensureCurlWasmPatch() {
  if (patched) return;
  patched = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    let url = '';
    if (typeof input === 'string') url = input;
    else if (input && typeof input.url === 'string') url = input.url;
    if (CDN[url]) return originalFetch(CDN[url], init);
    return originalFetch(input, init);
  };
}