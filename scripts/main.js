const BASE_URL = "https://pokeapi.co/api/v2/";

const GAME_DATA = {
  TRIES: 6,
};

const GAME_STATE = {
  attemptNo: 1,
  guess: "",
  selectedPokemon: null,
  allPokemon: [],
  isGameOver: false,
  result: "",
};

function initToastr() {
  toastr.options = {
    timeOut: 2500,
    preventDuplicates: true,
    positionClass: "toast-top-center",
  };
}

function showModal() {
  $("#results-modal").modal();
}

function getShareBtn() {
  const shareBtn = document.createElement("button");
  shareBtn.innerText = "Share";
  shareBtn.setAttribute("id", "share-btn");

  return shareBtn;
}

function getCurrentRow() {
  const currentSelector = ".attempt-" + GAME_STATE.attemptNo;
  const element = $(currentSelector);
  const boxes = element.find(".pokemon-box");

  return boxes;
}

function renderBoxes(selectedPokemon, gameContainer) {
  const len = selectedPokemon.length;
  for (let i = 0; i < GAME_DATA.TRIES; i++) {
    const row = document.createElement("div");
    row.classList.add("row");
    row.classList.add("attempt-" + (i + 1));

    for (let j = 0; j < len; j++) {
      const pokemonBox = document.createElement("div");
      pokemonBox.classList.add("pokemon-box");
      row.append(pokemonBox);
    }
    gameContainer.append(row);
  }
}

function renderOutput(yellows, greens) {
  const currentRow = getCurrentRow();

  currentRow.each(function (index) {
    if (yellows.includes(index)) {
      this.classList.add("yellow");
    } else if (greens.includes(index)) {
      this.classList.add("green");
    } else {
      this.classList.add("gray");
    }
  });
}

function updateAttempt() {
  const { guess, selectedPokemon, attemptNo } = GAME_STATE;
  if (guess === selectedPokemon) {
    GAME_STATE.isGameOver = true;
    GAME_STATE.result = "won";

    showPokemon(guess);
  } else {
    GAME_STATE.attemptNo = attemptNo + 1;
    GAME_STATE.guess = "";

    if (attemptNo >= GAME_DATA.TRIES) {
      GAME_STATE.isGameOver = true;
      GAME_STATE.result = "lost";
      showPokemon(selectedPokemon);
    }
  }
}

async function showPokemon(mon) {
  const photoContainer = $("#photo-holder");
  const btnHolder = $("#results-modal .btn-holder");
  const pokemonName = document.createElement("div");
  pokemonName.classList.add("pokemon-name");
  pokemonName.innerText = mon;
  try {
    const response = await fetch(
      "https://pokeapi.co/api/v2/pokemon/" + convertNameToPayload(mon)
    );
    const data = await response.json();
    const {
      sprites: { front_default },
    } = data;

    const pokemonImage = new Image();
    pokemonImage.onload = function () {
      let message = "";

      if (GAME_STATE.result === "won") {
        message = "Splendid! You guessed the Pokemon correctly!";
        const shareBtn = getShareBtn();
        btnHolder.append(shareBtn);
      } else {
        message = "You lost! Better luck next time.";
      }

      const messageElement = $("#results-message");
      messageElement.text(message);

      this.classList.add("pokemon-image");

      photoContainer.append(pokemonImage);
      photoContainer.append(pokemonName);

      showModal();
    };
    pokemonImage.src = front_default;
  } catch (e) {
    let message = "";
    if (GAME_STATE.result === "won") {
      message = "Splendid! You guessed the Pokemon correctly!";
      const shareBtn = getShareBtn();

      btnHolder.append(shareBtn);
    } else {
      message = "You lost! Better luck next time.";
    }

    const messageElement = document.createElement("div");
    messageElement.textContent = message;
    photoContainer.append(messageElement);

    showModal();
  }
}

