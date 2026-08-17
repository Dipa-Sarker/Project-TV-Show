// You can edit ALL of the code here

const showsLink = "https://api.tvmaze.com/shows"; // TVMaze API endpoint that returns all TV shows

const episodesMessage = document.getElementById("message1"); // Element used to display episode loading/error messages
const showsMessage = document.getElementById("message2"); // Element used to display show loading/error messages
const searchContainer = document.querySelector(".search-container"); // Container that holds search input and dropdowns
const rootElem = document.getElementById("root"); // Main container where show cards or episode cards are displayed
const searchInput = document.getElementById("search-input"); // Search box used for both show search and episode search
const episodeCount = document.getElementById("episode-count"); // Displays episode filtering count
// Example: Displaying 5/73 episodes
const searchLabel = document.getElementById("search-label"); // Label displayed on the shows page
// Example: "Filtering for"
const showCount = document.getElementById("show-count"); // Displays number of matching shows
// Example: Found 12 shows


//Stores episodes that we already fetched from the API
// Key = showId
// Value = array of episodes
// Prevents fetching the same show twice
let cachedEpisodes = {};

// Store all shows fetched during setup(),so they can be displayed again when the user 
// returns to the shows listing, i.e front page
let allShows = [];

// Tracks whether the user is viewing shows or episodes; on front page or 2nd page
let currentView = "shows";

// Store the episodes of the currently selected show
// Used for searching and filtering episodes
let currentEpisodes = [];

// Shared error message shown when episode fetch fails
const EPISODE_ERROR =
  "Error: Episodes not found. Try again later...";
// Shared error message shown when show fetch fails
const SHOW_ERROR =
  "Error: Show not found. Try again later...";

// Reusable helper function for episode codes, Example: season: 1, episode: 1 -> S01E01
function formatEpisodeCode(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number
  ).padStart(2, "0")}`;
}

// Reusable helper function which creates the API URL for a specific show's episodes
function getEpisodeUrl(showId) {
  return `https://api.tvmaze.com/shows/${showId}/episodes`;
}

//Reusable helper function for removing loading and error messages from the page
function clearMessages() {
  episodesMessage.textContent = ""; // loading/error message disappears after episode arrives
  showsMessage.textContent = ""; // loading/error message disappears after show arrives
}

// Reusable helper function: Search TV shows by name, genre or summary and return only the matching shows
function searchShows(searchTerm, allShows) {
  const matchingShows = [];
  searchTerm = searchTerm.toLowerCase();
  for(const show of allShows){ //go through each show from all shows
    if(show.name.toLowerCase().includes(searchTerm) || show.genres.toString().toLowerCase().includes(searchTerm) || (show.summary || "").toLowerCase().includes(searchTerm)){
    matchingShows.push(show);
    }
  } 
  return matchingShows; // returns an array containing only the matching shows
}

// Reusable helper function: Search episodes by name or summary and return only the matching episodes
function searchEpisodes(searchTerm, currentEpisodes) {
  const matchingEpisodes = [];
  searchTerm = searchTerm.toLowerCase();
  for(const episode of currentEpisodes){ //go through each episode from current episodes
    if(episode.name.toLowerCase().includes(searchTerm) || (episode.summary || "").toLowerCase().includes(searchTerm)){
    matchingEpisodes.push(episode);
    }
  } 
  return matchingEpisodes; // returns an array containing only the matching episodes
}


//==================== SETUP ====================
// Runs once when the page loads and Fetches all TV shows from the API
async function setup() {
  episodesMessage.textContent = "Loading episodes..."; //shows this message when episode data is loading
  showsMessage.textContent = "Loading shows..."; //shows this message when shows data is loading

  try {
    // Try to fetch and display show data. If anything fails, moves to catch()
    const showsResponse = await fetch(showsLink); // Send request to TVMaze API for all shows
    const shows = await showsResponse.json(); //API sends the data in JSON format then convert 
    // shows data is a normal Javascript array object
    allShows = shows; // Store the fetched all shows globally so they can be 
    // displayed again later(e.g. when user clicks "Show all shows")

    // Sort shows alphabetically by name, ignoring case
    shows.sort(function (show1, show2) {
      return show1.name.toLowerCase().localeCompare(show2.name.toLowerCase()); // Convert both names to lowercase
      // then compare alphabetically
    });

    makePageForShows(shows); // Display all TV shows as cards on the front page
    makeShowSelector(shows); // Create dropdown containing all shows

    // Data loaded successfully, remove loading messages
    clearMessages(); 

  } catch (error) { // Runs if fetching or processing data fails, i.e error handling
    console.error(error);
    
    episodesMessage.textContent = EPISODE_ERROR; //shows error message
    showsMessage.textContent = SHOW_ERROR;
  }

}

