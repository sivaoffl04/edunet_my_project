// Configuration
// Get your Edamam API credentials from https://developer.edamam.com/edamam-recipe-api
const EDAMAM_APP_ID = 'yourid'; // Replace with your actual App ID
const EDAMAM_APP_KEY = 'yourAPI87d40f36502391e08660cb'; // Replace with your actual App Key

// Edamam API endpoints:
// Search by recipe name: https://api.edamam.com/api/recipes/v2?type=public&q=${query}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}
// Search by ingredients: https://api.edamam.com/api/recipes/v2?type=public&q=${ingredients}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}



// DOM Elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const clearButton = document.getElementById('clear-button');
const favoritesButton = document.getElementById('favorites-button');
const recipesContainer = document.getElementById('recipes-container');
const favoritesView = document.getElementById('favorites-view');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');

// State
let currentView = 'search'; // 'search' or 'favorites'
let favorites = JSON.parse(localStorage.getItem('recipeFavorites')) || [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadLastSearch();
  loadFavorites();

  // Event listeners
  searchForm.addEventListener('submit', handleSearch);
  favoritesButton.addEventListener('click', toggleFavoritesView);
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  clearButton.addEventListener('click', clearSearch);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
});

function loadLastSearch() {
  // Removed localStorage usage as per user request
}

function saveLastSearch(query) {
  // Removed localStorage usage as per user request
}

function handleSearch(e) {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  // Show loading indicator
  showLoadingIndicator();

  saveLastSearch(query);
  currentView = 'search';
  favoritesView.classList.add('hidden');
  recipesContainer.classList.remove('hidden');

  // Always search by name only since ingredient search is removed
  searchByName(query);
}

// Search recipes by name using Edamam API
async function searchByName(query) {
  try {
    const response = await fetch(`https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(query)}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`);
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    renderRecipes(data.hits.map(hit => hit.recipe));
  } catch (error) {
    console.error('Error fetching recipes:', error);
    // No fallback data - app only works online
    renderRecipes([]);
  }
}



// Render recipes in the grid
function renderRecipes(recipes) {
  // Hide loading indicator
  hideLoadingIndicator();

  const container = currentView === 'favorites' ? favoritesView : recipesContainer;
  container.innerHTML = '';

  if (recipes.length === 0) {
    container.innerHTML = '<p>No recipes found. Try a different search.</p>';
    return;
  }

  recipes.forEach(recipe => {
    const card = createRecipeCard(recipe);
    container.appendChild(card);
  });
}

// Create a recipe card element
function createRecipeCard(recipe) {
  const card = document.createElement('article');
  card.className = 'recipe-card';
  card.setAttribute('tabindex', '0');

  const isFavorited = favorites.some(fav => fav.url === recipe.url);

  const cuisineType = recipe.cuisineType && recipe.cuisineType.length > 0 ? recipe.cuisineType.join(', ') : '';
  const mealType = recipe.mealType && recipe.mealType.length > 0 ? recipe.mealType.join(', ') : '';
  const summaryText = [cuisineType, mealType].filter(Boolean).join(' ') || 'Recipe details not available';
  const prepTime = recipe.totalTime ? `${recipe.totalTime} mins` : 'Prep time not specified';

  card.innerHTML = `
    <img src="${recipe.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${recipe.label || 'Recipe'}" class="recipe-image" loading="lazy">
    <div class="recipe-content">
      <h3 class="recipe-title">${recipe.label || 'Untitled Recipe'}</h3>
      <p class="recipe-summary">${summaryText}</p>
      <p class="recipe-time">${prepTime}</p>
      <div class="recipe-actions">
        <button class="view-button" data-recipe='${JSON.stringify(recipe).replace(/'/g, "&apos;")}'>View Recipe</button>
        <button class="favorite-button ${isFavorited ? 'favorited' : ''}" data-url="${recipe.url || '#'}" aria-label="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}">
          ${isFavorited ? '❤️' : '🤍'}
        </button>
      </div>
    </div>
  `;

  // Event listeners for card interactions
  card.querySelector('.view-button').addEventListener('click', (e) => {
    e.stopPropagation();
    const recipeData = JSON.parse(e.target.dataset.recipe.replace(/&apos;/g, "'"));
    openModal(recipeData);
  });

  card.querySelector('.favorite-button').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(recipe.url, recipe);
  });

  card.addEventListener('click', () => {
    openModal(recipe);
  });

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(recipe);
    }
  });

  return card;
}

