// script.js

// --- DOM Elements ---
const landingScreen = document.getElementById('landing-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');

const startQuizBtn = document.getElementById('start-quiz-btn');
const restartQuizBtn = document.getElementById('restart-quiz-btn');
const darkModeToggle = document.getElementById('dark-mode-toggle');

const questionText = document.getElementById('question-text');
const questionContainer = document.querySelector('.question-container');
const answerButtonsContainer = document.getElementById('answer-buttons');
const progressBar = document.getElementById('progress-bar');
const timerDisplay = document.getElementById('timer-display');

const finalScoreSpan = document.getElementById('final-score');
const totalQuestionsSpan = document.getElementById('total-questions');
const scorePercentageSpan = document.getElementById('score-percentage');
const scoreCircle = document.getElementById('score-circle');
const feedbackList = document.getElementById('feedback-list');
const highScoresList = document.getElementById('high-scores-list');

const categorySelect = document.getElementById('category-select');
const difficultySelect = document.getElementById('difficulty-select');
const apiStatus = document.getElementById('api-status');

// --- Quiz State Variables ---
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft;
const QUESTION_TIME_LIMIT = 20; // seconds per question
const MAX_HIGH_SCORES = 5;

/**
 * Shuffles an array in place using the Fisher-Yates (Knuth) algorithm.
 * @param {Array} array The array to shuffle.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Decodes HTML entities in a string.
 * @param {string} html The string containing HTML entities.
 * @returns {string} The decoded string.
 */
function decodeHtml(html) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
}

/**
 * Shows a specific screen and hides others.
 * @param {HTMLElement} screenToShow The screen element to make active.
 */
function showScreen(screenToShow) {
    [landingScreen, quizScreen, resultsScreen].forEach(screen => {
        screen.classList.remove('active');
    });
    screenToShow.classList.add('active');
}

// --- Quiz Logic ---

/**
 * Fetches questions from the Open Trivia DB API.
 * @param {string} categoryId The ID of the category (optional).
 * @param {string} difficulty The difficulty level (easy, medium, hard, optional).
 * @returns {Promise<Array>} A promise that resolves to an array of formatted questions.
 */
async function fetchQuestionsFromAPI(categoryId, difficulty) {
    let url = 'https://opentdb.com/api.php?amount=10&type=multiple'; // Default 10 questions
    if (categoryId) {
        url += `&category=${categoryId}`;
    }
    if (difficulty) {
        url += `&difficulty=${difficulty}`;
    }

    try {
        apiStatus.textContent = 'Loading questions from Open Trivia DB...';
        apiStatus.style.color = 'var(--light-text-color)';
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.response_code === 0 && data.results.length > 0) {
            apiStatus.textContent = `Successfully loaded ${data.results.length} questions.`;
            apiStatus.style.color = 'var(--correct-color)';
            return data.results.map(q => {
                const answers = [...q.incorrect_answers, q.correct_answer];
                shuffleArray(answers); // Shuffle answers for each question
                return {
                    question: decodeHtml(q.question),
                    answers: answers.map(ans => ({
                        text: decodeHtml(ans),
                        correct: decodeHtml(ans) === decodeHtml(q.correct_answer)
                    })),
                    correctAnswerText: decodeHtml(q.correct_answer) // Store for results summary
                };
            });
        } else if (data.response_code === 1) {
            apiStatus.textContent = 'Not enough questions for selected criteria. Please try different settings.';
            apiStatus.style.color = 'var(--incorrect-color)';
            return []; // No fallback, return empty array
        } else {
            throw new Error(`API response code: ${data.response_code}`);
        }
    } catch (error) {
        console.error('Error fetching questions from API:', error);
        apiStatus.textContent = 'Failed to load questions from API. Please check your internet connection or try again.';
        apiStatus.style.color = 'var(--incorrect-color)';
        return []; // No fallback, return empty array
    }
}

/**
 * Starts the quiz: loads questions, initializes state, and displays the first question.
 */
async function startQuiz() {
    score = 0;
    currentQuestionIndex = 0;
    feedbackList.innerHTML = ''; // Clear previous feedback

    const selectedCategory = categorySelect.value;
    const selectedDifficulty = difficultySelect.value;

    currentQuestions = await fetchQuestionsFromAPI(selectedCategory, selectedDifficulty);
    // If no questions are loaded from API, stay on landing screen and show error
    if (currentQuestions.length === 0) {
        showScreen(landingScreen); // Stay on landing screen
        apiStatus.textContent = 'Could not load questions with the selected criteria. Please try again.';
        apiStatus.style.color = 'var(--warning-color)';
        return; // Stop quiz initiation
    }
    shuffleArray(currentQuestions); // Shuffle the questions themselves

    showScreen(quizScreen);
    displayQuestion();
}

