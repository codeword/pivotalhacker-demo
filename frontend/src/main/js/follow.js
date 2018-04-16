module.exports = function follow(api, rootPath, relArray) {
  var root = api({
    method: 'GET',
    path: rootPath
  });

  return relArray.reduce(function(root, arrayItem) {
    var rel = typeof arrayItem === 'string' ? arrayItem : arrayItem.rel;
    return traverseNext(root, rel, arrayItem);
  }, root);

  function traverseNext (root, rel, arrayItem) {
    return root.then(function (response) {
      console.log("response:", response);
      if (hasEmbeddedRel(response.entity, rel)) {
        console.log("1 returning: ", response.entity._embedded[rel]);
        return response.entity._embedded[rel];
      }

      if(!response.entity._links) {
        console.log("2 returning: ", []);
        return [];
      }

      if (typeof arrayItem === 'string') {
        console.log("3 returning new get from: ", response.entity._links[rel].href);
        return api({
          method: 'GET',
          path: response.entity._links[rel].href
        });
      } else {
        console.log("4 returning new get with params from: ", response.entity._links[rel].href, arrayItem.params);
        return api({
          method: 'GET',
          path: response.entity._links[rel].href,
          params: arrayItem.params
        });
      }
    });
  }

  function hasEmbeddedRel (entity, rel) {
    return entity._embedded && entity._embedded.hasOwnProperty(rel);
  }
};
