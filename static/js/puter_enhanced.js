/**
 * WikiLearn - Enhanced Puter.js Integration
 * Uses latest Puter.js features and models for improved AI-based learning
 */

// Function to generate a summary using OpenAI API
function generateSummaryWithOpenAI(articleTitle, englishLevel) {
    // Get the loading element
    const summaryContent = document.getElementById('summary-content');
    if (!summaryContent) return;
    
    // Show loading state
    summaryContent.innerHTML = '<div class="loading"><div class="loading-spinner"></div>Generating summary...</div>';
    
    // Call OpenAI API endpoint
    fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            article_title: articleTitle,
            english_level: englishLevel
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const formatted = formatAIResponse(data.summary);
            summaryContent.innerHTML = formatted;
            sessionStorage.setItem(`summary_${articleTitle}_${englishLevel}`, formatted);
        } else {
            summaryContent.innerHTML = `<div class="error-message">Failed to generate summary: ${data.error}</div>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        summaryContent.innerHTML = '<div class="error-message">Failed to generate summary. Please try again later.</div>';
    });
}

// Function to try different models for summary generation
function tryModelsForSummary(prompt, summaryContent, englishLevel, articleTitle) {
    // вспомогалка, чтобы не копировать-вставлять один и тот же блок
    const applyResult = (resp) => {
      const formatted = formatAIResponse(resp);
      summaryContent.innerHTML = formatted;
      sessionStorage.setItem(`summary_${articleTitle}_${englishLevel}`, formatted);
    };
  
    // а это — вспомогалка для логов
    const why = (e) => e?.error?.message || e?.message || e;
  
    // — 1 —
    puter.ai.chat(prompt, { model: "gpt-4o-mini" })
      .then(applyResult)
      .catch(e1 => {
        console.error("4o-mini:", why(e1));
  
        // — 2 —
        puter.ai.chat(prompt, { model: "o1-mini" })
          .then(applyResult)
          .catch(e2 => {
            console.error("o1-mini:", why(e2));
  
            // — 3 —
            puter.ai.chat(prompt, { model: "o3-mini" })
              .then(applyResult)
              .catch(e3 => {
                console.error("o3-mini:", why(e3));
                // запасной план
                generateBasicSummary(articleTitle, englishLevel, summaryContent);
              });
          });
      });
  }

function formatAIResponse(response) {
    // 1. вытаскиваем текст из разных форматов ответа Puter
    let text = typeof response === 'string'
             ? response
             : (response?.message?.content || response?.choices?.[0]?.message?.content || JSON.stringify(response, null, 2));
  
    // 2. убираем ограждения ```html … ``` если модель прислала код‑блок
    text = text.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
  
    // 3. минимальный Markdown → HTML (оставляя уже готовый HTML нетронутым)
    text = text
      .replace(/^### (.*)$/gim, '<h3>$1</h3>')  // ### → h3
      .replace(/^## (.*)$/gim,  '<h2>$1</h2>')  // ##  → h2
      .replace(/^# (.*)$/gim,   '<h1>$1</h1>')  // #   → h1
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
    // 4. преврати двойные переводы строк в <p>, НЕ трогая строки, которые уже HTML
    text = text.split(/\n{2,}/).map(seg => {
        const s = seg.trim();
        return /^</.test(s) ? s : `<p>${s}</p>`;
    }).join('');
  
    return text;
  }

// Generate a basic summary from the article content
function generateBasicSummary(articleTitle, englishLevel, summaryContent) {
    // Extract first portion of the article (first few paragraphs)
    const raw = sessionStorage.getItem(`article_${articleTitle}`) || '';
    const paragraphs = raw.split('\n').filter(p => p.trim());
    let summary = '';
    
    // Determine how much content to include based on level
    const paragraphCount = englishLevel === 'elementary' ? 1 : 
                          (englishLevel === 'intermediate' ? 2 : 3);
    
    // Create a title from the first H1 or first sentence
    const titleMatch = raw.match(/<h1>(.*?)<\/h1>/);
    const title = titleMatch ? titleMatch[1] : paragraphs[0].split('.')[0];
    
    // Add appropriate header based on level
    let levelText = '';
    switch (englishLevel) {
        case 'elementary':
            levelText = '<h2>Elementary English Summary (A1-A2)</h2>';
            break;
        case 'intermediate':
            levelText = '<h2>Intermediate English Summary (B1-B2)</h2>';
            break;
        case 'professional':
            levelText = '<h2>Advanced English Summary (C1-C2)</h2>';
            break;
    }
    
    // Generate the summary content
    summary = `<h1>${title}</h1>${levelText}`;
    for (let i = 0; i < Math.min(paragraphCount, paragraphs.length); i++) {
        summary += `<p>${paragraphs[i]}</p>`;
    }
    
    // Add a note
    summary += `<p class="mt-4"><small>This is an extract from the original article.</small></p>`;
    
    summaryContent.innerHTML = summary;
}

// Function to generate a lesson using OpenAI API
function generateLessonWithOpenAI(articleTitle, englishLevel) {
    // Get the lesson container
    const lessonContainer = document.getElementById('lesson-container');
    if (!lessonContainer) return;
    
    // Show loading state
    lessonContainer.innerHTML = '<div class="loading"><div class="loading-spinner"></div>Generating lesson plan...</div>';
    
    // Call OpenAI API endpoint
    fetch('/api/generate-lesson', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            article_title: articleTitle,
            english_level: englishLevel
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const formatted = formatAIResponse(data.lesson);
            lessonContainer.innerHTML = formatted;
            
            // Store in session storage
            const articleTitle = document.getElementById('article-title').value;
            sessionStorage.setItem(`lesson_${articleTitle}_${englishLevel}`, formatted);
        } else {
            lessonContainer.innerHTML = `<div class="error-message">Failed to generate lesson: ${data.error}</div>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        lessonContainer.innerHTML = '<div class="error-message">Failed to generate lesson. Please try again later.</div>';
    });
}

