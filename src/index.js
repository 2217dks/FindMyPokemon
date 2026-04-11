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
const generationSize = {
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

function renderPokemonCard(pokemon) {
    const name = pokemon.name.toUpperCase();
    const id = pokemon.id;
    const hdImage = pokemon.sprites.other["official-artwork"].front_default;
    const typesHTML = pokemon.types
        .map((t) => `<span class="pill ${t.type.name}">${t.type.name}</span>`)
        .join("");

    const abilitiesHTML = pokemon.abilities
        .map((a) => `<li>${a.ability.name.replace("-", " ")}</li>`)
        .join("");

    const hp = pokemon.stats[0].base_stat;
    const attack = pokemon.stats[1].base_stat;
    const defense = pokemon.stats[2].base_stat;
    const speed = pokemon.stats[5].base_stat;

    return `
        <div class="pokemon-card">
            <p class="pokemon-id">#${id}</p>
            <img src="${hdImage}" alt="${name}" class="pokemon-image">
            <h2 class="pokemon-name">${name}</h2>
            
            <div class="pill-container">
                ${typesHTML}
            </div>
            <div class="abilities-section">
                <p><strong>Abilities:</strong></p>
                <ul>
                    ${abilitiesHTML}
                </ul>
            </div>
            <div class="stats-grid">
                <div class="stat-box"><p class="stat-name">HP</p><p class="stat-value">${hp}</p></div>
                <div class="stat-box"><p class="stat-name">ATK</p><p class="stat-value">${attack}</p></div>
                <div class="stat-box"><p class="stat-name">DEF</p><p class="stat-value">${defense}</p></div>
                <div class="stat-box"><p class="stat-name">SPD</p><p class="stat-value">${speed}</p></div>
            </div>
        </div>`;
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

    if (prevBtn) {
        prevBtn.style.visibility = currentPage === 1 ? "hidden" : "visible";
    }

    if (nextBtn) {
        nextBtn.style.visibility =
            currentPage >= totalPages ? "hidden" : "visible";
    }

    resultsContainer.innerHTML = singlePageOfPokemon
        .map((pokemon) => renderPokemonCard(pokemon))
        .join("");
}

function applyFilters() {
    let results = [...allFetchedPokemon];
    const checkedTypeBoxes = document.querySelectorAll(".type-check:checked");
    const selectedTypes = Array.from(checkedTypeBoxes).map((box) => box.value);

    if (selectedTypes.length > 0) {
        results = results.filter((pokemon) => {
            const pokeTypes = pokemon.types.map((t) => t.type.name);

            return selectedTypes.every((checkedType) =>
                pokeTypes.includes(checkedType),
            );
        });
    }

    const sortValue = sortSelect ? sortSelect.value : "id";

    results.sort((a, b) => {
        if (sortValue === "hp-high") {
            return b.stats[0].base_stat - a.stats[0].base_stat;
        } else if (sortValue === "hp-low") {
            return a.stats[0].base_stat - b.stats[0].base_stat;
        } else if (sortValue === "attack-high") {
            return b.stats[1].base_stat - a.stats[1].base_stat;
        } else if (sortValue === "attack-low") {
            return a.stats[1].base_stat - b.stats[1].base_stat;
        } else if (sortValue === "defense-high") {
            return b.stats[2].base_stat - a.stats[2].base_stat;
        } else if (sortValue === "defense-low") {
            return a.stats[2].base_stat - b.stats[2].base_stat;
        } else if (sortValue === "speed-high") {
            return b.stats[5].base_stat - a.stats[5].base_stat;
        } else if (sortValue === "speed-low") {
            return a.stats[5].base_stat - b.stats[5].base_stat;
        } else if (sortValue === "weight-high") {
            return b.weight - a.weight;
        } else if (sortValue === "weight-low") {
            return a.weight - b.weight;
        } else {
            return a.id - b.id;
        }
    });
    filteredPokemon = results;
    currentPage = 1;

    if (filteredPokemon.length === 0) {
        resultsContainer.innerHTML = "<p>No pokemon found!</p>";
        if (pageControls) pageControls.style.display = "none";
    } else {
        renderPage();
    }
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
        resultsContainer.innerHTML = renderPokemonCard(data);
    } catch (error) {
        resultsContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
}

async function fetchSelectedGenerations() {
    resultsContainer.innerHTML = "<p>Loading Pokémon...</p>";
    const checkboxes = document.querySelectorAll(".gen-check");
    let allSelectedPokemonData = [];

    for (let checkbox of checkboxes) {
        if (checkbox.checked) {
            const genNumber = checkbox.value;

            if (!cachedGenerations[genNumber]) {
                const limit = generationSize[genNumber].limit;
                const offset = generationSize[genNumber].offset;

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

function showHome() {
    homeSection.style.display = "block";
    browseSection.style.display = "none";
    if (pageControls) pageControls.style.display = "none";
    resultsContainer.innerHTML = "";
    if (searchInput) searchInput.value = "";
}

function showRandom() {
    homeSection.style.display = "none";
    browseSection.style.display = "none";
    if (pageControls) pageControls.style.display = "none";
    resultsContainer.innerHTML = "<p>Loading Random Pokémon...</p>";
    const randomId = Math.floor(Math.random() * 1025) + 1;
    fetchPokemon(randomId);
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
document.querySelectorAll(".type-check").forEach((checkbox) => {
    checkbox.addEventListener("change", applyFilters);
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

fetchSelectedGenerations();
