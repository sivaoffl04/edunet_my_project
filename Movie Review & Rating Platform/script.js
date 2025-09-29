document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const movieResults = document.getElementById('movie-results');
    const resultsInfo = document.getElementById('results-info');
    const categoriesSection = document.getElementById('categories-section');
    const modal = document.getElementById('movie-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.querySelector('.close-btn');
    const homeLink = document.getElementById('home-link');
    const favoritesLink = document.getElementById('favorites-link');

    const API_KEY = 'c7153651'; //Api key
    const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;

    let state = {
        favorites: JSON.parse(localStorage.getItem('favorites')) || [],
        reviews: JSON.parse(localStorage.getItem('reviews')) || {},
        ratings: JSON.parse(localStorage.getItem('ratings')) || {},
        currentView: 'home', // 'home' or 'favorites'
        lastSearch: '',
        categories: ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance']
    };

    // --- Event Listeners ---
    searchForm.addEventListener('submit', handleSearch);
    homeLink.addEventListener('click', showHome);
    favoritesLink.addEventListener('click', showFavorites);
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => e.target === modal && closeModal());

    // --- Navigation & View Functions ---

    /**
     * Handles the search form submission.
     * @param {Event} e - The form submission event.
     */
    async function handleSearch(e) {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            resultsInfo.textContent = "Please enter a movie title to search.";
            movieResults.innerHTML = '';
            return;
        }
        state.lastSearch = searchTerm;
        fetchAndDisplayMovies(searchTerm);
    }

    function showHome(e) {
        if (e) e.preventDefault();
        state.currentView = 'home';
        setActiveLink(homeLink);
        if (state.lastSearch) {
            fetchAndDisplayMovies(state.lastSearch);
            categoriesSection.style.display = 'none';
        } else {
            resultsInfo.textContent = "Browse by Category";
            movieResults.innerHTML = '';
            displayCategories();
        }
    }

    function showFavorites(e) {
        e.preventDefault();
        state.currentView = 'favorites';
        setActiveLink(favoritesLink);
        resultsInfo.textContent = "Your Favorite Movies";
        categoriesSection.style.display = 'none';
        if (state.favorites.length > 0) {
            displayMovies(state.favorites);
        } else {
            movieResults.innerHTML = '<p class="info-text">You have no favorite movies yet. Find a movie and click the heart to add one!</p>';
        }
    }

    /**
     * Fetches movies from OMDB API and displays them.
     * @param {string} searchTerm - The movie title to search for.
     */
    async function fetchAndDisplayMovies(searchTerm) {
        resultsInfo.textContent = `Searching for "${searchTerm}"...`;
        movieResults.innerHTML = '';
        categoriesSection.style.display = 'none';
        try {
            const response = await fetch(`${API_URL}&s=${searchTerm}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.Response === "True") {
                resultsInfo.textContent = `Showing results for "${searchTerm}"`;
                displayMovies(data.Search);
            } else {
                resultsInfo.textContent = `No results found for "${searchTerm}". ${data.Error || ''}`;
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            resultsInfo.textContent = `Error fetching movies: ${error.message}. Please check API key or try again.`;
        }
    }

    // --- Display & UI Functions ---

    /**
     * Renders an array of movie objects into the DOM.
     * @param {Array} movies - An array of movie objects from the API.
     */
    function displayMovies(movies) {
        movieResults.innerHTML = movies.map(movie => `
            <div class="movie-card" data-imdbid="${movie.imdbID}">
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450.png?text=No+Image'}" alt="${movie.Title} Poster">
                <div class="movie-card-info">
                    <h3>${movie.Title}</h3>
                    <p>${movie.Year}</p>
                    <button class="more-info-btn gradient-btn">More Info</button>
                </div>
            </div>
        `).join('');
        observeCards();
        // Add event listeners to the new "More Info" buttons
        document.querySelectorAll('.more-info-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openModal(e.target.closest('.movie-card').dataset.imdbid));
        });
    }

    /**
     * Renders movie category links into the DOM.
     */
    function displayCategories() {
        categoriesSection.style.display = 'grid';
        categoriesSection.innerHTML = `
            ${state.categories.map(category => `
                <div class="category-card gradient-btn" data-category="${category}">
                    ${category}
                </div>
            `).join('')}
        `;
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                handleCategoryClick(e.target.dataset.category);
            });
        });
    }
    /**
     * Scroll reveal animation for movie cards.
     */
    function observeCards() {
        const movieCards = document.querySelectorAll('.movie-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        movieCards.forEach(card => {
            observer.observe(card);
        });
    }

    // --- Modal Functions ---

    /**
     * Handles clicks on category cards.
     * @param {string} category - The category name to search for.
     */
    function handleCategoryClick(category) {
        searchInput.value = category;
        fetchAndDisplayMovies(category);
    }

    async function openModal(imdbID) {
        try {
            const response = await fetch(`${API_URL}&i=${imdbID}&plot=full`);
            if (!response.ok) throw new Error('Failed to fetch movie details.');
            const movie = await response.json();
            if (movie.Response === "False") throw new Error(movie.Error);

            displayMovieDetails(movie);
            modal.style.display = 'block';
        } catch (error) {
            console.error("Error opening modal:", error);
            resultsInfo.textContent = `Error: ${error.message}`;
        }
    }

    function closeModal() {
        modal.style.display = 'none';
        modalBody.innerHTML = ''; // Clear content to prevent old data flashing
    }

    function displayMovieDetails(movie) {
        const isFavorite = state.favorites.some(fav => fav.imdbID === movie.imdbID);
        const userRating = state.ratings[movie.imdbID] || 0;
        const userReview = state.reviews[movie.imdbID] || '';

        modalBody.innerHTML = `
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450.png?text=No+Image'}" alt="${movie.Title} Poster">
            <div class="modal-info" data-imdbid="${movie.imdbID}">
                <h2>${movie.Title}</h2>
                <p><strong>Year:</strong> ${movie.Year}</p>
                <p><strong>Rated:</strong> ${movie.Rated}</p>
                <p><strong>Released:</strong> ${movie.Released}</p>
                <p><strong>Runtime:</strong> ${movie.Runtime}</p>
                <p><strong>Genre:</strong> ${movie.Genre}</p>
                <p><strong>Director:</strong> ${movie.Director}</p>
                <p><strong>Writer:</strong> ${movie.Writer}</p>
                <p><strong>Actors:</strong> ${movie.Actors}</p>
                <p><strong>Plot:</strong> ${movie.Plot}</p>
                <p><strong>IMDb Rating:</strong> ${movie.imdbRating} / 10</p>
                <button class="favorite-btn gradient-btn" title="Add to favorites">${isFavorite ? '❤️ Added to Favorites' : '🤍 Add to Favorites'}</button>
                
                <div class="rating-section">
                    <h3>Your Rating</h3>
                    <div class="stars">
                        ${[1, 2, 3, 4, 5].map(i => `<span class="star" data-value="${i}">&#9733;</span>`).join('')}
                    </div>
                </div>

                <div class="review-section">
                    <h3>Your Review</h3>
                    <textarea id="review-text" placeholder="Write your review...">${userReview}</textarea>
                    <button id="save-review-btn" class="gradient-btn">Save Review</button>
                </div>
            </div>
        `;

        // Add event listeners for modal content
        modalBody.querySelector('.favorite-btn').addEventListener('click', () => toggleFavorite(movie));
        modalBody.querySelector('#save-review-btn').addEventListener('click', () => saveReview(movie.imdbID));
        
        const stars = modalBody.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', () => setRating(movie.imdbID, star.dataset.value));
            star.addEventListener('mouseover', () => highlightStars(star.dataset.value));
            star.addEventListener('mouseout', () => highlightStars(state.ratings[movie.imdbID] || 0));
        });
        highlightStars(userRating);
    }

    // --- State Management & Local Storage ---

    function toggleFavorite(movie) {
        const movieIndex = state.favorites.findIndex(fav => fav.imdbID === movie.imdbID);
        const favBtn = modalBody.querySelector('.favorite-btn');

        if (movieIndex > -1) {
            state.favorites.splice(movieIndex, 1); // Remove from favorites
            favBtn.innerHTML = '🤍 Add to Favorites';
        } else {
            // Add only necessary info to favorites to keep localStorage light
            state.favorites.push({
                imdbID: movie.imdbID,
                Title: movie.Title,
                Year: movie.Year,
                Poster: movie.Poster
            });
            favBtn.innerHTML = '❤️ Added to Favorites';
        }
        localStorage.setItem('favorites', JSON.stringify(state.favorites));

        // If in favorites view, re-render the list
        if (state.currentView === 'favorites') {
            showFavorites({ preventDefault: () => {} });
        }
    }

    function setRating(imdbID, rating) {
        state.ratings[imdbID] = parseInt(rating, 10);
        localStorage.setItem('ratings', JSON.stringify(state.ratings));
        highlightStars(rating);
    }

    function highlightStars(rating) {
        const stars = modalBody.querySelectorAll('.star');
        stars.forEach(star => {
            star.classList.toggle('rated', star.dataset.value <= rating);
        });
    }

    function saveReview(imdbID) {
        const reviewText = modalBody.querySelector('#review-text').value;
        state.reviews[imdbID] = reviewText;
        localStorage.setItem('reviews', JSON.stringify(state.reviews));
        alert('Review saved!');
    }

    function setActiveLink(activeLink) {
        [homeLink, favoritesLink].forEach(link => link.classList.remove('active'));
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // --- Theme Toggle ---

    /**
     * Theme toggle functionality.
     */
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    function toggleTheme() {
        body.classList.toggle('light-mode');
        const isLightMode = body.classList.contains('light-mode');
        localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
        themeToggle.textContent = isLightMode ? '🌙' : '☀️';
    }

    themeToggle.addEventListener('click', toggleTheme);

    // --- Initial Load ---
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeToggle.textContent = '🌙';
    } else {
        themeToggle.textContent = '☀️';
    }

    showHome(); // Initialize the app on the home view
});