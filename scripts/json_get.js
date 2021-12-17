function setJSON(apiData, dexCount, trueCount, element, nationalDexData) {
  var currentUrl = apiData["baseUrl"] + "pokemon/" + dexCount;

  // check if URL exists
  $.get(currentUrl).done(function (data) {
    var trueName = data["name"].replace(/^\w/, (c) => c.toUpperCase());


    console.log(
      "(" + trueCount + "/" +
      nationalDexData["pokemon_entries"]["length"] +
      ") Generating info for " + trueName
    );

    var artElement = element.getElementsByClassName("pokemonArt")[0];
    var cellArtImage = artElement.getElementsByClassName("cellArtImage")[0];
    cellArtImage.src = data["sprites"]["front_default"];

    var dataElement = element.getElementsByClassName("pokemonData")[0];
    dataElement.getElementsByClassName("pokemonName")[0].innerHTML = trueName;
    dataElement.getElementsByClassName("pokemonId")[0].innerHTML = "#" + trueCount;
  }).fail(function () {
    //console.log(trueCount + " does not exist");
  });
}


$.get("api/api_data.json").then(function(apiData) {
  // JSON Data is stored in "apiData" variable


  // Get national dex info to fill info for all pokemon
  $.get("https://pokeapi.co/api/v2/pokedex/1").then(function(nationalDexData) {
    var pokedexLength = nationalDexData["pokemon_entries"]["length"];
    var repeatRows = Math.ceil(pokedexLength / 3);

    var tr = document.getElementsByClassName("pokedexRow")[0];

    for (var i = 0; i < repeatRows - 1; i++) {
      var cl = tr.cloneNode(true);
      document.getElementById("pokedexTableBody").appendChild(cl);
    }


    // Rebuild HTML dex
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

      setJSON(apiData, dexCount, trueCount, element, nationalDexData);
    };
  });
});
