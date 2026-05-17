let movies = [];

// Load JSON Dataset
fetch("movies.json")
  .then(response => response.json())
  .then(data => {
    movies = data;
    console.log("Movies Loaded:", movies.length);
  })
  .catch(error => console.log("Error loading dataset:", error));


// Convert text into vector
function textToVector(text, vocabulary) {
  let vector = new Array(vocabulary.length).fill(0);
  let words = text.split(" ");

  words.forEach(word => {
    let index = vocabulary.indexOf(word);
    if (index !== -1) vector[index]++;
  });

  return vector;
}


// Cosine Similarity Function
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  if (magA === 0 || magB === 0) return 0;

  return dotProduct / (magA * magB);
}


// AI Recommendation Function
function getRecommendations() {
  let inputMovie = document.getElementById("movieInput").value.trim().toLowerCase();
  let resultTitle = document.getElementById("resultTitle");
  let recommendationsDiv = document.getElementById("recommendations");

  recommendationsDiv.innerHTML = "";

  if (movies.length === 0) {
    resultTitle.innerText = "Dataset is still loading... please wait!";
    return;
  }

  // Find movie
  let selectedMovie = movies.find(m => m.title && m.title.toLowerCase() === inputMovie);

  if (!selectedMovie) {
    resultTitle.innerText = "❌ Movie not found in dataset!";
    return;
  }

  resultTitle.innerText = `Recommended Movies for: ${selectedMovie.title}`;

  // Combine tags from genres + keywords + overview
  let selectedTags = "";
  if (selectedMovie.overview) selectedTags += selectedMovie.overview + " ";
  if (selectedMovie.genres) selectedTags += selectedMovie.genres + " ";
  if (selectedMovie.keywords) selectedTags += selectedMovie.keywords + " ";

  selectedTags = selectedTags.toLowerCase().replace(/[^a-zA-Z ]/g, "");

  // Build vocabulary from dataset
  let vocabulary = [];
  movies.forEach(movie => {
    let tags = "";
    if (movie.overview) tags += movie.overview + " ";
    if (movie.genres) tags += movie.genres + " ";
    if (movie.keywords) tags += movie.keywords + " ";

    tags = tags.toLowerCase().replace(/[^a-zA-Z ]/g, "");

    tags.split(" ").forEach(word => {
      if (word.length > 2 && !vocabulary.includes(word)) {
        vocabulary.push(word);
      }
    });
  });

  // Convert selected movie into vector
  let selectedVector = textToVector(selectedTags, vocabulary);

  // Calculate similarity
  let scores = movies.map(movie => {
    let tags = "";
    if (movie.overview) tags += movie.overview + " ";
    if (movie.genres) tags += movie.genres + " ";
    if (movie.keywords) tags += movie.keywords + " ";

    tags = tags.toLowerCase().replace(/[^a-zA-Z ]/g, "");

    let movieVector = textToVector(tags, vocabulary);

    return {
      title: movie.title,
      score: cosineSimilarity(selectedVector, movieVector),
      overview: movie.overview
    };
  });

  // Sort by similarity
  scores.sort((a, b) => b.score - a.score);

  // Display top 10 recommendations
  scores.slice(1, 11).forEach(movie => {
    let card = document.createElement("div");
    card.classList.add("movie-card");

    card.innerHTML = `
      <h3>${movie.title}</h3>
      <p><b>Similarity:</b> ${(movie.score * 100).toFixed(1)}%</p>
      <p>${movie.overview ? movie.overview.substring(0, 100) + "..." : "No overview available"}</p>
    `;

    recommendationsDiv.appendChild(card);
  });
}