function updateKeyboard() {
  const currentRow = getCurrentRow();
  Array.from(currentRow).forEach((element) => {
    const selector = $(".kb-letter");
    const value = findKey(selector, element.innerText);
    if (element.innerText.toLowerCase() === value.innerText.toLowerCase()) {
      if (element.classList.contains("green")) {
        value.classList.add("green");
      } else if (
        element.classList.contains("yellow") &&
        !value.classList.contains("green")
      ) {
        value.classList.add("yellow");
      } else {
        value.classList.add("gray");
      }
    }
  });
}

function validateAnswer() {
  const { guess, selectedPokemon } = GAME_STATE;

  if (GAME_STATE.allPokemon.includes(guess)) {
    const yellowIndices = [];
    const greenIndices = [];
    let tempStr = guess;
    let tempSelected = selectedPokemon;

    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === selectedPokemon[i]) {
        greenIndices.push(i);
      }
    }

    greenIndices.forEach((index) => {
      tempStr = tempStr.replace(tempStr[index], "*");
      tempSelected = tempSelected.replace(tempSelected[index], "*");
    });
    for (let i = 0; i < guess.length; i++) {
      if (!greenIndices.includes(i) && tempSelected.includes(guess[i])) {
        yellowIndices.push(i);
        tempSelected = tempSelected.replace(guess[i], "*");
      }
    }

    renderOutput(yellowIndices, greenIndices);

    updateKeyboard();
    updateAttempt();
  } else {
    toastr.error("Pokemon does not exist!", "Error");
  }
}

function inputHandler(value) {
  const currentRow = getCurrentRow();
  const selectedPokemon = GAME_STATE.selectedPokemon;

  if (value.toLowerCase() === "enter") {
    handleSubmit();
  } else if (value.toLowerCase() === "backspace") {
    if (GAME_STATE.guess) {
      GAME_STATE.guess = GAME_STATE.guess.slice(0, -1);
      const lastBoxWithValue = getLastBoxWithValue(currentRow);
      lastBoxWithValue.innerText = "";
    }
  } else if (isLetter(value)) {
    const nearestBox = getNearestEmptyBox(currentRow);

    if (nearestBox && GAME_STATE.guess.length < selectedPokemon.length) {
      nearestBox.innerText = value.toUpperCase();
      GAME_STATE.guess += value;
    }
  }
}

// For actual keyboard
function handleInput() {
  $(document).keydown(function (e) {
    if (!GAME_STATE.isGameOver) {
      const value = e.originalEvent.key;
      inputHandler(value);
    }
  });
}

function handleSubmit() {
  const { guess, selectedPokemon } = GAME_STATE;
  if (guess.length === selectedPokemon.length && !GAME_STATE.isGameOver) {
    validateAnswer();
  }
}

// For on-screen keyboard
function handleKeyboardInput() {
  $("div.kb-key").click(function () {
    if (!GAME_STATE.isGameOver) {
      const value = this.innerText.toLowerCase();
      inputHandler(value);
    }
  });
}

$(document).ready(async function () {
  initToastr();

  async function fetchPokedex() {
    try {
      const resultsResponse = await fetch(BASE_URL + "generation");
      const { results } = await resultsResponse.json();
      const generationUrls = results.map((res) => res.url);

      return Promise.all(
        generationUrls.map((url) =>
          fetch(url).then((response) => response.json())
        )
      );
    } catch {
      toastr.error("Error fetching Pokemon data", "Error");
    }
  }

  const pokedexData = await fetchPokedex();
  if (pokedexData) {
    const allPokemonRaw = pokedexData.map((gen) =>
      gen.pokemon_species.map((mon) => mon.name)
    );
    let allPokemonArr = [];

    allPokemonRaw.forEach(
      (gen) => (allPokemonArr = [...allPokemonArr, ...gen])
    );
    allPokemonArr = cleanPokemonData(allPokemonArr);

    const randomIndex = Math.floor(Math.random() * allPokemonArr.length);
    const selectedPokemon = allPokemonArr[randomIndex];
    GAME_STATE.selectedPokemon = selectedPokemon;
    GAME_STATE.allPokemon = allPokemonArr;
    const gameContainer = $("#game-container");

    renderBoxes(selectedPokemon, gameContainer);
    handleInput();
    handleKeyboardInput();
  } else {
  }
});