/**
 * Displays the current question and its answer options.
 */
function displayQuestion() {
    resetState(); // Reset timer and buttons

    // Animate in the new question
    questionContainer.classList.remove('exiting');
    questionContainer.classList.add('entering');
    setTimeout(() => {
        questionContainer.classList.remove('entering');
    }, 400);

    const question = currentQuestions[currentQuestionIndex];

    questionText.textContent = question.question;

    question.answers.forEach(answer => {
        const button = document.createElement('button');
        button.textContent = answer.text;
        button.classList.add('btn', 'answer-btn');
        if (answer.correct) {
            button.dataset.correct = true;
        }
        button.addEventListener('click', selectAnswer);
        answerButtonsContainer.appendChild(button);
    });

    startTimer();
}

/**
 * Resets the UI state for a new question.
 */
function resetState() {
    stopTimer();
    timerDisplay.textContent = `${QUESTION_TIME_LIMIT}s`;
    progressBar.style.width = '100%';
    progressBar.style.backgroundColor = 'var(--timer-color)';

    while (answerButtonsContainer.firstChild) {
        answerButtonsContainer.removeChild(answerButtonsContainer.firstChild);
    }
}

/**
 * Handles an answer selection.
 * @param {Event} event The click event from an answer button.
 */
function selectAnswer(event) {
    stopTimer();
    const selectedButton = event.target;
    const isCorrect = selectedButton.dataset.correct === 'true';

    // Provide instant feedback
    Array.from(answerButtonsContainer.children).forEach(button => {
        if (button.dataset.correct === 'true') {
            button.classList.add('correct');
        } else if (button === selectedButton && !isCorrect) {
            button.classList.add('incorrect');
        }
        button.removeEventListener('click', selectAnswer); // Disable further clicks
        button.style.pointerEvents = 'none'; // Ensure no more clicks
    });

    if (isCorrect) {
        score++;
    }

    // Record for results summary
    const question = currentQuestions[currentQuestionIndex];
    const feedbackItem = {
        question: question.question,
        selectedAnswer: selectedButton.textContent,
        correctAnswer: question.correctAnswerText || question.answers.find(a => a.correct).text,
        isCorrect: isCorrect
    };
    question.feedback = feedbackItem; // Attach feedback to the question object

    // Move to next question after a short delay
    questionContainer.classList.add('exiting');
    setTimeout(() => {
        // This timeout should be slightly longer than the animation duration
        // to allow the fade-out to complete before loading the next content.
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestions.length) {
            displayQuestion();
        } else {
            endQuiz();
        }
    }, 1200); // Increased delay to allow for exit animation + feedback view
}

/**
 * Starts the countdown timer for the current question.
 */
function startTimer() {
    timeLeft = QUESTION_TIME_LIMIT;
    timerDisplay.textContent = `${timeLeft}s`;
    progressBar.style.width = '100%';
    progressBar.style.transition = `width ${QUESTION_TIME_LIMIT}s linear`;

    // Trigger reflow to ensure transition restarts
    void progressBar.offsetWidth;
    progressBar.style.width = '0%';

    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `${timeLeft}s`;

        if (timeLeft <= 5) {
            progressBar.style.backgroundColor = 'var(--incorrect-color)'; // Red for last 5 seconds
        } else {
            progressBar.style.backgroundColor = 'var(--timer-color)';
        }

        if (timeLeft <= 0) {
            clearInterval(timer);
            // Simulate selecting an incorrect answer if time runs out
            const question = currentQuestions[currentQuestionIndex];
            const feedbackItem = {
                question: question.question,
                selectedAnswer: "Time's up!",
                correctAnswer: question.correctAnswerText || question.answers.find(a => a.correct).text,
                isCorrect: false
            };
            question.feedback = feedbackItem;

            // Highlight correct answer
            Array.from(answerButtonsContainer.children).forEach(button => {
                if (button.dataset.correct === 'true') {
                    button.classList.add('correct');
                }
                button.removeEventListener('click', selectAnswer);
                button.style.pointerEvents = 'none';
            });

            questionContainer.classList.add('exiting');
            setTimeout(() => {
                currentQuestionIndex++;
                if (currentQuestionIndex < currentQuestions.length) {
                    displayQuestion();
                } else {
                    endQuiz();
                }
            }, 1200); // 1 second delay
        }
    }, 1000);
}

