const { createRequire } = require('module');
const require = createRequire(import.meta.url);

// Use dynamic import to load the ES module
async function loadAdfin() {
  const { default: Adfin } = await import('./index.js');
  return Adfin;
}

// Create a wrapper that mimics the ES module exports
function createAdfinWrapper() {
  let AdfinClass = null;
  
  const wrapper = function(config) {
    if (!AdfinClass) {
      throw new Error('Adfin must be loaded asynchronously. Use: const Adfin = await require("adfin-nodejs")();');
    }
    return new AdfinClass(config);
  };
  
  wrapper.load = async function() {
    if (!AdfinClass) {
      AdfinClass = await loadAdfin();
    }
    return AdfinClass;
  };
  
  return wrapper;
}

module.exports = createAdfinWrapper(); 