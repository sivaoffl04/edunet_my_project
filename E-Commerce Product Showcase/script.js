/**
 * Modern Product Gallery - JavaScript
 * Features: Responsive grid, smooth animations, modal functionality, filtering
 */

// Product data with high-quality images
const products = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: "30,000 RS",
    category: "electronics",
    image: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Experience exceptional sound quality with our premium wireless headphones. Featuring active noise cancellation, 30-hour battery life, and premium materials for ultimate comfort during extended listening sessions."
  },
  {
    id: 2,
    name: "Smartphone Pro Max 256GB",
    price: "1,20,000 RS",
    category: "electronics",
    image: "https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "The latest flagship smartphone with cutting-edge technology. Features a stunning 6.7-inch Super Retina display, advanced triple-camera system, and lightning-fast A16 Bionic chip for unparalleled performance."
  },
  {
    id: 3,
    name: "Designer Leather Jacket",
    price: "40,000 RS",
    category: "fashion",
    image: "https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Handcrafted from premium Italian leather, this designer jacket combines timeless style with modern sophistication. Perfect for both casual and formal occasions, featuring a tailored fit and attention to detail."
  },
  {
    id: 4,
    name: "Artisan Coffee Collection",
    price: "23,000 RS",
    category: "food",
    image: "https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Discover our carefully curated collection of single-origin coffee beans from the world's finest coffee regions. Each blend is roasted to perfection, delivering rich flavors and aromatic experiences."
  },
  {
    id: 5,
    name: "Luxury Swiss Watch",
    price: "90,000 RS",
    category: "fashion",
    image: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Precision-engineered Swiss timepiece featuring automatic movement, sapphire crystal glass, and water resistance up to 100m. A perfect blend of traditional craftsmanship and contemporary design."
  },
  {
    id: 6,
    name: "Gaming Laptop RTX 4080",
    price: "4,00,000 RS",
    category: "electronics",
    image: "https://assets-prd.ignimgs.com/2023/07/03/alienwarem15r7-1688414072544.jpg",
    description: "Ultimate gaming performance with NVIDIA RTX 4080 graphics, Intel i9 processor, and 32GB RAM. Features a 17-inch 4K display with 144Hz refresh rate for immersive gaming and content creation."
  },
  {
    id: 7,
    name: "Gourmet Chocolate Box",
    price: "15,000 RS",
    category: "food",
    image: "https://images.pexels.com/photos/918327/pexels-photo-918327.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Indulge in our premium chocolate collection featuring 24 handcrafted pieces. Made with finest Belgian cocoa and exotic ingredients, each chocolate offers a unique flavor journey for the discerning palate."
  },
  {
    id: 8,
    name: "Limited Edition Sneakers",
    price: "25,000 RS",
    category: "fashion",
    image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Exclusive limited edition sneakers combining street style with premium comfort. Features innovative cushioning technology, sustainable materials, and a design that makes a statement wherever you go."
  },
  {
    id: 9,
    name: "Smart Home Hub Pro",
    price: "18,000 RS",
    category: "electronics",
    image: "https://images.pexels.com/photos/4790268/pexels-photo-4790268.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Control your entire smart home ecosystem with voice commands and intuitive touch controls. Compatible with all major smart home devices, featuring premium audio quality and AI-powered automation."
  },
  {
    id: 10,
    name: "Premium Tea Collection",
    price: "12,000 RS",
    category: "food",
    image: "https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Explore the world of fine teas with our curated collection of 12 premium blends. From delicate white teas to robust black teas, each variety is sourced from renowned tea gardens worldwide."
  },
  {
    id: 11,
    name: "Silk Designer Scarf",
    price: "8,000 RS",
    category: "fashion",
    image: "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Luxurious 100% mulberry silk scarf featuring an exclusive hand-painted design. This versatile accessory adds elegance to any outfit while showcasing artistic craftsmanship and premium quality."
  },
  {
    id: 12,
    name: "Wireless Charging Station",
    price: "5,000 RS",
    category: "electronics",
    image: "https://images.pexels.com/photos/4526414/pexels-photo-4526414.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Sleek 3-in-1 wireless charging station for smartphone, smartwatch, and earbuds. Features fast charging technology, LED indicators, and a minimalist design that complements any modern workspace."
  }
];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const modalOverlay = document.getElementById('modalOverlay');
const productModal = document.getElementById('productModal');
const modalClose = document.getElementById('modalClose');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const modalDescription = document.getElementById('modalDescription');
const loadingOverlay = document.getElementById('loadingOverlay');

// State management
let currentFilter = 'all';
let isModalOpen = false;

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

/**
 * Main initialization function
 */
function initializeApp() {
  showLoading();
  
  // Simulate loading time for better UX
  setTimeout(() => {
    renderProducts(products);
    hideLoading();
    setupEventListeners();
    setupIntersectionObserver();
  }, 800);
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Filter button events
  filterButtons.forEach(button => {
    button.addEventListener('click', handleFilterClick);
  });
  
  // Modal events
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', handleModalOverlayClick);
  
  // Keyboard events
  document.addEventListener('keydown', handleKeyboardEvents);
  
  // Window resize events
  window.addEventListener('resize', handleWindowResize);
  
  // Button ripple effects
  setupRippleEffects();
}

/**
 * Setup ripple effect for buttons
 */
