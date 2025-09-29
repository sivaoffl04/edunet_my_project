# SivaMovieFlix - Movie Review & Rating Platform

SivaMovieFlix is a sleek, modern web application that allows users to search for movies, view detailed information, and keep a personal log of their favorite films, ratings, and reviews. Built with vanilla JavaScript, HTML, and CSS, it features a responsive, glassmorphism-inspired UI with light and dark modes.

## ✨ Features

- **Movie Search**: Dynamically search for movies using the OMDB API.
- **Category Browsing**: Discover movies through predefined genre categories on the home page.
- **Detailed View**: Click on any movie to open a modal with comprehensive details, including plot, actors, director, and IMDb rating.
- **Favorites List**: Add or remove movies from a personal "Favorites" list.
- **Personal Ratings**: Rate movies on a 5-star scale.
- **Personal Reviews**: Write and save text reviews for any movie.
- **Local Storage Persistence**: Your favorites, ratings, and reviews are saved in your browser's local storage, so they persist between sessions.
- **Responsive Design**: The layout is fully responsive and works seamlessly on desktops, tablets, and mobile devices.
- **Theme Toggle**: Switch between a light and dark theme for comfortable viewing.
- **Modern UI/UX**:
  - A "glassmorphism" sticky navigation bar.
  - Smooth animations and transitions.
  - Gradient buttons and hover effects for an interactive experience.
  - Scroll-reveal animations for movie cards.

## 🛠️ Technologies Used

- **Frontend**:
  - HTML5
  - CSS3 (Flexbox, Grid, Custom Properties, Animations)
  - Vanilla JavaScript (ES6+, Async/Await, Fetch API)
- **API**:
  - [OMDB API](https://www.omdbapi.com/) for fetching movie data.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need a modern web browser that supports JavaScript, such as Chrome, Firefox, or Edge.

### Installation

1. **Get a free API Key** from [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx).
2. Clone the repository:
    sh
    git clone <https://github.com/your-username/movieflix.git>
3. Navigate to the project directory:
    sh
    cd movieflix
4. Open `script.js` in a text editor and replace the placeholder API key with your own:
    javascript
    // In script.js
    const API_KEY = 'YOUR_API_KEY_HERE';
5. Open `index.html` in your web browser.

That's it! You can now start searching for movies.

## usage How to Use

1. **Homepage**: When you first open the app, you will see a list of movie categories. Click any category to see movies of that genre.
2. **Search**: Use the search bar in the header to type the name of a movie you're looking for and press Enter or click the search button.
3. **View Details**: Click the "More Info" button on any movie card to open a detailed modal view.
4. **Add to Favorites**: In the modal, click the "🤍 Add to Favorites" button to save a movie to your list. The button will change to "❤️ Added to Favorites".
5. **Rate a Movie**: In the modal, hover over the stars and click to set your personal rating.
6. **Write a Review**: Type your thoughts in the "Your Review" text area and click "Save Review".
7. **View Favorites**: Click the "Favorites" link in the navigation bar to see all the movies you've saved.
8. **Change Theme**: Click the ☀️/🌙 icon in the header to toggle between light and dark modes.

## 📂 File Structure

The project is organized into three main files:
.
├── index.html      # The main HTML structure of the application
├── style.css       # All CSS styles for layout, theme, and responsiveness
└── script.js       # JavaScript for API calls, DOM manipulation, and event handling

---

This project was created as a demonstration of modern frontend development techniques using vanilla technologies.
