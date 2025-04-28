/**
 * WikiLearn - Wikipedia API JavaScript Integration
 * Provides frontend functions for interacting with Wikipedia API
 */

/**
 * Fetch articles for a category/subcategory with client-side filtering
 * @param {string} category - Main category
 * @param {string} subcategory - Subcategory to filter by
 * @param {boolean} imagesOnly - Whether to show only articles with images
 * @param {string|null} continueFrom - Continuation token for pagination
 * @returns {Promise<Object>} - Articles and continuation token
 */
async function fetchArticles(category, subcategory, imagesOnly = false, continueFrom = null) {
    try {
        let url = `/api/articles/${encodeURIComponent(category)}/${encodeURIComponent(subcategory)}`;
        const params = new URLSearchParams();
        
        if (imagesOnly) {
            params.append('images_only', 'true');
        }
        
        if (continueFrom) {
            params.append('continue', continueFrom);
        }
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch articles: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching articles:', error);
        throw error;
    }
}

/**
 * Search Wikipedia articles by keyword
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Search results
 */
async function searchWikipedia(query) {
    if (!query || query.trim() === '') {
        return [];
    }
    
    try {
        // This is a client-side call to a search endpoint (to be implemented on the server)
        const url = `/api/search?q=${encodeURIComponent(query.trim())}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Search failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error searching Wikipedia:', error);
        return [];
    }
}

/**
 * Format the HTML content from Wikipedia API
 * @param {string} htmlContent - Raw HTML content
 * @returns {string} - Cleaned and formatted HTML
 */
function formatWikipediaContent(htmlContent) {
    if (!htmlContent) return '';
    
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Remove unwanted elements (edit links, references, etc.)
    const elementsToRemove = tempDiv.querySelectorAll('.mw-editsection, .reference, .noprint');
    elementsToRemove.forEach(el => el.remove());
    
    // Ensure all links open in a new tab and point to Wikipedia
    const links = tempDiv.querySelectorAll('a');
    links.forEach(link => {
        if (link.href && link.href.startsWith('http')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        } else if (link.getAttribute('href') && link.getAttribute('href').startsWith('/wiki/')) {
            // Convert internal Wikipedia links to our application format
            const articleTitle = link.getAttribute('href').replace('/wiki/', '');
            link.setAttribute('href', `/article/${articleTitle}`);
        }
    });
    
    // Ensure images are responsive
    const images = tempDiv.querySelectorAll('img');
    images.forEach(img => {
        img.classList.add('img-fluid');
        img.setAttribute('loading', 'lazy');
    });
    
    return tempDiv.innerHTML;
}
