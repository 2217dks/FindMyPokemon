# FindMyPokemon

**FindMyPokemon** is responsive Single Page Application Capstone Project for **Web Application Programming (WAP)**. 

The application is a Pokémon browser, allowing users to search, filter, sort, and discover Pokémon across all 9 generations. It parses JSON data directly from the [PokeAPI](https://pokeapi.co/) and renders it into a simple UI.

---

## Key Features

- **Global Search:** Searches Pokemon by its exact name or National ID index.
- **Filtering:** Filter Pokemon by clicking Type Pills across selected generations.
- **Sorting:** Re-sort the displayed Pokemon by ID, HP, Attack, Defense, Speed, or Weight metrics.
- **Random Discovery:** Randomly fetches and renders one of the available Pokemon.
- **UI:** Color-coded pills based on types of Pokemon, official artwork, functional Dark/Light mode theme toggler.
- **Responsive Design:** Scales for desktop monitors as well as mobile screens using `@media` queries.

---

## Technical Highlights

This project was built using HTML, CSS, and JavaScript, to satisfy the core WAP Capstone requirements.

### 1. Asynchronous Programming & Fetch API
The app uses JavaScript Promises and `async / await` to get data from the API.
- **API Integration:** Data from PokeAPI is used to build the cards.
- **Caching:** already fetched generations are cached after the first fetch using `Promise.all()`.

### 2. Higher-Order Functions (HOFs)
The project uses HOFs for data handling.
- **`.map()`**: Used to create HTML strings for Pokemon and their types.
- **`.filter()`**: Used in the sidebar to show only the Pokemon that match the selected types.
- **`.every()`**: Used to check if a Pokemon has the types selected by the user.
- **`.sort()`**: Used to sort the list by ID, HP, Attack, Defense, Speed, or Weight.

### 3. Responsive Web Design
- **Flexbox & Grid:** Used to make the app work on different screen sizes. Mobile view shows two columns of cards.
- **Variables:** CSS variables are used for theme colors, making the dark mode toggle possible.

---
