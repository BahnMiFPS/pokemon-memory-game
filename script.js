const BASE_URL = "https://pokeapi.co/api/v2/pokemon/"
const game = document.querySelector(".game")
const pokedex = document.querySelector(".pokedex")
const btn = document.querySelector(".btn")
const loader = document.querySelector(".loader")

window.addEventListener("load", () => {
	loader.classList.add("loader-hidden")
	loader.addEventListener("transitionend", () => {
		loader.classList.add("loader-hidden")
	})
})

const load = () => {
	loader.classList.remove("loader-hidden")
	loader.addEventListener("transitionend", () => {
		loader.classList.add("loader-hidden")
	})
}

let isPaused = false
let firstCard
let matches

const colors = {
	fire: "#FDDFDF",
	grass: "#DEFDE0",
	electric: "#FCF7DE",
	water: "#DEF3FD",
	ground: "#f4e7da",
	rock: "#d5d5d4",
	fairy: "#fceaff",
	poison: "#98d7a5",
	bug: "#f8d5a3",
	dragon: "#97b3e6",
	psychic: "#eaeda1",
	flying: "#F5F5F5",
	fighting: "#E6E0D4",
	normal: "#F5F5F5",
}
async function loadPokemon() {
	const randomIds = new Set()
	while (randomIds.size < 8) {
		const id = Math.ceil(Math.random() * 150)
		randomIds.add(id)
	}
	// const pokemons = [...randomIds]
	// for (let i = 0; i < pokemons.length; i++) {
	// 	const response = await fetch(`${BASE_URL}${pokemons[i]}`)
	// 	const pokemon = await response.json()
	// 	console.log(pokemon)
	// }
	const pokePromises = [...randomIds].map((id) => fetch(BASE_URL + id))
	const responses = await Promise.all(pokePromises)
	const pokemon = await Promise.all(responses.map((res) => res.json()))
	return pokemon
}

const displayPokemon = (pokemon) => {
	pokemon.sort((_) => Math.random() - 0.5) // Randomly display pokemons instead of having them in the same order compared to each other
	const pokemonHTML = pokemon
		.map((pokemon) => {
			const type = pokemon.types[0].type.name || "normal"
			const color = colors[type]
			return `
		<div class="card" style="background-color:${color}" onclick="clickCard(event)" data-pokename="${pokemon.name}">
<div class = "front"></div>

			<div class="back rotated" style="background-color:${color}">
			<img src="${pokemon.sprites.front_default}" alt="${pokemon.name}"/>
			<div class="pokemon-name">${pokemon.name}</div>
			</div>
		</div>`
		})
		.join("")
	game.innerHTML = pokemonHTML
}

const clickCard = (event) => {
	const pokemonCard = event.currentTarget
	const [front, back] = getFrontandBackFromCard(pokemonCard)

	if (front.classList.contains("rotated") || isPaused) return

	isPaused = true

	rotateCards([front, back])

	if (!firstCard) {
		firstCard = pokemonCard
		isPaused = false
	} else {
		const secondPokemonName = pokemonCard.dataset.pokename
		const firstPokemonName = firstCard.dataset.pokename
		if (firstPokemonName !== secondPokemonName) {
			const [firstFront, firstBack] = getFrontandBackFromCard(firstCard)
			setTimeout(() => {
				rotateCards([front, back, firstFront, firstBack])
				firstCard = null
				isPaused = false
			}, 500)
		} else {
			matches++
			if (matches === 8) {
				setTimeout(() => {
					game.innerHTML = `<img src="https://preview.redd.it/u97qpd4knu161.png?width=1920&format=png&auto=webp&v=enabled&s=46da0ddf247dab8de0db6ca6a8cc2b51d942c074" class="win-card" />`
				}, 2000)
			}

			firstCard = null
			isPaused = false
		}
	}
}

const getFrontandBackFromCard = (card) => {
	const front = card.querySelector(".front")
	const back = card.querySelector(".back")
	return [front, back]
}

const rotateCards = function (e) {
	if (typeof e !== "object" || !e.length) return

	e.forEach((element) => element.classList.toggle("rotated"))
}

const resetGame = () => {
	loader.classList.remove("loader-hidden")
	// pokedex.classList.add("pokedex-hidden")
	game.innerHTML = ""
	isPaused = true
	firstCard = null
	matches = 0
	load()

	setTimeout(async () => {
		// pokedex.classList.remove("pokedex-hidden")
		const pokemon = await loadPokemon()
		displayPokemon([...pokemon, ...pokemon])
		isPaused = false
	}, 2000)
}
btn.addEventListener("click", resetGame)
resetGame()