function openModal(recipe) {
  document.getElementById('modal-title').textContent = recipe.label || 'Untitled Recipe';
  document.getElementById('modal-image').src = recipe.image || 'https://via.placeholder.com/400x300?text=No+Image';
  document.getElementById('modal-image').alt = recipe.label || 'Recipe';

  const cuisineType = recipe.cuisineType && recipe.cuisineType.length > 0 ? recipe.cuisineType.join(', ') : '';
  const mealType = recipe.mealType && recipe.mealType.length > 0 ? recipe.mealType.join(', ') : '';
  const serves = recipe.yield ? `Serves ${recipe.yield}` : 'Serving size not specified';
  const calories = recipe.calories ? `${Math.round(recipe.calories)} calories` : 'Calories not available';
  const summaryParts = [cuisineType, mealType, serves, calories].filter(Boolean);
  document.getElementById('modal-summary').textContent = summaryParts.join(' - ') || 'Recipe information not available';

  // Ingredients
  const ingredientsList = document.querySelector('#modal-ingredients ul');
  ingredientsList.innerHTML = '';
  if (recipe.ingredientLines && recipe.ingredientLines.length > 0) {
    recipe.ingredientLines.forEach(ingredient => {
      const li = document.createElement('li');
      li.textContent = ingredient;
      ingredientsList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'Ingredients not available';
    li.style.fontStyle = 'italic';
    ingredientsList.appendChild(li);
  }

  // Nutrition
  const nutritionList = document.querySelector('#modal-nutrition ul');
  nutritionList.innerHTML = '';
  if (recipe.digest && recipe.digest.length > 0) {
    recipe.digest.slice(0, 5).forEach(nutrient => {
      const li = document.createElement('li');
      li.textContent = `${nutrient.label}: ${Math.round(nutrient.total)}${nutrient.unit}`;
      nutritionList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'Nutrition information not available';
    li.style.fontStyle = 'italic';
    nutritionList.appendChild(li);
  }

  // Preparation Steps
  const stepsSection = document.getElementById('modal-steps');
  const stepsList = stepsSection.querySelector('ol');
  stepsList.innerHTML = '';
  if (recipe.preparationSteps && recipe.preparationSteps.length > 0) {
    recipe.preparationSteps.forEach(step => {
      const li = document.createElement('li');
      li.textContent = step;
      stepsList.appendChild(li);
    });
    stepsSection.classList.remove('hidden');
  } else {
    stepsSection.classList.add('hidden');
  }

  // Source link
  document.getElementById('modal-source-link').href = recipe.url || '#';
  document.getElementById('modal-source-link').textContent = recipe.url ? 'View Original Recipe' : 'Source not available';

  modal.classList.remove('hidden');
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// Close recipe modal
function closeModal() {
  modal.classList.remove('show');
  modal.classList.add('hidden');
  document.body.style.overflow = 'auto';
}

// Toggle favorite status for a recipe
function toggleFavorite(recipeUrl, recipeData) {
  const index = favorites.findIndex(fav => fav.url === recipeUrl);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(recipeData);
  }
  localStorage.setItem('recipeFavorites', JSON.stringify(favorites));
  loadFavorites();

  // Update button state in current view
  const button = document.querySelector(`.favorite-button[data-url="${recipeUrl}"]`);
  if (button) {
    const isFavorited = favorites.some(fav => fav.url === recipeUrl);
    button.classList.toggle('favorited', isFavorited);
    button.innerHTML = isFavorited ? '❤️' : '🤍';
    button.setAttribute('aria-label', isFavorited ? 'Remove from favorites' : 'Add to favorites');
  }
}

// Load and display favorite recipes
function loadFavorites() {
  if (currentView === 'favorites') {
    renderRecipes(favorites);
  }
}

// Toggle between search and favorites view
function toggleFavoritesView() {
  currentView = currentView === 'search' ? 'favorites' : 'search';

  if (currentView === 'favorites') {
    recipesContainer.classList.add('hidden');
    favoritesView.classList.remove('hidden');
    favoritesButton.textContent = 'Back to Search 🔍';
    loadFavorites();
  } else {
    favoritesView.classList.add('hidden');
    recipesContainer.classList.remove('hidden');
    favoritesButton.textContent = 'Favorites ❤️';
  }
}

// Clear search input
function clearSearch() {
  searchInput.value = '';
}

// Show loading indicator
function showLoadingIndicator() {
  const loadingElement = document.createElement('div');
  loadingElement.className = 'loading';
  loadingElement.id = 'loading-indicator';
  loadingElement.textContent = 'Searching for recipes...';
  recipesContainer.innerHTML = '';
  recipesContainer.appendChild(loadingElement);
}

// Hide loading indicator
function hideLoadingIndicator() {
  const loadingElement = document.getElementById('loading-indicator');
  if (loadingElement) {
    loadingElement.remove();
  }
}
