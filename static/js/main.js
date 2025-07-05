/**
 * WikiLearn - Main JavaScript file
 * Handles UI interactions and initialization
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize English level selection
    initEnglishLevelSelection();
    
    // Initialize filter toggle
    initFilterToggle();
    
    // Add click event listeners where needed
    addEventListeners();
});

/**
 * Initialize English level selection UI
 */
function initEnglishLevelSelection() {
    const levelButtons = document.querySelectorAll('.english-level-btn');
    if (!levelButtons.length) return;
    
    levelButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            levelButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update hidden input value
            const levelInput = document.getElementById('selected-level');
            if (levelInput) {
                levelInput.value = this.dataset.level;
            }
        });
    });
}

/**
 * Initialize the filter toggle for showing only articles with images
 */
function initFilterToggle() {
    const filterToggle = document.getElementById('images-only-toggle');
    if (!filterToggle) return;
    
    filterToggle.addEventListener('change', function() {
        // Clear current articles
        const articleFeed = document.querySelector('.article-feed');
        if (articleFeed) {
            articleFeed.innerHTML = '';
        }
        
        // Reinitialize infinite scroll with new filter
        if (typeof initInfiniteScroll === 'function') {
            initInfiniteScroll(this.checked);
        }
    });
}

/**
 * Add event listeners to various UI elements
 */
function addEventListeners() {
    // Generate Summary button
    const generateBtn = document.getElementById('generate-summary-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            const levelInput = document.getElementById('selected-level');
            if (!levelInput || !levelInput.value) {
                alert('Please select your English level');
                return;
            }
            
            const articleTitle = document.getElementById('article-title').value;
            window.location.href = `/summary/${articleTitle}?level=${levelInput.value}`;
        });
    }
    
    // Create Lesson button
    const createLessonBtn = document.getElementById('create-lesson-btn');
    if (createLessonBtn) {
        createLessonBtn.addEventListener('click', function() {
            const articleTitle = document.getElementById('article-title').value;
            const englishLevel = document.getElementById('english-level').value;
            window.location.href = `/lesson/${articleTitle}?level=${englishLevel}`;
        });
    }
}
