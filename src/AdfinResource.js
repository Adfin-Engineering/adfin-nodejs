export default class AdfinResource {
  constructor(client) {
    this._client = client;
  }
}

AdfinResource.extend = function(sub) {
  const Super = this;
  class SubResource extends Super {
    constructor(...args) {
      super(...args);
      if (typeof sub.constructor === 'function') {
        sub.constructor.apply(this, args);
      }
    }
  }
  Object.assign(SubResource.prototype, sub);
  return SubResource;
};

AdfinResource.method = function(spec) {
  return function(data, queryParams = {}) {
    return this._client._request(spec.method, spec.fullPath, data, queryParams);
  };
};