// ==================== DISPLAY SHOWS ON THE FRONT PAGE ====================
function makePageForShows(showList) {
  
  // Show the "Filtering for" label on the shows listing page, i.e front page
  searchLabel.style.display = "";

  // change the search box to search shows on the front page
  searchInput.placeholder = "Search shows...";

 //Shows the text if no. of shows found after filtering on front page
  showCount.textContent = `Found ${showList.length} shows`;

  // User is currently viewing the shows listing on front page
  currentView = "shows";
  
  rootElem.innerHTML = "";

  //creating show cards for FRONT PAGE
  for (const show of showList) {
    const card = document.createElement("section");
    card.classList.add("show-card");

    const showName = document.createElement("h2");
    showName.textContent = show.name;

    showName.style.cursor = "pointer"; //shows hand cursor when mouse is over the show name; tells the user, you can click this

    showName.addEventListener("click", async function () { //when the user clicks show name, Load that show's episodes
      await loadEpisodes(show.id);
    });

    const image = document.createElement("img"); //6 elements according to requirement 1
    image.src = show.image.medium;
    image.alt = `Show image for ${show.name}`;

    const genres = document.createElement("p");
    genres.textContent = `Genres: ${show.genres.join(", ")}`;

    const status = document.createElement("p");
    status.textContent = `Status: ${show.status}`;

    const rating = document.createElement("p");
    rating.textContent = `Rating: ${show.rating.average}`;

    const runtime = document.createElement("p");
    runtime.textContent = `Runtime: ${show.runtime} minutes`;

    const summary = document.createElement("div");
    summary.innerHTML = show.summary;
    
    
    
const showInfo = document.createElement("div");
showInfo.classList.add("show-info");

showInfo.append(
  rating,
  genres,
  status,
  runtime
);

summary.classList.add("summary");

card.append(
  showName,
  image,
  summary,
  showInfo
);

    rootElem.append(card); //add the completed card inside the page container (root) /display the finished card on the page
  }

  // Hide episode controls
  const episodeContainer = document.getElementById("episode-container");

  if (episodeContainer) {
    episodeContainer.style.display = "none";
  }

  // Show show selector
  const showContainer = document.getElementById("show-container");

  if (showContainer) {
    showContainer.style.display = "";
  }

}

// ==================== LOAD EPISODES ====================
// Load episodes for a show
async function loadEpisodes(showId) {
  // Check if we already fetched this show's episodes
  if (cachedEpisodes[showId]) {
    const episodes = cachedEpisodes[showId];
    currentEpisodes = episodes; // Save the episodes of the selected show for searching and filtering
    const episodeCards = makePageForEpisodes(episodes);
    makeEpisodeSelector(episodes, episodeCards);

    return episodeCards;
  }

  try {
    const response = await fetch(getEpisodeUrl(showId));
    const episodes = await response.json();
    currentEpisodes = episodes; // Save the episodes of the selected show for searching and filtering
    
    // Store the episodes so we don't fetch the same URL again
    cachedEpisodes[showId] = episodes;

    // fill the episode dropdown
    const episodeCards = makePageForEpisodes(episodes);
    makeEpisodeSelector(episodes, episodeCards);

    return episodeCards;
  } catch (error) {
    episodesMessage.textContent = EPISODE_ERROR;
  }
}


// ==================== DISPLAY EPISODES ====================
function makePageForEpisodes(episodeList) {

  // Hide the "Filtering for" label while viewing episodes on the 2nd page
  searchLabel.style.display = "none";
  //Hide the text "no. of shows found" after found filtered shows, on the 2nd page
  showCount.textContent = "";

  // change the search box to search episodes when viewing episodes on the 2nd page
  searchInput.placeholder = "Search episodes...";

  // user is currently viewing episodes on the 2nd page
  currentView = "episodes";

  rootElem.innerHTML = ""; //This is so that it refreshes everytime we choose a new show and want to see new episodes
  const episodeCards = []; //this will further use for episode search, episode selector, show all episodes button

  // Creating episode cards
  for (const episode of episodeList) {
    const card = document.createElement("section");
    card.classList.add("episode-card");

    const episodeName = document.createElement("h2");
    episodeName.textContent = `${episode.name} - ${formatEpisodeCode(episode)}`;
    card.append(episodeName);

    const image = document.createElement("img");
    image.src = episode.image?.medium || ""; //
    image.alt = `Episode image for ${episode.name}`;
    card.append(image);

    const summary = document.createElement("div"); 
    summary.innerHTML = episode.summary;
    card.append(summary);

    episodeCards.push(card);
    rootElem.append(card); //display card on the page
  }

 // Hide show selector
 const showContainer = document.getElementById("show-container");

  if (showContainer) {
    showContainer.style.display = "none";
  }

 // Show episode controls
  const episodeContainer = document.getElementById("episode-container");

  if (episodeContainer) {
    episodeContainer.style.display = "";
  }

  return episodeCards; 
  
} 