// Try different models for lesson generation
function tryModelsForLesson(prompt, lessonContainer, englishLevel, articleContent) {
    // First try with gpt-4o-mini
    puter.ai.chat(prompt, { model: "gpt-4o" })
        .then(response => {
            lessonContainer.innerHTML = formatAIResponse(response);
            
            // Store in session storage
            const articleTitle = document.getElementById('article-title').value;
            sessionStorage.setItem(`lesson_${articleTitle}_${englishLevel}`, response);
        })
        .catch(error => {
            console.error('Error with gpt-4o, trying o1-mini:', error);
            
            // Try with o1-mini as fallback
            puter.ai.chat(prompt, { model: "o1-mini" })
                .then(response => {
                    lessonContainer.innerHTML = formatAIResponse(response);
                    
                    // Store in session storage
                    const articleTitle = document.getElementById('article-title').value;
                    sessionStorage.setItem(`lesson_${articleTitle}_${englishLevel}`, response);
                })
                .catch(error => {
                    console.error('Error with o1-mini, trying o3-mini:', error);
                    
                    // Try with o3-mini as final fallback
                    puter.ai.chat(prompt, { model: "o3-mini" })
                        .then(response => {
                            lessonContainer.innerHTML = formatAIResponse(response);
                            
                            // Store in session storage
                            const articleTitle = document.getElementById('article-title').value;
                            sessionStorage.setItem(`lesson_${articleTitle}_${englishLevel}`, response);
                        })
                        .catch(error => {
                            console.error('All AI models failed:', error);
                            generateBasicLesson(articleContent, englishLevel, lessonContainer);
                        });
                });
        });
}

// Generate a basic lesson if AI fails
function generateBasicLesson(articleContent, englishLevel, lessonContainer) {
    const articleTitle = document.getElementById('article-title').value;
    
    lessonContainer.innerHTML = `
        <h1>English Lesson: ${articleTitle}</h1>
        <h2>Content Summary</h2>
        <p>This is a basic lesson plan. The AI-powered content generation is currently unavailable.</p>
        <div class="exercise">
            <h3>Reading Exercise</h3>
            <p>Read the original article and try to identify:</p>
            <ul>
                <li>Key vocabulary words</li>
                <li>Main ideas</li>
                <li>Important facts</li>
            </ul>
        </div>
        <div class="exercise">
            <h3>Discussion Questions</h3>
            <ol>
                <li>What is the main topic of this article?</li>
                <li>What did you learn that was new to you?</li>
                <li>How does this topic relate to your daily life?</li>
            </ol>
        </div>
    `;
}

