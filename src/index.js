const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("results-container");
const homeSection = document.getElementById("home-section");
const browseSection = document.getElementById("browse-section");
const pageControls = document.getElementById("page-controls");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pageInfo = document.getElementById("page-info");
const sortSelect = document.getElementById("sort-select");

const generationEndpoints = {
    1: { offset: 0, limit: 151 },
    2: { offset: 151, limit: 100 },
    3: { offset: 251, limit: 135 },
    4: { offset: 386, limit: 107 },
    5: { offset: 493, limit: 156 },
    6: { offset: 649, limit: 72 },
    7: { offset: 721, limit: 88 },
    8: { offset: 809, limit: 96 },
    9: { offset: 905, limit: 120 },
};

let cachedGenerations = {};
let allFetchedPokemon = [];
let filteredPokemon = [];
let currentPage = 1;
const itemsPerPage = 20;

function displayPokemon(pokemon) {
    const name = pokemon.name.toUpperCase();
    const id = pokemon.id;
    const weight = pokemon.weight / 10;
    const types = pokemon.types.map((t) => t.type.name).join(", ");
    const hdImage = pokemon.sprites.other["official-artwork"].front_default;
    const hp = pokemon.stats[0].base_stat;
    const attack = pokemon.stats[1].base_stat;
    const defense = pokemon.stats[2].base_stat;
    const speed = pokemon.stats[5].base_stat;

    resultsContainer.innerHTML = `
        <div class="pokemon-card">
            <img src="${hdImage}" alt="${name}" class="pokemon-image">
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

async function fetchSelectedGenerations() {
    resultsContainer.innerHTML =
        "<p>Loading Pokémon... This might take a few seconds!</p>";

    const checkboxes = document.querySelectorAll(".gen-check");
    let allSelectedPokemonData = [];

    for (let checkbox of checkboxes) {
        if (checkbox.checked) {
            const genNumber = checkbox.value;

            if (!cachedGenerations[genNumber]) {
                const limit = generationEndpoints[genNumber].limit;
                const offset = generationEndpoints[genNumber].offset;

                cachedGenerations[genNumber] = fetch(
                    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
                )
                    .then((res) => res.json())
                    .then((listData) => {
                        const detailedPromises = listData.results.map((p) =>
                            fetch(p.url).then((r) => r.json()),
                        );
                        return Promise.all(detailedPromises);
                    });
            }

            const detailedData = await cachedGenerations[genNumber];
            allSelectedPokemonData =
                allSelectedPokemonData.concat(detailedData);
        }
    }

    allFetchedPokemon = allSelectedPokemonData;
    applyFilters();
}

function applyFilters() {
    let results = [...allFetchedPokemon];

    const sortValue = sortSelect ? sortSelect.value : "id";

    results.sort((a, b) => {
        if (sortValue === "hp-high") {
            return b.stats[0].base_stat - a.stats[0].base_stat;
        } else if (sortValue === "hp-low") {
            return a.stats[0].base_stat - b.stats[0].base_stat;
        } else {
            return a.id - b.id;
        }
    });
    filteredPokemon = results;
    currentPage = 1;

    if (filteredPokemon.length === 0) {
        resultsContainer.innerHTML =
            "<p>Please select a Generation to begin!</p>";
        if (pageControls) pageControls.style.display = "none";
    } else {
        renderPage();
    }
}

function renderPage() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const singlePageOfPokemon = filteredPokemon.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);

    if (pageControls) {
        pageControls.style.display =
            filteredPokemon.length > 0 ? "flex" : "none";
    }

    if (pageInfo) {
        pageInfo.innerText = `Page ${currentPage} of ${totalPages || 1}`;
    }

    if (prevBtn)
        prevBtn.style.visibility = currentPage === 1 ? "hidden" : "visible";
    if (nextBtn)
        nextBtn.style.visibility =
            currentPage >= totalPages ? "hidden" : "visible";

    resultsContainer.innerHTML = singlePageOfPokemon
        .map((pokemon) => {
            const name = pokemon.name.toUpperCase();
            const types = pokemon.types.map((t) => t.type.name).join(", ");
            const hdImage =
                pokemon.sprites.other["official-artwork"].front_default;

            return `
        <div class="pokemon-card">
            <img src="${hdImage}" alt="${name}" class="pokemon-image">
            <h2>${name}</h2>
            <p>#${pokemon.id}</p>
            <p><strong>Types:</strong> ${types}</p>
            <p><strong>HP:</strong> ${pokemon.stats[0].base_stat}</p>
            <p><strong>Weight:</strong> ${pokemon.weight / 10} kg</p>
        </div>`;
        })
        .join("");
}

function showHome() {
    homeSection.style.display = "block";
    browseSection.style.display = "none";
    if (pageControls) pageControls.style.display = "none";
    resultsContainer.innerHTML = "";
    if (searchInput) searchInput.value = "";
}

async function showRandom() {
    homeSection.style.display = "none";
    browseSection.style.display = "none";
    if (pageControls) pageControls.style.display = "none";
    resultsContainer.innerHTML = "<p>Loading Random Pokémon...</p>";

    const randomId = Math.floor(Math.random() * 1025) + 1;
    await fetchPokemon(randomId);
}

function showBrowser() {
    homeSection.style.display = "none";
    browseSection.style.display = "block";
    if (pageControls) pageControls.style.display = "none";

    applyFilters();
}

searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const searchName = searchInput.value.trim().toLowerCase();
    resultsContainer.innerHTML = "<p>Loading...</p>";
    await fetchPokemon(searchName);
});

document.addEventListener("click", (event) => {
    if (event.target.id === "home-btn") {
        event.preventDefault();
        showHome();
    }
    if (event.target.id === "random-btn") {
        event.preventDefault();
        showRandom();
    }
    if (event.target.id === "browse-btn") {
        event.preventDefault();
        showBrowser();
    }
});

document.querySelectorAll(".gen-check").forEach((checkbox) => {
    checkbox.addEventListener("change", fetchSelectedGenerations);
});
if (sortSelect) {
    sortSelect.addEventListener("change", applyFilters);
}
if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage();
        }
    });
}

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderPage();
        }
    });
}
showBrowser();
