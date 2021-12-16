function rebuildAll(className) {
  var x = document.getElementsByClassName(className);
  var i;
  for (i = 0; i < x.length; i++) {
    var node = x[i];
    var x = node.childNodes;

    for (let item of x) {
      var className = item.getAttributeNode("cellType");
      if (className === "pokemonColumn") {
        console.log(item);
      }
    }
  }
}


function JSONget(theUrl) {
  return $.getJSON(theUrl).then(function(data) {
    return data
  });
}

JSONget("api/api_data.json").then(function(apiData) {
  // JSON Data is stored in "apiData" variable
  // console.log(apiData);

  rebuildAll("pokemonRow");
});