// Function to generate grammar exercises
function generateGrammarExercises(articleTitle, englishLevel, outputElement) {
    outputElement.innerHTML = '<div class="loading"><div class="loading-spinner"></div>Generating grammar exercises...</div>';
    
    fetch('/api/generate-exercise', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            article_title: articleTitle,
            english_level: englishLevel,
            exercise_type: 'grammar'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            outputElement.innerHTML = formatAIResponse(data.exercise);
        } else {
            outputElement.innerHTML = `<div class="error-message">Failed to generate grammar exercises: ${data.error}</div>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        outputElement.innerHTML = '<div class="error-message">Failed to generate grammar exercises. Please try again later.</div>';
    });
}

// Function to generate vocabulary exercises
function generateVocabularyExercises(articleTitle, englishLevel, outputElement) {
    outputElement.innerHTML = '<div class="loading"><div class="loading-spinner"></div>Generating vocabulary exercises...</div>';
    
    fetch('/api/generate-exercise', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            article_title: articleTitle,
            english_level: englishLevel,
            exercise_type: 'vocabulary'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            outputElement.innerHTML = formatAIResponse(data.exercise);
        } else {
            outputElement.innerHTML = `<div class="error-message">Failed to generate vocabulary exercises: ${data.error}</div>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        outputElement.innerHTML = '<div class="error-message">Failed to generate vocabulary exercises. Please try again later.</div>';
    });
}

// Function to generate extra exercises
function generateExtraExercises(articleTitle, englishLevel, outputElement) {
    outputElement.innerHTML = '<div class="loading"><div class="loading-spinner"></div>Generating extra exercises...</div>';
    
    fetch('/api/generate-exercise', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            article_title: articleTitle,
            english_level: englishLevel,
            exercise_type: 'extra'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            outputElement.innerHTML = formatAIResponse(data.exercise);
        } else {
            outputElement.innerHTML = `<div class="error-message">Failed to generate extra exercises: ${data.error}</div>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        outputElement.innerHTML = '<div class="error-message">Failed to generate extra exercises. Please try again later.</div>';
    });
}

// Initialize content generation when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a summary page
    const summaryContent = document.getElementById('summary-content');
    if (summaryContent && summaryContent.querySelector('.loading')) {
        const articleTitle = document.getElementById('article-title')?.value;
        const englishLevel = document.getElementById('english-level')?.value;
        
        if (articleTitle && englishLevel) {
            // Check if we have cached content
            const cachedSummary = sessionStorage.getItem(`summary_${articleTitle}_${englishLevel}`);
            if (cachedSummary) {
                summaryContent.innerHTML = cachedSummary;
            } else {
                generateSummaryWithOpenAI(articleTitle, englishLevel);
            }
        }
    }
    
    // Check if we're on a lesson page
    const lessonContainer = document.getElementById('lesson-container');
    if (lessonContainer && lessonContainer.dataset.generate === 'true') {
        const articleTitle = document.getElementById('article-title')?.value;
        const englishLevel = document.getElementById('english-level')?.value;
        const articleContent = document.getElementById('article-content')?.value;
        
        if (articleTitle && englishLevel && articleContent) {
            // Check if we have cached content
            const cachedLesson = sessionStorage.getItem(`lesson_${articleTitle}_${englishLevel}`);
            if (cachedLesson) {
                lessonContainer.innerHTML = cachedLesson;
            } else {
                generateLessonWithOpenAI(articleContent, englishLevel);
            }
        }
    }
    
    // Extra training buttons
    const trainGrammarBtn = document.getElementById('train-grammar-btn');
    const trainVocabularyBtn = document.getElementById('train-vocabulary-btn');
    const extraExercisesBtn = document.getElementById('extra-exercises-btn');
    const extraOutput = document.getElementById('extra-output');
    
    if (trainGrammarBtn && extraOutput) {
        trainGrammarBtn.addEventListener('click', function() {
            const articleTitle = document.getElementById('article-title')?.value;
            const englishLevel = document.getElementById('english-level')?.value;
            
            if (articleTitle && englishLevel) {
                generateGrammarExercises(articleTitle, englishLevel, extraOutput);
            }
        });
    }
    
    if (trainVocabularyBtn && extraOutput) {
        trainVocabularyBtn.addEventListener('click', function() {
            const articleTitle = document.getElementById('article-title')?.value;
            const englishLevel = document.getElementById('english-level')?.value;
            
            if (articleTitle && englishLevel) {
                generateVocabularyExercises(articleTitle, englishLevel, extraOutput);
            }
        });
    }
    
    if (extraExercisesBtn && extraOutput) {
        extraExercisesBtn.addEventListener('click', function() {
            const articleTitle = document.getElementById('article-title')?.value;
            const englishLevel = document.getElementById('english-level')?.value;
            
            if (articleTitle && englishLevel) {
                generateExtraExercises(articleTitle, englishLevel, extraOutput);
            }
        });
    }
});
