//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();

  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  for (const episode of episodeList) {
    const card = document.createElement("section");
    card.classList.add("episode-card");

    //this could be done using template literals, but I wanted to show you a different way to do it
    const seasonNumber = episode.season.toString().padStart(2, "0");
    const episodeNumber = episode.number.toString().padStart(2, "0");
    const episodeCode = `S${seasonNumber},E${episodeNumber}`;

    //change episodeName to episodeInfo
    const episodeInfo = document.createElement("episodeTitle");
    episodeInfo.textContent = `${episode.name}-${episodeCode}`;

    // summary is here
    const summary = document.createElement("description");
    summary.innerHTML = episode.summary;

    //image is here
    const image = document.createElement("img");
    image.src = episode.image.medium;
    image.alt = `Episode image for ${episode.name}`;

    card.append(episodeInfo, image, summary);
    rootElem.append(card);
  }
}

window.onload = setup;