/**
 * Stops the current timer.
 */
function stopTimer() {
    clearInterval(timer);
    progressBar.style.transition = 'none'; // Stop current animation
}

/**
 * Ends the quiz, displays results, and saves high score.
 */
function endQuiz() {
    stopTimer();
    showScreen(resultsScreen);

    finalScoreSpan.textContent = score;
    totalQuestionsSpan.textContent = currentQuestions.length;
    const percentage = currentQuestions.length > 0 ? ((score / currentQuestions.length) * 100).toFixed(0) : 0;
    scorePercentageSpan.textContent = `${percentage}%`;

    // Animate the score circle
    const angle = (percentage / 100) * 360;
    scoreCircle.style.background = `conic-gradient(var(--correct-color) ${angle}deg, var(--progress-bg) ${angle}deg 360deg)`;

    displayFeedbackSummary();
    saveHighScore(score, currentQuestions.length);
    loadHighScores(); // Reload high scores to show the new one

    if (percentage >= 80) {
        triggerConfetti();
    }
}

/**
 * Displays a summary of correct/incorrect answers.
 */
function displayFeedbackSummary() {
    feedbackList.innerHTML = '';
    currentQuestions.forEach(q => {
        const li = document.createElement('li');
        const feedback = q.feedback;
        const icon = document.createElement('span');
        icon.classList.add('icon');

        li.classList.add(feedback.isCorrect ? 'correct-answer' : 'incorrect-answer');
        icon.textContent = feedback.isCorrect ? '✅' : '❌';

        li.appendChild(icon);
        let feedbackHTML = `<strong>${q.question}</strong><br>Your Answer: ${feedback.selectedAnswer}`;
        if (!feedback.isCorrect) {
            feedbackHTML += `<br>Correct Answer: ${feedback.correctAnswer}`;
        }
        li.innerHTML += feedbackHTML;
        feedbackList.appendChild(li);
    });
}

/**
 * Restarts the quiz by returning to the landing screen.
 */
function restartQuiz() {
    showScreen(landingScreen);
    apiStatus.textContent = ''; // Clear API status
    // Reset selections for next quiz
    categorySelect.value = '';
    difficultySelect.value = '';
}

// --- High Score Logic ---

/**
 * Loads high scores from localStorage.
 * @returns {Array<Object>} An array of high score objects.
 */
function loadHighScores() {
    const highScores = JSON.parse(localStorage.getItem('quizHighScores')) || [];
    highScoresList.innerHTML = '';
    if (highScores.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No high scores yet!';
        highScoresList.appendChild(li);
        return;
    }

    highScores.sort((a, b) => b.score - a.score); // Sort descending
    highScores.slice(0, MAX_HIGH_SCORES).forEach((entry, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${index + 1}. Score: ${entry.score}</span> <span>${entry.percentage}%</span>`;
        highScoresList.appendChild(li);
    });
    return highScores;
}

/**
 * Saves a new score to localStorage if it's a high score.
 * @param {number} newScore The score achieved in the current quiz.
 * @param {number} totalQs The total number of questions.
 */
function saveHighScore(newScore, totalQs) {
    const highScores = loadHighScores(); // Load existing scores
    const percentage = totalQs > 0 ? ((newScore / totalQs) * 100).toFixed(0) : 0;

    const newHighScoreEntry = {
        score: newScore,
        totalQuestions: totalQs,
        percentage: percentage
    };

    // Add new score and keep only top MAX_HIGH_SCORES
    highScores.push(newHighScoreEntry);
    highScores.sort((a, b) => b.score - a.score); // Sort descending
    highScores.splice(MAX_HIGH_SCORES); // Keep only the top N scores

    localStorage.setItem('quizHighScores', JSON.stringify(highScores));
}

// --- Dark Mode Toggle ---
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    // Save preference to localStorage
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled');
    }
}

// --- Confetti Effect ---
function triggerConfetti() {
    const confettiCount = 100;
    const quizContainer = document.querySelector('.quiz-container');

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800'];
        
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.animationDelay = `${Math.random() * 3}s`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

        quizContainer.appendChild(confetti);

        // Remove confetti element after animation ends to prevent clutter
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// --- Event Listeners ---
startQuizBtn.addEventListener('click', startQuiz);
restartQuizBtn.addEventListener('click', restartQuiz);
darkModeToggle.addEventListener('click', toggleDarkMode);

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    showScreen(landingScreen);
    loadHighScores(); // Display high scores on landing
    // Check for dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});
