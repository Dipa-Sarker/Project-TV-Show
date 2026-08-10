// You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  console.log(allEpisodes);
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  const episodeCards = [];

  // Selector implemented
  const selectEpisodeList = document.createElement("select");
  //back button added
  const backButton = document.createElement("button");
  backButton.textContent = "Back to all episodes";
  backButton.id = "back-button";
  backButton.style.display = "none";
  for (const episode of episodeList) {
    const option = document.createElement("option");

    option.textContent = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")} - ${episode.name}`;

    option.value = episode.id;

    selectEpisodeList.appendChild(option);
  }

  // Adding dropdown menu beside the search box
  const searchContainer = document.querySelector(".search-container");
  searchContainer.appendChild(selectEpisodeList);
  searchContainer.appendChild(backButton);

  // Creating episode cards
  for (const episode of episodeList) {
    const card = document.createElement("section");
    card.classList.add("episode-card");

    const episodeName = document.createElement("h2");
    episodeName.textContent = `${episode.name} - S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
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

      if (episode.name.toLowerCase().includes(searchTerm)) {
        card.style.display = "";
        matchingEpisodes++;
      } else {
        card.style.display = "none";
      }
    });

    episodeCount.textContent = `Displaying ${matchingEpisodes}/${episodeList.length} episodes`;
  });

  // Selector change event
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
  }); // Back to all episodes
  backButton.addEventListener("click", function () {
    location.reload();
  });
}

window.onload = setup;
