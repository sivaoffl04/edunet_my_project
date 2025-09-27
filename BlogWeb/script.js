/**
 * Modern Blog Website JavaScript
 * Handles theme switching, modal functionality, scroll animations, and dynamic content loading
 */

// DOM elements
const themeToggle = document.getElementById('themeToggle');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalContent = document.getElementById('modalContent');
const blogGrid = document.getElementById('blogGrid');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');

// Global state
let currentTheme = localStorage.getItem('theme') || 'light';
let isModalOpen = false;

/**
 * Initialize the application
 */
function init() {
    initTheme();
    loadBlogPosts();
    initEventListeners();
    initScrollAnimations();
    
    console.log('Blog website initialized successfully');
}

/**
 * Theme Management
 */
function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeToggleIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeToggleIcon();
    
    // Add smooth transition effect
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

function updateThemeToggleIcon() {
    const icon = themeToggle.querySelector('.theme-toggle-icon');
    icon.textContent = currentTheme === 'light' ? '🌙' : '☀️';
}

/**
 * Blog Posts Management
 */
function loadBlogPosts() {
    try {
        if (typeof blogPosts === 'undefined') {
            console.error('Blog posts data not found');
            showError('Failed to load blog posts');
            return;
        }

        renderBlogPosts(blogPosts);
        
        // Trigger scroll animations after content is loaded
        setTimeout(() => {
            observeScrollAnimations();
        }, 100);
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        showError('Failed to load blog posts');
    }
}

function renderBlogPosts(posts) {
    if (!posts || posts.length === 0) {
        blogGrid.innerHTML = '<div class="loading">No blog posts available</div>';
        return;
    }

    const postsHTML = posts.map((post, index) => `
        <article class="blog-card fade-in-up" 
                 data-post-id="${post.id}" 
                 style="animation-delay: ${index * 0.1}s"
                 role="button" 
                 tabindex="0"
                 aria-label="Read article: ${post.title}">
            <img src="${post.image}" 
                 alt="${post.title}" 
                 class="blog-card-image"
                 loading="lazy">
            
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <span class="blog-card-date">
                        📅 ${formatDate(post.date)}
                    </span>
                    <span class="blog-card-category">${post.category}</span>
                </div>
                
                <h3 class="blog-card-title">${post.title}</h3>
                <p class="blog-card-excerpt">${post.excerpt}</p>
                
                <div class="blog-card-footer">
                    <button class="read-more-btn" aria-label="Read more about ${post.title}">
                        Read More
                    </button>
                </div>
            </div>
        </article>
    `).join('');

    blogGrid.innerHTML = postsHTML;
    
    // Add click listeners to blog cards
    document.querySelectorAll('.blog-card').forEach(card => {
        card.addEventListener('click', handleBlogCardClick);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleBlogCardClick(e);
            }
        });
    });
}

function handleBlogCardClick(event) {
    const card = event.currentTarget;
    const postId = parseInt(card.getAttribute('data-post-id'));
    const post = blogPosts.find(p => p.id === postId);
    
    if (post) {
        openModal(post);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Modal Management
 */
function openModal(post) {
    if (isModalOpen) return;
    
    isModalOpen = true;
    
    // Render modal content
    modalContent.innerHTML = `
        <h1 class="modal-title">${post.title}</h1>
        
        <div class="modal-meta">
            <span>📅 ${formatDate(post.date)}</span>
            <span class="blog-card-category">${post.category}</span>
            <span>⏱️ ${post.readTime || '5 min read'}</span>
        </div>
        
        <img src="${post.image}" 
             alt="${post.title}" 
             class="modal-image"
             loading="lazy">
        
        <div class="modal-text">
            ${post.content ? post.content.split('\n').map(p => `<p>${p}</p>`).join('') : `<p>${post.excerpt}</p>`}
        </div>
    `;
    
    // Show modal with animation
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus management for accessibility
    modalClose.focus();
    
    // Track modal open event
    console.log(`Modal opened for post: ${post.title}`);
}

function closeModal() {
    if (!isModalOpen) return;
    
    isModalOpen = false;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    
    // Clear modal content after animation
    setTimeout(() => {
        modalContent.innerHTML = '';
    }, 300);
    
    console.log('Modal closed');
}

/**
 * Scroll Animations
 */
function initScrollAnimations() {
    // Create intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    
    // Store observer globally for later use
    window.scrollObserver = observer;
}

function observeScrollAnimations() {
    const elementsToAnimate = document.querySelectorAll('.fade-in-up');
    
    elementsToAnimate.forEach(element => {
        if (window.scrollObserver) {
            window.scrollObserver.observe(element);
        }
    });
}

function handleIntersection(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Stop observing once animated
            if (window.scrollObserver) {
                window.scrollObserver.unobserve(entry.target);
            }
        }
    });
}

/**
 * Event Listeners
 */
function initEventListeners() {
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Modal controls
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isModalOpen) {
            closeModal();
        }
    });
    
    // Mobile menu (placeholder for future implementation)
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            console.log('Mobile menu clicked - feature to be implemented');
        });
    }
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Window resize handler for responsive adjustments
    window.addEventListener('resize', debounce(handleWindowResize, 250));
}

/**
 * Utility Functions
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function handleWindowResize() {
    // Handle any responsive adjustments if needed
    console.log('Window resized');
}

function showError(message) {
    blogGrid.innerHTML = `
        <div class="error-message" style="
            text-align: center; 
            padding: 2rem; 
            color: var(--error); 
            font-size: var(--font-size-lg);
            background: var(--bg-secondary);
            border-radius: var(--radius-lg);
            margin: 2rem 0;
        ">
            <p>⚠️ ${message}</p>
            <button onclick="location.reload()" style="
                margin-top: 1rem;
                padding: 0.5rem 1rem;
                background: var(--primary);
                color: white;
                border: none;
                border-radius: var(--radius-sm);
                cursor: pointer;
            ">Retry</button>
        </div>
    `;
}

/**
 * Performance Optimization
 */
// Preload critical images
function preloadImages() {
    if (typeof blogPosts !== 'undefined') {
        blogPosts.slice(0, 3).forEach(post => {
            const img = new Image();
            img.src = post.image;
        });
    }
}

/**
 * Initialize when DOM is loaded
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Preload images after initialization
setTimeout(preloadImages, 1000);

/**
 * Service Worker Registration (optional for future PWA features)
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker registration can be added here for PWA features
        console.log('Service Worker support detected');
    });
}

// Export functions for testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleTheme,
        openModal,
        closeModal,
        formatDate
    };
}