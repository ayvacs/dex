function rebuildFromArray(array, apiData) {
  var dexCount = 0;
  for (var i = 0; i < array.length; i++) {
    var type = array[i];

    var elements = document.getElementsByClassName(type);
    for (var y = 0; y < elements.length; y++) {
      var element = elements[y];
      var className = element.className;

      if (className == "pokemonArt") {
        dexCount++;
        var trueCount = 0;
        var trueLength = dexCount.toString().length

        if (trueLength == 1) {
          var trueCount = "00" + dexCount;
        } else if (trueLength == 2) {
          trueCount = "0" + dexCount;
        } else {
          trueCount = dexCount;
        }

        $.get(apiData["baseUrl"] + "pokemon/" + dexCount, function(data) {
          var pokemonData = [];
          pokemonData["name"] = data["name"];
          pokemonData["id"] = trueCount;
          console.log(pokemonData);
        });


      } else if (className == "pokemonData") {
      } else {
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

  rebuildFromArray(["pokemonArt", "pokemonData"], apiData);
});
