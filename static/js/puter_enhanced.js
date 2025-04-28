/**
 * WikiLearn - Enhanced Puter.js Integration
 * Uses latest Puter.js features and models for improved AI-based learning
 */

// Function to generate a summary using Puter.js
function generateSummaryWithPuter(articleTitle, englishLevel) {
    // Get the loading element
    const summaryContent = document.getElementById('summary-content');
    if (!summaryContent) return;
    
    // Show loading state
    summaryContent.innerHTML = '<div class="loading"><div class="loading-spinner"></div>Generating summary...</div>';
    
    // Define complexity based on English level
    let complexity = '';
    switch (englishLevel) {
        case 'elementary':
            complexity = 'Use simple vocabulary and grammar suitable for A1-A2 English level. Use short sentences (maximum 8-10 words). Avoid complex words, idioms, and phrasal verbs. Use simple present and past tenses only. Explain any technical terms.';
            break;
        case 'intermediate':
            complexity = 'Use vocabulary and grammar suitable for B1-B2 English level. Use a mix of simple and compound sentences. Include some common idioms and phrasal verbs, but explain them if they are important to understanding. Use a variety of tenses.';
            break;
        case 'professional':
            complexity = 'Use advanced vocabulary and grammar suitable for C1-C2 English level. Use complex sentence structures, academic vocabulary, varied tenses, and specialized terminology appropriate to the subject. Do not simplify content.';
            break;
        default:
            complexity = 'Use vocabulary and grammar suitable for B1-B2 English level.';
    }
    
    // Create a detailed prompt for better results
    const prompt = `
        I will provide you with a Wikipedia articles title. Please write an article in a way that is appropriate for ${englishLevel} level English learners.
        
        ${complexity}
        
        Format requirements:
        1. Begin with a title that summarizes the article topic
        2. Structure the content with clear paragraphs and headings

        4. Conclude with 2-3 sentences summarizing the main points
        
        Make the article engaging, educational, and factually accurate. Maintain all important information while adapting the language to the appropriate level.
        
        Here's the article title:
        ${articleTitle}
    `;
    
    // Try different models in order of preference
    tryModelsForSummary(prompt, summaryContent, englishLevel, articleTitle);
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
  

// ---------------------------------------------
// Универсальный парсер ответа Puter.js
// ---------------------------------------------
// WikiLearn - Enhanced Puter.js Integration (updated formatAIResponse)
// -----------------------------------------------------------------
// … остальной код без изменений …

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
  
  // … остаётся дальнейший код скрипта …
  

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

// Function to generate a lesson using Puter.js
function generateLessonWithPuter(articleContent, englishLevel) {
    // Get the lesson container
    const lessonContainer = document.getElementById('lesson-container');
    if (!lessonContainer) return;
    
    // Show loading state
    lessonContainer.innerHTML = '<div class="loading"><div class="loading-spinner"></div>Generating lesson plan...</div>';
    
    // Define complexity based on English level
    let levelDescription = '';
    switch (englishLevel) {
        case 'elementary':
            levelDescription = 'A1-A2 level (elementary) - Use simple vocabulary and grammar. Focus on basic sentence structures, common everyday words, and simple present and past tenses.';
            break;
        case 'intermediate':
            levelDescription = 'B1-B2 level (intermediate) - Use a moderate range of vocabulary and grammar structures. Include some idioms and phrasal verbs with explanations. Use various tenses and conditional forms.';
            break;
        case 'professional':
            levelDescription = 'C1-C2 level (professional) - Use advanced vocabulary, complex grammar structures, idiomatic expressions, and academic language. Challenge the learner with sophisticated content.';
            break;
        default:
            levelDescription = 'B1-B2 level (intermediate)';
    }
    
    // Create a detailed prompt for the lesson with the specified content structure
    const prompt = `
        You are WikiLearn, an educational assistant specializing in creating language learning materials from Wikipedia articles.
        
        Create a comprehensive English language lesson plan based on the following Wikipedia article, suitable for ${levelDescription} English learners.
        
        Your lesson plan must include exactly these sections, formatted with HTML with clean table formatting for all tabular content:
        
        <h1>English Lesson: [Topic]</h1>
        
        <h2>1. Vocabulary (Exactly 10 New Words)</h2>
        - Create a well-formatted HTML table with exactly 10 new vocabulary words from the article
        - For each word, include: Word, Part of Speech, Definition, Example Sentence 
        - Choose words appropriate for the ${englishLevel} level English learner
        - Format as a proper HTML table with <table>, <thead>, <tbody>, <tr>, <th>, and <td> tags
        
        <h2>2. Reading Comprehension</h2>
        <h3>Summary</h3>
        - Create a level-appropriate summary of the article (3-4 paragraphs)
        
        <h3>True/False Questions</h3>
        - Create 5 true/false questions about the article  
        - Format as a table **но** ответы и объяснения оборачивай так:  
        <details><summary>Show answer</summary>True</details>
        <details><summary>Show explanation</summary> ... </details>
        
        <h3>Wh- Questions</h3>
        - Create 5 questions (What / Who / …)  
        - Помести каждый ответ внутрь  
        <details><summary>Show answer</summary>…</details>
        
        <h2>3. Word Matching Exercise</h2>
        - Create a two-column table (Word | Definition).  
        - Below the table add an Answer Key section, but hide it:
        <details><summary>Show answers</summary>
        <ul><li>1 → C</li><li>2 → A</li> …</ul>
        </details>
        
        <h2>4. Fill in the Blanks</h2>
        - Create one paragraph with 8-10 blanks.  
        - Replace each missing word with _____ (номер в Word Bank).  
        - Show the Word Bank as an unordered list.  
        - After the exercise add:
        <details><summary>Show completed text</summary>
        (the same paragraph with the blanks filled in and <strong>bold</strong> answers)
        </details>

        
        <h2>5. Discussion (Speaking Practice)</h2>
        - Provide 3 discussion questions related to the article topic
        - For each question, include 2-3 guiding points to help students elaborate
        
        <h2>6. Essay Theme</h2>
        - Provide a writing prompt related to the article topic
        - Include specific requirements (word count, elements to include, etc.)
        - Tailor the difficulty to the ${englishLevel} level
        
        Use proper HTML formatting with tables for all exercises. Make sure tables are well-structured with <table>, <thead>, <tbody>, <tr>, <th>, and <td> tags. Format everything in a visually appealing way.
        
        Adjust all content to be appropriate for the ${englishLevel} level English learner. Make the lesson engaging, practical, and focused on real language use.
        
        Here's the article content:
        ${articleContent}
    `;
    
    // Try different models for the lesson generation
    tryModelsForLesson(prompt, lessonContainer, englishLevel, articleContent);
}

// Try different models for lesson generation
function tryModelsForLesson(prompt, lessonContainer, englishLevel, articleContent) {
    // First try with gpt-4o-mini
    puter.ai.chat(prompt, { model: "gpt-4o" })
        .then(response => {
            lessonContainer.innerHTML = response;
            
            // Store in session storage
            const articleTitle = document.getElementById('article-title').value;
            sessionStorage.setItem(`lesson_${articleTitle}_${englishLevel}`, response);
        })
        .catch(error => {
            console.error('Error with gpt-4o-mini, trying o1-mini:', error);
            
            // Try with o1-mini as fallback
            puter.ai.chat(prompt, { model: "o1-mini" })
                .then(response => {
                    lessonContainer.innerHTML = response;
                    
                    // Store in session storage
                    const articleTitle = document.getElementById('article-title').value;
                    sessionStorage.setItem(`lesson_${articleTitle}_${englishLevel}`, response);
                })
                .catch(error2 => {
                    console.error('Error with o1-mini, trying o3-mini:', error2);
                    
                    // Try with o3-mini as a second fallback
                    puter.ai.chat(prompt, { model: "o3-mini" })
                        .then(response => {
                            lessonContainer.innerHTML = response;
                            
                            // Store in session storage
                            const articleTitle = document.getElementById('article-title').value;
                            sessionStorage.setItem(`lesson_${articleTitle}_${englishLevel}`, response);
                        })
                        .catch(error3 => {
                            console.error('Error with all models, generating basic lesson:', error3);
                            
                            // If all models fail, generate a basic lesson
                            generateBasicLesson(articleContent, englishLevel, lessonContainer);
                        });
                });
        });
}

// Generate a basic lesson from the article content with the new structure
function generateBasicLesson(articleContent, englishLevel, lessonContainer) {
    // Extract paragraphs and potential vocabulary
    const paragraphs = articleContent.split('\n').filter(p => p.trim().length > 0);
    
    // Extract potential vocabulary words (longer words)
    const wordRegex = /\b[A-Za-z]{5,}\b/g;
    const words = articleContent.match(wordRegex) || [];
    const uniqueWords = [...new Set(words)].slice(0, 10);
    
    // Create a title from the first heading or first sentence
    const titleMatch = articleContent.match(/<h1>(.*?)<\/h1>/);
    const title = titleMatch ? titleMatch[1] : paragraphs[0].split('.')[0];
    
    // Get a sample paragraph for exercises
    const sampleParagraph = paragraphs[1] || paragraphs[0];
    
    // Create HTML for the lesson with proper table formatting
    let lessonHTML = `
        <h1>English Lesson: ${title}</h1>
        
        <h2>1. Vocabulary (10 New Words)</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Word</th>
                    <th>Part of Speech</th>
                    <th>Definition</th>
                    <th>Example Sentence</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Add vocabulary with improved formatting
    uniqueWords.forEach(word => {
        lessonHTML += `
            <tr>
                <td><strong>${word}</strong></td>
                <td>noun/verb/adj</td>
                <td>(Look up this word)</td>
                <td>Use the word ${word} in a sentence.</td>
            </tr>
        `;
    });
    
    lessonHTML += `
            </tbody>
        </table>
        
        <h2>2. Reading Comprehension</h2>
        
        <h3>Summary</h3>
        <p>${paragraphs[0]}</p>
        <p>${paragraphs.length > 1 ? paragraphs[1] : ''}</p>
        
        <h3>True/False Questions</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Question</th>
                    <th>True/False</th>
                    <th>Explanation</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>This article is about ${title}.</td>
                    <td>True</td>
                    <td>The title clearly indicates this topic.</td>
                </tr>
                <tr>
                    <td>The article mentions nothing important.</td>
                    <td>False</td>
                    <td>The article contains valuable information about the topic.</td>
                </tr>
                <tr>
                    <td>The topic is related to ${uniqueWords[0] || 'knowledge'}.</td>
                    <td>True</td>
                    <td>This word appears in the article in relation to the topic.</td>
                </tr>
                <tr>
                    <td>There are no examples in the article.</td>
                    <td>False</td>
                    <td>The article contains examples to explain concepts.</td>
                </tr>
                <tr>
                    <td>The article was written in a factual style.</td>
                    <td>True</td>
                    <td>The article presents information factually.</td>
                </tr>
            </tbody>
        </table>
        
        <h3>Wh- Questions</h3>
        <ol>
            <li><strong>What</strong> is the main topic of this article?</li>
            <li><strong>Why</strong> is this topic important?</li>
            <li><strong>How</strong> does this information relate to other areas?</li>
            <li><strong>Where</strong> would you find more information about this topic?</li>
            <li><strong>Who</strong> would benefit from knowing about this topic?</li>
        </ol>
        
        <h2>3. Word Matching Exercise</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Word</th>
                    <th>Definition</th>
                </tr>
            </thead>
            <tbody>
                ${uniqueWords.slice(0, 5).map((word, index) => `
                <tr>
                    <td>${index + 1}. ${word}</td>
                    <td>${String.fromCharCode(65 + index)}. Definition for ${word}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h2>4. Fill in the Blanks</h2>
        <p>Fill in the blanks in the paragraph below using the words from the word bank.</p>
        <div class="exercise">
            <p>${sampleParagraph.replace(new RegExp(`\\b(${uniqueWords.slice(0, 8).join('|')})\\b`, 'gi'), '_____(__)_____')}</p>
            <p><strong>Word Bank:</strong> ${uniqueWords.slice(0, 8).join(', ')}</p>
        </div>
        
        <h2>5. Discussion (Speaking Practice)</h2>
        <ol>
            <li>
                <strong>What do you already know about ${title}?</strong>
                <ul>
                    <li>Consider your prior knowledge</li>
                    <li>Think about where you might have encountered this topic before</li>
                    <li>Reflect on your personal experiences related to this topic</li>
                </ul>
            </li>
            <li>
                <strong>How does this topic relate to your life or interests?</strong>
                <ul>
                    <li>Consider practical applications</li>
                    <li>Think about how this knowledge might be useful</li>
                    <li>Discuss any personal connections to the topic</li>
                </ul>
            </li>
            <li>
                <strong>Would you like to learn more about this topic? Why or why not?</strong>
                <ul>
                    <li>Consider the value of further knowledge on this subject</li>
                    <li>Think about what aspects are most interesting to you</li>
                    <li>Discuss how you might use this information in the future</li>
                </ul>
            </li>
        </ol>
        
        <h2>6. Essay Theme</h2>
        <div class="exercise">
            <p><strong>Writing Prompt:</strong> Write a ${englishLevel === 'elementary' ? '150-200' : englishLevel === 'intermediate' ? '250-300' : '400-500'} word essay about "${title}" based on what you learned from the article.</p>
            <p><strong>Requirements:</strong></p>
            <ul>
                <li>Include at least ${englishLevel === 'elementary' ? '5' : englishLevel === 'intermediate' ? '7' : '10'} vocabulary words from the vocabulary list</li>
                <li>Write ${englishLevel === 'elementary' ? '3-4' : englishLevel === 'intermediate' ? '4-5' : '5-6'} paragraphs</li>
                <li>Include an introduction, main points, and conclusion</li>
                <li>${englishLevel === 'professional' ? 'Add your own critical analysis and perspective on the topic' : 'Share your thoughts about the topic'}</li>
            </ul>
        </div>
        
        <p class="mt-4"><small>This is an automatically generated lesson based on the article content. When API generation is available, this lesson will have more personalized content.</small></p>
    `;
    
    lessonContainer.innerHTML = lessonHTML;
}

async function generateExtraWithPuter(articleContent, englishLevel, mode, outEl) {
    // Map level to short descriptor
    const levelMap = {
      elementary: 'A1‑A2 (elementary)',
      intermediate: 'B1‑B2 (intermediate)',
      professional: 'C1‑C2 (advanced)'
    };
  
    // Difficulty modifiers for tasks
    const difficultyTip = {
      elementary: 'Keep sentences short (≤10 words) and avoid complex clauses.',
      intermediate: 'Use a mix of simple and compound sentences; introduce a few idioms.',
      professional: 'Feel free to use complex grammar and academic vocabulary.'
    }[englishLevel] || '';
  
    // Prompt snippets per mode
    const modePrompt = {
      grammar: `Create **3 GRAMMAR drills** appropriate for ${levelMap[englishLevel]}.\n\n1. **Gap‑fill (10 items):** remove verbs from key sentences in the article and ask the learner to supply the correct tense or form.\n2. **Sentence transformation (10 items):** rewrite sentences (active↔passive, direct↔reported speech, etc.).\n3. **Error correction (10 items):** present sentences with one mistake each.\n\n${difficultyTip}\nFor every item provide the correct answer **inside** <details><summary>Answer</summary>…</details>.`,
  
      vocabulary: `Create **3 VOCABULARY tasks** for ${levelMap[englishLevel]}.\n\n1. **Matching (10 pairs):** word ⇄ simple definition.\n2. **Synonym/Antonym MCQ (10 items).**\n3. **Collocations gap‑fill (10 items).**\n\nChoose words that actually appear in the article. Put all keys inside <details><summary>Answers</summary>…</details>.`,
  
      extra: `Create **3 EXTRA exercises** suitable for ${levelMap[englishLevel]}.\n\n1. **Writing prompt**: 80‑${englishLevel==='professional'?'150':'120'} words.\n2. **Speaking task**: pair‑work with 5 guiding questions.\n3. **Creative activity**: e.g. design a Kahoot‑style quiz (5 Qs) or a role‑play scenario.\n\nHide sample answers or guidance in <details> blocks.`,
    }[mode];
  
    const prompt = `You are WikiLearn, an ESL content generator. Based on the Wikipedia extract below, create the requested materials.\n\n${modePrompt}\n\n=== ARTICLE START ===\n${articleContent}\n=== ARTICLE END ===\n\nReturn **clean HTML only**.`;
  
    // loading spinner
    outEl.innerHTML = '<div class="loading"><div class="loading-spinner"></div>Generating…</div>';
  
    try {
      const resp = await puter.ai.chat(prompt, { model: 'gpt-4o-mini' });
      outEl.innerHTML = formatAIResponse(resp);
    } catch (e) {
      console.error('extra-gen:', e?.error?.message || e);
      outEl.innerHTML = '<p class="error-message">Failed to generate extra materials. Try again later.</p>';
    }
  }
  
// Initialize functionality when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the summary page
    const summaryContent = document.getElementById('summary-content');
    if (summaryContent) {
        const articleTitle = document.getElementById('article-title').value;
        const englishLevel = document.getElementById('english-level').value;
        
        // Check if we have a stored summary
        const storedSummary = sessionStorage.getItem(`summary_${articleTitle}_${englishLevel}`);
        
        if (storedSummary) {
            summaryContent.innerHTML = storedSummary;
        } else {
            // Generate a new summary
            generateSummaryWithPuter(articleTitle, englishLevel);
        }
        // === EXTRA TRAINING BUTTONS =========================================
        const extraOutput        = document.getElementById('extra-output');
        const trainGrammarBtn    = document.getElementById('train-grammar-btn');
        const trainVocabBtn      = document.getElementById('train-vocabulary-btn');
        const extraExercisesBtn  = document.getElementById('extra-exercises-btn');

        if (trainGrammarBtn && extraOutput){
        const articleTitle   = document.getElementById('article-title').value;
        const englishLevel   = document.getElementById('english-level').value;
        const articleContent = sessionStorage.getItem(`article_${articleTitle}`);

        const launch = (mode) =>
            generateExtraWithPuter(articleContent, englishLevel, mode, extraOutput);

        trainGrammarBtn   .addEventListener('click', () => launch('grammar'));
        trainVocabBtn     .addEventListener('click', () => launch('vocabulary'));
        extraExercisesBtn .addEventListener('click', () => launch('extra'));
}

    }
    
    // Check if we're on the generate summary page (article.html)
    const generateSummaryBtn = document.getElementById('generate-summary-btn');
    if (generateSummaryBtn) {
        generateSummaryBtn.addEventListener('click', function() {
            const articleTitle = document.getElementById('article-title').value;
            const articleContent = document.getElementById('article-content').value;
            const selectedLevel = document.querySelector('.english-level-btn.active');
            
            if (!selectedLevel) {
                alert('Please select your English level');
                return;
            }
            
            const englishLevel = selectedLevel.dataset.level;
            
            // Store the article content in session storage
            sessionStorage.setItem(`article_${articleTitle}`, articleContent);
            
            // Redirect to the summary page
            window.location.href = `/summary/${encodeURIComponent(articleTitle)}?level=${englishLevel}`;
        });
    }
    
    // Check if we're on the lesson page
    const lessonContainer = document.getElementById('lesson-container');
    if (lessonContainer && lessonContainer.dataset.generate === 'true') {
        const articleTitle = document.getElementById('article-title').value;
        const englishLevel = document.getElementById('english-level').value;
        const articleContent = sessionStorage.getItem(`article_${articleTitle}`) || 
                               document.getElementById('article-content')?.value;
        
        // Check if we have a stored lesson
        const storedLesson = sessionStorage.getItem(`lesson_${articleTitle}_${englishLevel}`);
        
        if (storedLesson) {
            lessonContainer.innerHTML = storedLesson;
        } else if (articleContent) {
            generateLessonWithPuter(articleContent, englishLevel);
        } else {
            lessonContainer.innerHTML = '<div class="error-message">Article content not found. Please go back to the article page.</div>';
        }
    }
    
    // Check if we're on the create lesson button (summary.html)
    const createLessonBtn = document.getElementById('create-lesson-btn');
    if (createLessonBtn) {
        createLessonBtn.addEventListener('click', function() {
            const articleTitle = document.getElementById('article-title').value;
            const englishLevel = document.getElementById('english-level').value;
            
            // Redirect to the lesson page
            window.location.href = `/lesson/${encodeURIComponent(articleTitle)}?level=${englishLevel}`;
        });
    }
});