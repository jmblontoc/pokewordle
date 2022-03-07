function isAlphanumeric(str) {
  return str.length === 1 && str.match(/^[a-z0-9]+$/i);
}

function cleanString(str) {
  return str.replace(/[^\w\s]/gi, "");
}

function cleanPokemonData(arr) {
  return arr.map((mon) => {
    if (mon.includes("nidoran")) {
      return "nidoran";
    }
    return cleanString(mon);
  });
}

function getNearestEmptyBox(boxes) {
  for (const key in boxes) {
    if (boxes.hasOwnProperty(key)) {
      const box = boxes[key];
      if (!box.innerText) {
        return box;
      }
    }
  }
  return null;
}

function getLastBoxWithValue(boxes) {
  let indexHolder = -1;
  boxes.each(function (box) {
    if (this.innerText) {
      indexHolder = box;
    }
  });

  return boxes[indexHolder];
}

function findKey(keys, letter) {
  let searchedKey = "";
  Array.from(keys).forEach((item) => {
    if (
      item &&
      letter &&
      letter.toLowerCase() === item.innerText.toLowerCase()
    ) {
      searchedKey = item;
    }
  });

  return searchedKey;
}

function convertNameToPayload(mon) {
  switch (mon) {
    case "mrmime":
      return "mr-mime";
    case "nidoran":
      return "nidoran-f";
    case "hooh":
      return "ho-oh";
    case "mimejr":
      return "mime-jr";
    case "porygonz":
      return "porygon-z";
    case "typenull":
      return "type-null";
    case "jangmoo":
      return "jangmo-o";
    case "tapukoko":
      return "tapu-koko";
    case "tapulele":
      return "tapu-lele";
    case "tapubulu":
      return "tapu-bulu";
    case "tapufini":
      return "tapu-fini";
    case "hakamoo":
      return "hakamo-o";
    case "kommoo":
      return "kommo-o";
    case "mrrime":
      return "mr-rime";
    default:
      return mon;
  }
}

function countLines(str) {
  return str.split(/\r\n|\r|\n/).length;
}

function getResultEmoji() {
  const emojis = {
    green: "🟩",
    yellow: "🟨",
    gray: "⬛",
  };
  let result = "";
  const rows = $("div.row");
  rows.each(function () {
    const letters = this.children;
    let guessName = "";
    for (let letter of letters) {
      {
        if (letter.classList.contains("green")) {
          result += emojis.green;
        } else if (letter.classList.contains("yellow")) {
          result += emojis.yellow;
        } else if (letter.classList.contains("gray")) {
          result += emojis.gray;
        } else {
          result += "";
        }

        guessName += letter.innerText;
      }
    }
    result += " " + guessName + "\n";
  });

  const emojiResult = result.trim();
  return `Score: ${countLines(emojiResult)}/${GAME_DATA.TRIES}\n${emojiResult}`;
}
