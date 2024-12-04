const pokeAPI = "https://pokeapi.co/api/v2/pokemon?limit=20&offset=";
let pokemonList = [];
let currentPokemonIndex = 0;
let offset = 0;
let loadedPokemons = 20;
const totalPokemons = 151;
const searchInput = document.getElementById('search-input');
const loadMoreButton = document.querySelector('.bottom-button');
const scrollTopButton = document.getElementById('scroll-top-button');
let filteredPokemons = [];

const typeColors = {
    fire: '#FBAE24', water: '#00BFFF', grass: '#7CFC00', electric: '#FFD700',
    ice: '#ADD8E6', fighting: '#FF4500', poison: '#8A2BE2', ground: '#DAA520',
    flying: '#87CEEB', psychic: '#FF69B4', bug: '#A8D700', rock: '#C6B39E',
    ghost: '#6A5ACD', dragon: '#FF6347', fairy: '#FFB6C1', normal: '#D3D3D3',
    steel: '#C0C0C0', dark: '#696969'
};

async function init() {
    await loadData();
    await createPokemonCards(0, loadedPokemons);
}

async function loadData() {
    try {
        const response = await fetch(pokeAPI + offset);
        const responseToJson = await response.json();
        pokemonList = pokemonList.concat(responseToJson.results);
        offset += 20;
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

async function getPokemonDetails(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error getting Pokémon details:', error);
    }
}

async function createPokemonCards(startIndex, count) {
    const cardContainer = document.getElementById('card-container');
    const maxPokemonsToShow = Math.min(startIndex + count, totalPokemons);
    for (let index = startIndex; index < maxPokemonsToShow; index++) {
        let pokemonData = await getPokemonDetails(pokemonList[index].url);
        if (pokemonData) createPokemonCard(index, pokemonData);
    }
}

function createPokemonCard(index, pokemonData) {
    const cardContainer = document.getElementById('card-container');
    const card = document.createElement('div');
    card.classList.add('card-item');
    const primaryType = pokemonData.types[0].type.name;
    card.style.backgroundColor = typeColors[primaryType] || '#fff';
    const pokemonName = pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);
    const types = pokemonData.types.map(type => type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)).join(', ');
    setCardInnerHTML(card, pokemonName, types, pokemonData.sprites.front_default, index);
    card.addEventListener('click', () => openPopup(index));
    cardContainer.appendChild(card);
}

function setCardInnerHTML(card, pokemonName, types, sprite, index) {
    card.innerHTML = `
        <div class="card-content">
            <div class="card-types"><h3>${pokemonName}</h3> ${types}</div>
            <img src="${sprite}" alt="${pokemonName}" class="card-image">
            <div class="card-number">ID: ${index + 1}</div>
        </div>
    `;
}

async function openPopup(index) {
    if (index < 0) index = pokemonList.length - 1;
    else if (index >= pokemonList.length) index = 0;
    currentPokemonIndex = index;
    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');
    const overlay = document.getElementById('overlay');
    let pokemonData = await getPokemonDetails(pokemonList[currentPokemonIndex].url);
    const primaryType = pokemonData.types[0].type.name;
    popup.style.backgroundColor = typeColors[primaryType] || '#fff';
    const pokemonName = pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);
    setPopupContent(popupContent, pokemonName, pokemonData);
    popUpStatus();
}

function popUpStatus() {
    const popupImage = document.getElementById('popup-image');
    popupImage.addEventListener('click', closePopup);
    popup.style.display = 'block';
    overlay.style.display = 'block';
    document.body.classList.add('no-scroll');
}

function setPopupContent(popupContent, pokemonName, pokemonData) {
    popupContent.innerHTML = `
        <h3>${pokemonName}</h3>
        <img id="popup-image" src="${pokemonData.sprites.front_default}" alt="${pokemonName}">
        <p><strong>Height:</strong> ${pokemonData.height / 10} m</p>
        <p><strong>Weight:</strong> ${pokemonData.weight / 10} kg</p>
        <p><strong>Types:</strong> ${pokemonData.types.map(type => type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)).join(', ')}</p>
    `;
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

document.getElementById('prev-button').addEventListener('click', () => {
    openPopup(currentPokemonIndex - 1);
});

document.getElementById('next-button').addEventListener('click', () => {
    openPopup(currentPokemonIndex + 1);
});

document.querySelector('.bottom-button').addEventListener('click', async () => {
    disableInteraction();
    await loadData();
    await createPokemonCards(loadedPokemons, 20);
    loadedPokemons += 20;
    if (loadedPokemons >= totalPokemons) {
        document.querySelector('.bottom-button').style.display = 'none';
        scrollTopButton.style.display = 'block';
    }
    enableInteraction();
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
});

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    filterPokemons(searchTerm);
});

async function filterPokemons(searchTerm) {
    const cardContainer = document.getElementById('card-container');
    cardContainer.innerHTML = '';
    const filteredPokemons = pokemonList.filter(pokemon => 
        pokemon.name.toLowerCase().startsWith(searchTerm)
    );
    for (const pokemon of filteredPokemons) {
        const index = pokemonList.indexOf(pokemon);
        const pokemonData = await getPokemonDetails(pokemon.url);
        if (pokemonData) createPokemonCard(index, pokemonData);
    }
}

function disableInteraction() {
    loadMoreButton.disabled = true;
    searchInput.disabled = true;
    loadMoreButton.textContent = 'Loading...';
}

function enableInteraction() {
    loadMoreButton.disabled = false;
    searchInput.disabled = false;
    loadMoreButton.textContent = 'Load more Pokémon';
}

window.onload = init;

scrollTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
