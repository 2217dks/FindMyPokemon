const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("results-container");

function displayPokemon(pokemon) {
    const name = pokemon.name.toUpperCase();
    const id = pokemon.id;
    const weight = pokemon.weight / 10;
    const types = pokemon.types
        .map((typeInfo) => typeInfo.type.name)
        .join(", ");
    const hdImage = pokemon.sprites.other["official-artwork"].front_default;
    const hp = pokemon.stats[0].base_stat;
    const attack = pokemon.stats[1].base_stat;
    const defense = pokemon.stats[2].base_stat;
    const speed = pokemon.stats[5].base_stat;

    resultsContainer.innerHTML = `
        <div class="pokemon-card">
            <img src="${hdImage}" alt="${name}" style="width: 150px; height: 150px;">
            <h2>${name}</h2>
            <p>#${id}</p>
            <p><strong>Weight:</strong> ${weight} kg</p>
            <p><strong>Types:</strong> ${types}</p>
            <p><strong>HP:</strong> ${hp}</p>
            <p><strong>Attack:</strong> ${attack}</p>
            <p><strong>Defense:</strong> ${defense}</p>
            <p><strong>Speed:</strong> ${speed}</p>
        </div>`;
}

async function fetchPokemon(pokemonName) {
    try {
        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${pokemonName}`,
        );

        if (!response.ok) {
            throw new Error("Pokemon not found!");
        }

        const data = await response.json();
        displayPokemon(data);
    } catch (error) {
        resultsContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
}

searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const searchName = searchInput.value.trim().toLowerCase();
    resultsContainer.innerHTML = "<p>Loading...</p>";
    await fetchPokemon(searchName);
});

document.addEventListener("click", async (event) => {
    if (event.target.id === "random-btn") {
        event.preventDefault();
        resultsContainer.innerHTML = "<p>Loading Random Pokémon...</p>";
        const randomId = Math.floor(Math.random() * 1025) + 1;
        searchInput.value = "";
        await fetchPokemon(randomId);
    }
});