// ==================== MAKE EPISODE SELECTOR ====================
//episode selector taken out of makepage for episodes
function makeEpisodeSelector(episodeList, episodeCards) {

  // Find the existing episode container
  let episodeContainer = document.getElementById("episode-container");

  // Create it only if it doesn't exist
  if (!episodeContainer) {
    episodeContainer = document.createElement("div");
    episodeContainer.id = "episode-container";
    searchContainer.appendChild(episodeContainer);
  }

  // Clear the old episode selector before adding the new one
  episodeContainer.innerHTML = "";

  // Create a new episode dropdown
  const selectEpisodeList = document.createElement("select");
  selectEpisodeList.id = "episode-selector";
 
  // add episodes for the currently selected show
  for (const episode of episodeList) {
    const option = document.createElement("option");

    option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;

    option.value = episode.id;

    selectEpisodeList.appendChild(option);
  }

  // Add dropdown to the page, create label
  const episodeLabel = document.createElement("label");
  episodeLabel.textContent = "Select an episode: ";
  episodeLabel.htmlFor = "episode-selector";
  
  //create "show all" button
  const backButton = document.createElement("button");
  backButton.textContent = "Show all episodes";
  backButton.id = "back-button";

  //create "back to show" button
  const backToShowButton = document.createElement("button");
  backToShowButton.textContent = "Show all shows";
  backToShowButton.id = "back-to-shows-button";
  
  // Add everything to the container
  episodeContainer.appendChild(episodeLabel);
  episodeContainer.appendChild(selectEpisodeList);
  episodeContainer.appendChild(backButton);
  episodeContainer.appendChild(backToShowButton); //newly added for back to show

  // ==================== EPISODE SELECTOR ====================
  // What happens when an episode is selected
  selectEpisodeList.addEventListener("change", function () {
    const selectedId = Number(selectEpisodeList.value);

    const selectedEpisode = episodeList.find(function (episode) {
      return episode.id === selectedId;
    });

    for (const card of episodeCards) {
      card.style.display = "none";
    }

    const index = episodeList.indexOf(selectedEpisode);
    episodeCards[index].style.display = "";
    backButton.style.display = "";

  });

  // shows all episodes again
  backButton.addEventListener("click", function () {
    for (const card of episodeCards) {
      card.style.display = ""; // shows all episode cards again
    }
     // Clear search as well
    searchInput.value = "";

    episodeCount.textContent =
      `Displaying ${episodeList.length}/${episodeList.length} episodes`;

    backButton.style.display = "none";
  });

  // Reset episode controls and return to the shows listing on FRONT PAGE
  backToShowButton.addEventListener("click", function () { //user back to show button clicked
  searchInput.value = ""; //clear episode search
  episodeCount.textContent = ""; //clear episode count

  makePageForShows(allShows); //display all TV shows again on front page
  makeShowSelector(allShows);
  if (episodeContainer) {
  episodeContainer.style.display = "none";
}
});
}

// ==================== SHOW SELECTOR ====================
//showSelector implemented
function makeShowSelector(shows) {

// Find the existing show container
let showContainer = document.getElementById("show-container");

// Create it only if it doesn't exist
if (!showContainer) {
  showContainer = document.createElement("div");
  showContainer.id = "show-container";
  searchContainer.appendChild(showContainer);
}

// Clear old dropdown before adding a new one
showContainer.innerHTML = "";

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
    const showId = Number(selectShowList.value);

     // Remember which show the user currently wants
  selectedShowId = showId;
      searchInput.value = "";
      episodeCount.textContent = "";

    episodesMessage.textContent = "Loading episodes...";

    // Load episodes using the cache
    await loadEpisodes(showId);

    episodesMessage.textContent = "";
  });

  
  // Add dropdown to the page
  showContainer.appendChild(showLabel);
  showContainer.appendChild(selectShowList);
}

// ==================== SEARCH FOR BOTH SHOWS & EPISODES (Globar search listener) ====================
// Run every time the user types in the search box
searchInput.addEventListener("input", function () {

  const searchTerm = searchInput.value.toLowerCase(); // Get the current search text and convert it to lowercase


 if (currentView === "shows") { // If the user is on the shows listing page/ 2nd page
    const matchingShows = searchShows(searchTerm, allShows); // Find all shows that match the search text
    makePageForShows(matchingShows); // Redisplay only the matching shows
    makeShowSelector(matchingShows); //display only matching shows in dropdown
}
else if (currentView === "episodes") { // If the user is viewing episodes
    const matchingEpisodes = searchEpisodes(searchTerm, currentEpisodes); // Find all episodes that match the search text
    
    episodeCount.textContent =
    `Displaying ${matchingEpisodes.length}/${currentEpisodes.length} episodes`;
    
    makePageForEpisodes(matchingEpisodes); // Redisplay only the matching episodes
}

});


window.onload = setup;
