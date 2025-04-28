/**
 * WikiLearn - Infinite Scroll Implementation
 * Handles loading articles as the user scrolls with random selection
 */

let category = '';
let subcategory = '';
let isLoading = false;
let hasMoreArticles = true;
let continueToken = null;
let seenArticleIds = new Set(); // Track already seen articles to avoid duplicates

/**
 * Initialize infinite scrolling with random article selection
 * @param {boolean} imagesOnly - Whether to show only articles with images
 */
function initInfiniteScroll(imagesOnly = false) {
    // Get category and subcategory from the URL
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length >= 4 && pathParts[1] === 'articles') {
        category = pathParts[2];
        subcategory = pathParts[3];
    } else {
        console.error('Invalid URL for articles page');
        return;
    }
    
    // Reset state
    isLoading = false;
    hasMoreArticles = true;
    continueToken = null;
    seenArticleIds.clear();
    
    // Clear existing articles and show loading for initial fetch
    const articleFeed = document.querySelector('.article-feed');
    if (articleFeed) {
        // Keep any elements that aren't article cards (like headers)
        const nonArticleElements = Array.from(articleFeed.children).filter(el => !el.classList.contains('article-card'));
        articleFeed.innerHTML = '';
        nonArticleElements.forEach(el => articleFeed.appendChild(el));
    }
    
    // Load initial articles
    loadMoreArticles(imagesOnly);
    
    // Set up intersection observer for infinite scrolling with improved settings
    const options = {
        root: null,
        rootMargin: '200px', // Load more articles before reaching the bottom
        threshold: 0.1
    };
    
    // Create loading indicator element
    const loadingIndicator = document.getElementById('loading-indicator');
    if (!loadingIndicator) {
        console.error('Loading indicator element not found');
        return;
    }
    
    // Initialize intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading && hasMoreArticles) {
                loadMoreArticles(imagesOnly);
            }
        });
    }, options);
    
    // Start observing the loading indicator
    observer.observe(loadingIndicator);
    
    // Also add scroll event as backup for browsers with Intersection Observer issues
    window.addEventListener('scroll', () => {
        if (isScrollNearBottom() && !isLoading && hasMoreArticles) {
            loadMoreArticles(imagesOnly);
        }
    });
}

/**
 * Check if scrolling is near the bottom of the page
 * @returns {boolean} - Whether scroll position is near bottom
 */
function isScrollNearBottom() {
    return window.innerHeight + window.scrollY >= document.body.offsetHeight - 500;
}

/**
 * Load more articles via AJAX with randomization and infinite scrolling
 * @param {boolean} imagesOnly - Whether to show only articles with images
 */
function loadMoreArticles(imagesOnly = false) {
    if (isLoading || !hasMoreArticles) return;
    
    isLoading = true;
    showLoadingIndicator();
    
    let url = `/api/articles/${category}/${subcategory}?images_only=${imagesOnly}`;
    if (continueToken) {
        url += `&continue=${continueToken}`;
    }
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.articles && data.articles.length > 0) {
                // Filter out any duplicate articles we've already seen
                const newArticles = data.articles.filter(article => !seenArticleIds.has(article.id));
                
                // If we have no new articles but there are more available, try to get the next batch
                if (newArticles.length === 0 && data.continue) {
                    continueToken = data.continue;
                    setTimeout(() => {
                        isLoading = false;
                        loadMoreArticles(imagesOnly);
                    }, 500);
                    return;
                }
                
                // Add all new article IDs to the seen set
                newArticles.forEach(article => seenArticleIds.add(article.id));
                
                // Append the new articles to the feed
                appendArticles(newArticles);
                
                // Update continuation state
                continueToken = data.continue;
                hasMoreArticles = !!continueToken;
                
                // If we received fewer articles than expected, try to load more automatically
                if (newArticles.length < 5 && hasMoreArticles) {
                    setTimeout(() => {
                        isLoading = false;
                        loadMoreArticles(imagesOnly);
                    }, 1000);
                    return;
                }
            } else {
                hasMoreArticles = false;
                showNoMoreArticlesMessage();
            }
        })
        .catch(error => {
            console.error('Error fetching articles:', error);
            showErrorMessage('Failed to load articles. Please try again later.');
        })
        .finally(() => {
            isLoading = false;
            hideLoadingIndicator();
        });
}

/**
 * Append articles to the feed with animation
 * @param {Array} articles - List of article objects
 */
function appendArticles(articles) {
    const articleFeed = document.querySelector('.article-feed');
    if (!articleFeed) return;
    
    articles.forEach(article => {
        const articleCard = createArticleCard(article);
        // Add a fade-in animation class
        articleCard.classList.add('fade-in');
        articleFeed.appendChild(articleCard);
        
        // Trigger the animation after a slight delay for a staggered effect
        setTimeout(() => {
            articleCard.classList.add('visible');
        }, 50);
    });
}

/**
 * Show a message when there are no more articles to load
 */
function showNoMoreArticlesMessage() {
    const articleFeed = document.querySelector('.article-feed');
    if (!articleFeed) return;
    
    // Only add the message if it doesn't already exist
    if (!document.querySelector('.no-more-articles')) {
        const messageElement = document.createElement('div');
        messageElement.className = 'no-more-articles';
        messageElement.innerHTML = `
            <p>You've reached the end of the articles in this category.</p>
            <p>Try another category or subcategory to discover more content!</p>
        `;
        articleFeed.appendChild(messageElement);
    }
}

/**
 * Create an article card element
 * @param {Object} article - Article data
 * @returns {HTMLElement} - Article card element
 */
function createArticleCard(article) {
    const articleCard = document.createElement('div');
    articleCard.className = 'article-card';
    
    let imageHtml = '';
    if (article.image) {
        imageHtml = `<img src="${article.image}" alt="${article.title}" class="article-img">`;
    } else {
        imageHtml = `
            <div class="article-img placeholder">
                <i class="fas fa-book"></i>
            </div>
        `;
    }
    
    articleCard.innerHTML = `
        ${imageHtml}
        <div class="article-content">
            <h3 class="article-title">${article.title}</h3>
            <p class="article-excerpt">${article.extract}</p>
            <a href="/article/${encodeURIComponent(article.title)}" class="read-more-btn">Read More</a>
        </div>
    `;
    
    return articleCard;
}

/**
 * Show loading indicator
 */
function showLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
}

/**
 * Hide loading indicator
 */
function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
    const articleFeed = document.querySelector('.article-feed');
    if (!articleFeed) return;
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    articleFeed.appendChild(errorElement);
}

// Initialize infinite scroll when the page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.article-feed')) {
        const imagesOnlyToggle = document.getElementById('images-only-toggle');
        const imagesOnly = imagesOnlyToggle ? imagesOnlyToggle.checked : false;
        initInfiniteScroll(imagesOnly);
    }
});
