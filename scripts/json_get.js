var Config = {
    "columnCount": 3
}

function capitalizeString(string) {
    return string.replace(/^\w/, (c) => c.toUpperCase());
};

function removeQuotes(string) {
    return string.replace(/['"]+/g, '');
};


function setJSON(dexCount, trueCount, element, nationalDexData) {
    var currentUrl =  "https://pokeapi.co/api/v2/pokemon/" + dexCount;

    // check if URL exists
    $.get(currentUrl).done(function (data) {
        var trueName = capitalizeString(data.name);



        console.log(
            "(" + trueCount + "/" +
            nationalDexData.pokemon_entries.length +
            ") Generating info for " + trueName
        );



        var artElement = element.getElementsByClassName("pokemonArt")[0];
        var cellArtImage = artElement.getElementsByClassName("cellArtImage")[0];
        cellArtImage.src = data.sprites.front_default;

        var dataElement = element.getElementsByClassName("pokemonData")[0];
        dataElement.getElementsByClassName("pokemonName")[0].innerHTML = trueName;
        dataElement.getElementsByClassName("pokemonId")[0].innerHTML = "#" + trueCount;

        // Set types
        var metadataElement = dataElement.getElementsByClassName("pokemonMetaData")[0];
        var types = data.types;
        var typeCount = types.length;

        for (var i = 0; i < typeCount; i++) {
            var type = types[i];
            var theType = type.type;

            metadataElement.innerHTML +=
                capitalizeString(
                    removeQuotes(
                        JSON.stringify(theType.name)
                    )
                );

            if (typeCount != 1 && i != typeCount - 1) {
                metadataElement.innerHTML += ", ";
            };
        };

        // Set evolutions
        $.get("https://pokeapi.co/api/v2/pokemon-species/" + dexCount).then(function (speData) {
            $.get(speData.evolution_chain.url).then(function (evoData) {
                metadataElement.innerHTML += "<br>Species #" + JSON.stringify(evoData.id);
            });
        });

        //console.log(" » complete!");
    }).fail(function () {
        //console.log(trueCount + " does not exist");
    });
}


$.get("https://pokeapi.co/api/v2/pokedex/1").then(function (nationalDexData) {
    var pokedexLength = nationalDexData.pokemon_entries.length;
    var repeatRows = Math.ceil(pokedexLength / 3);

    // Create columns
    for (var i = 0; i < Config.columnCount - 1; i++) {
        var cl = document.getElementsByClassName("pokedexCell")[0].cloneNode(true);
        document.getElementsByClassName("pokedexRow")[0].appendChild(cl);
    }

    var tr = document.getElementsByClassName("pokedexRow")[0];

    for (var i = 0; i < repeatRows - 1; i++) {
        var cl = tr.cloneNode(true);
        document.getElementById("pokedexTableBody").appendChild(cl);
    }


    // Create rows
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

        setJSON(dexCount, trueCount, element, nationalDexData);
    };
});