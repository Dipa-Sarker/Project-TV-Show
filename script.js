//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  console.log(allEpisodes);
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  for (const episode of episodeList) {
    const card = document.createElement("section");
    card.classList.add("episode-card");
    const episodeName = document.createElement("h2");
    episodeName.textContent = `${episode.name} - S${String(episode.season).padStart(2, "0")}E${String(episode.season).padStart(2, "0")}`;
    card.append(episodeName);
    const image = document.createElement("img");
    image.src = episode.image.medium;
    image.alt = `Episode image for ${episode.name}`;
    card.append(image);
    const summary = document.createElement("p");
    summary.innerHTML = episode.summary;
    card.append(summary);
    rootElem.append(card);
  }
}
console.log("hello");

window.onload = setup;
