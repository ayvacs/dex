async function setJSON(apiData, dexCount, trueCount, element) {
  $.getJSON(apiData["baseUrl"] + "pokemon/" + dexCount, function(data) {
    var artElement = element.getElementsByClassName("pokemonArt")[0];
    var cellArtImage = artElement.getElementsByClassName("cellArtImage")[0];
    cellArtImage.src = data["sprites"]["front_default"];

    var dataElement = element.getElementsByClassName("pokemonData")[0];
    dataElement.getElementsByClassName("pokemonName")[0].innerHTML = data["name"].replace(/^\w/, (c) => c.toUpperCase());
    dataElement.getElementsByClassName("pokemonId")[0].innerHTML = "#" + trueCount;
  });
}


async function rebuildAllDex(apiData) {
  var dexCount = 0;

  var array = document.getElementById("pokedexTable");
  var elements = array.getElementsByClassName("pokemonRow");

  for (var i = 0; i < elements.length; i++) {
    var element = elements[i]
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

    await setJSON(apiData, dexCount, trueCount, element);
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

  rebuildAllDex(apiData);
});