function setupRippleEffects() {
  const buttons = document.querySelectorAll('.filter-btn, .btn');
  
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      createRipple(e, this);
    });
  });
}

/**
 * Create ripple effect on button click
 */
function createRipple(event, button) {
  const ripple = button.querySelector('.btn-ripple');
  if (!ripple) return;
  
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  
  ripple.style.transform = 'scale(0)';
  ripple.style.opacity = '1';
  
  // Trigger animation
  requestAnimationFrame(() => {
    ripple.style.transform = 'scale(4)';
    ripple.style.opacity = '0';
  });
}

/**
 * Setup Intersection Observer for fade-in animations
 */
function setupIntersectionObserver() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all product cards
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => observer.observe(card));
}

/**
 * Handle filter button clicks
 */
function handleFilterClick(event) {
  const filter = event.currentTarget.dataset.filter;
  
  if (filter === currentFilter) return;
  
  // Update active button
  filterButtons.forEach(btn => btn.classList.remove('active'));
  event.currentTarget.classList.add('active');
  
  // Filter products
  filterProducts(filter);
}

/**
 * Filter products with smooth animation
 */
function filterProducts(filter) {
  currentFilter = filter;
  showLoading();
  
  // Fade out current products
  const currentCards = document.querySelectorAll('.product-card');
  currentCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px) scale(0.95)';
    }, index * 50);
  });
  
  // Wait for fade out animation, then render new products
  setTimeout(() => {
    const filteredProducts = filter === 'all' 
      ? products 
      : products.filter(product => product.category === filter);
    
    renderProducts(filteredProducts);
    hideLoading();
  }, 600);
}

/**
 * Render products to the grid
 */
function renderProducts(productsToRender) {
  productsGrid.innerHTML = '';
  
  productsToRender.forEach((product, index) => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);
    
    // Stagger the fade-in animation
    setTimeout(() => {
      productCard.classList.add('fade-in');
    }, index * 100);
  });
  
  // Re-setup intersection observer for new cards
  setTimeout(() => {
    setupIntersectionObserver();
  }, 100);
}

/**
 * Create a product card element
 */
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.category = product.category;
  
  card.innerHTML = `
    <div class="product-image-container">
      <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
    </div>
    <div class="product-info">
      <h3 class="product-name">${product.name}</h3>
      <p class="product-price">${product.price}</p>
      <span class="product-category">${product.category}</span>
    </div>
  `;
  
  // Add click event to open modal
  card.addEventListener('click', () => openModal(product));
  
  return card;
}

/**
 * Open product modal with animation
 */
function openModal(product) {
  if (isModalOpen) return;
  
  isModalOpen = true;
  
  // Populate modal content
  modalImage.src = product.image;
  modalImage.alt = product.name;
  modalTitle.textContent = product.name;
  modalPrice.textContent = product.price;
  modalDescription.textContent = product.description;
  
  // Show modal with animation
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Focus management for accessibility
  modalClose.focus();
}

/**
 * Close modal with animation
 */
function closeModal() {
  if (!isModalOpen) return;
  
  isModalOpen = false;
  
  modalOverlay.classList.remove('active');
  document.body.style.overflow = 'auto';
}

/**
 * Handle modal overlay clicks
 */
function handleModalOverlayClick(event) {
  if (event.target === modalOverlay) {
    closeModal();
  }
}

/**
 * Handle keyboard events
 */
function handleKeyboardEvents(event) {
  switch(event.key) {
    case 'Escape':
      if (isModalOpen) {
        closeModal();
      }
      break;
    case 'Tab':
      if (isModalOpen) {
        // Trap focus within modal
        trapFocus(event);
      }
      break;
  }
}

/**
 * Trap focus within modal for accessibility
 */
function trapFocus(event) {
  const focusableElements = productModal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

/**
 * Handle window resize events
 */
function handleWindowResize() {
  // Close modal on mobile orientation change
  if (window.innerWidth <= 768 && isModalOpen) {
    closeModal();
  }
}

/**
 * Show loading overlay
 */
function showLoading() {
  loadingOverlay.classList.add('active');
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  loadingOverlay.classList.remove('active');
}

/**
 * Add to cart functionality (placeholder)
 */
document.addEventListener('click', function(event) {
  if (event.target.closest('.add-to-cart')) {
    event.preventDefault();
    
    const button = event.target.closest('.add-to-cart');
    const originalText = button.querySelector('.btn-text').textContent;
    
    // Visual feedback
    button.querySelector('.btn-text').textContent = 'Added to Cart!';
    button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    
    setTimeout(() => {
      button.querySelector('.btn-text').textContent = originalText;
      button.style.background = '';
    }, 2000);
  }
  
  if (event.target.closest('.wishlist')) {
    event.preventDefault();
    
    const button = event.target.closest('.wishlist');
    const textElement = button.querySelector('.btn-text');
    const isWishlisted = textElement.textContent.includes('♥');
    
    if (isWishlisted) {
      textElement.textContent = '♡ Wishlist';
      button.style.color = '#4a5568';
    } else {
      textElement.textContent = '♥ Wishlisted';
      button.style.color = '#ef4444';
    }
  }
});

/**
 * Smooth scroll to top function
 */
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

/**
 * Performance optimization: Debounce function
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

// Optimize resize handler
const debouncedResize = debounce(handleWindowResize, 250);
window.addEventListener('resize', debouncedResize);

