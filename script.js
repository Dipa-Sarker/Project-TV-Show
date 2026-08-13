// You can edit ALL of the code here

const showsLink = "https://api.tvmaze.com/shows";
const episodesMessage = document.getElementById("message1"); //for loading message
const showsMessage = document.getElementById("message2");

//stores episodes that we already fetched
let cachedEpisodes = {};

async function setup() {
  episodesMessage.textContent = "Loading episodes..."; //shows this message when episode data is loading
  showsMessage.textContent = "Loading shows..."; //shows this message when shows data is loading

  try {
    //fetch the shows
    const showsResponse = await fetch(showsLink);

    const shows = await showsResponse.json(); //API sends the data in JSON format

    // Sort shows alphabetically, ignoring case
    shows.sort(function (show1, show2) {
      return show1.name.localeCompare(show2.name, undefined, {
        sensitivity: "base",
      });
    });

    makeShowSelector(shows); //now the shows data is a normal Javascript object

    // Load the first show's episodes when the page loads
    const firstShowId = shows[0].id;
    const episodeCards = await loadEpisodes(firstShowId);

    episodesMessage.textContent = ""; // loading message disappears after episode arrives
    showsMessage.textContent = ""; // loading message disappears after show arrives
  } catch (error) {
    //error handling
    episodesMessage.textContent =
      "Error: Episodes not found. Try again later...";
    showsMessage.textContent = "Error: Show not found. Try again later...";
  }
}

// Load episodes for a show
async function loadEpisodes(showId) {
  // Check if we already fetched this show's episodes
  if (cachedEpisodes[showId]) {
    const episodes = cachedEpisodes[showId];

    const episodeCards = makePageForEpisodes(episodes);
    makeEpisodeSelector(episodes, episodeCards);

    return episodeCards;
  }

  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`,
    );

    const episodes = await response.json();

    // Store the episodes so we don't fetch the same URL again
    cachedEpisodes[showId] = episodes;

    // fill the episode dropdown
    const episodeCards = makePageForEpisodes(episodes);
    makeEpisodeSelector(episodes, episodeCards);

    return episodeCards;
  } catch (error) {
    episodesMessage.textContent =
      "Error: Episodes not found. Try again later...";
  }
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; //This is so that it refreshes everytime we choose a new show and want to see new episodes
  const episodeCards = [];

  // episodeSelector implemented
  // const selectEpisodeList = document.createElement("select"); // we need to move this out of makepageforepisodes because it would append the same episodes each time if we don
  // selectEpisodeList.id = "episode-selector";

  // Creating episode cards
  for (const episode of episodeList) {
    const card = document.createElement("section");
    card.classList.add("episode-card");

    const episodeName = document.createElement("h2");
    episodeName.textContent = `${episode.name} - S${String(
      episode.season,
    ).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
    card.append(episodeName);

    const image = document.createElement("img");
    image.src = episode.image.medium;
    image.alt = `Episode image for ${episode.name}`;
    card.append(image);

    const summary = document.createElement("p");
    summary.innerHTML = episode.summary;
    card.append(summary);

    episodeCards.push(card);
    rootElem.append(card);
  }

  // Search implemented
  const searchInput = document.getElementById("search-input");
  const episodeCount = document.getElementById("episode-count");

  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();
    let matchingEpisodes = 0;

    episodeList.forEach(function (episode, index) {
      const card = episodeCards[index];

      if (
        episode.name.toLowerCase().includes(searchTerm) ||
        episode.summary.toLowerCase().includes(searchTerm)
      ) {
        card.style.display = "";
        matchingEpisodes++;
      } else {
        card.style.display = "none";
      }
    });

    episodeCount.textContent = `Displaying ${matchingEpisodes}/${episodeList.length} episodes`;
  });

  return episodeCards;
}

//episode selector taken out of makepage for episodes
function makeEpisodeSelector(episodeList, episodeCards) {
  const searchContainer = document.querySelector(".search-container");
  const selectEpisodeList = document.createElement("select");
  selectEpisodeList.id = "episode-selector";

  // Create the episode container only once
  let episodeContainer = document.getElementById("episode-container");

  if (!episodeContainer) {
    episodeContainer = document.createElement("div");
    episodeContainer.id = "episode-container";
    searchContainer.appendChild(episodeContainer);
  }

  // Clear the old episode selector before adding the new one
  episodeContainer.innerHTML = "";

  // Add episodes as options
  for (const episode of episodeList) {
    const option = document.createElement("option");

    option.textContent = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number,
    ).padStart(2, "0")} - ${episode.name}`;

    option.value = episode.id;

    selectEpisodeList.appendChild(option);
  }

  //back button added
  const backButton = document.createElement("button");
  backButton.textContent = "Show all episodes";
  backButton.id = "back-button";
  backButton.style.display = "";

  // Add dropdown to the page
  const episodeLabel = document.createElement("label");

  episodeLabel.textContent = "Select an episode: ";
  episodeLabel.htmlFor = "episode-selector";

  // Add everything to the container
  episodeContainer.appendChild(episodeLabel);
  episodeContainer.appendChild(selectEpisodeList);
  episodeContainer.appendChild(backButton);

  // What happens when an episode is selected
  selectEpisodeList.addEventListener("change", function () {
    const selectedId = selectEpisodeList.value;

    const selectedEpisode = episodeList.find(function (episode) {
      return episode.id === Number(selectedId);
    });

    for (const card of episodeCards) {
      card.style.display = "none";
    }

    const index = episodeList.indexOf(selectedEpisode);
    const selectedCard = episodeCards[index];

    selectedCard.style.display = "";
    backButton.style.display = "";
  });

  // Back to all episodes
  backButton.addEventListener("click", function () {
    backButton.style.display = "";

    for (const card of episodeCards) {
      card.style.display = ""; // shows all episode cards again
    }
  });
}

//showSelector implemented
function makeShowSelector(shows) {
  const selectShowList = document.createElement("select");
  selectShowList.id = "show-selector";

  const showLabel = document.createElement("label");
  showLabel.textContent = "Select a show: ";
  showLabel.htmlFor = "show-selector";

  shows.forEach((show) => {
    const option = document.createElement("option");

    option.textContent = show.name;
    option.value = show.id;

    selectShowList.appendChild(option);
  });

  selectShowList.addEventListener("change", async () => {
    const showId = selectShowList.value;

    episodesMessage.textContent = "Loading episodes...";

    // Load episodes using the cache
    await loadEpisodes(showId);

    episodesMessage.textContent = "";
  });

  // Add dropdown to the page
  const searchContainer = document.querySelector(".search-container");

  searchContainer.appendChild(showLabel);
  searchContainer.appendChild(selectShowList);
}

window.onload = setup;
