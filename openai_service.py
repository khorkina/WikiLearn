import openai
import logging
import signal
import functools
from config import OPENAI_API_KEY
import openai, logging, functools, platform
import time, random, concurrent.futures

log = logging.getLogger(__name__)

# Initialize OpenAI client with improved timeout settings
# the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
# do not change this unless explicitly requested by the user
client = openai.OpenAI(
    api_key=OPENAI_API_KEY,
    timeout=120.0,  # Short timeout to prevent server crashes
    max_retries=0  # No retries to avoid hanging
) if OPENAI_API_KEY else None


def with_retry(fn, attempts=4, base=3):
    for n in range(attempts):
        try:
            return fn()
        except openai.error.Timeout:
            wait = base * 2**n + random.random()
            log.warning("Timeout, retrying in %.1fs (%d/%d)", wait, n+1, attempts)
            time.sleep(wait)
    raise TimeoutError("Too many timeouts")

def timeout(seconds: int):
    """Cross-platform timeout decorator (SIGALRM on Unix, ThreadPool on Win)."""
    def decorator(fn):
        if platform.system() != 'Windows':
            import signal
            def wrapper(*a, **kw):
                def _handler(signum, frame):
                    raise TimeoutError(f"{fn.__name__} timed out after {seconds}s")
                old = signal.signal(signal.SIGALRM, _handler)
                signal.alarm(seconds)
                try:
                    return fn(*a, **kw)
                finally:
                    signal.alarm(0)
                    signal.signal(signal.SIGALRM, old)
        else:
            def wrapper(*a, **kw):
                with concurrent.futures.ThreadPoolExecutor() as ex:
                    fut = ex.submit(fn, *a, **kw)
                    try:
                        return fut.result(timeout=seconds)
                    except concurrent.futures.TimeoutError:
                        raise TimeoutError(f"{fn.__name__} timed out after {seconds}s")
        return functools.wraps(fn)(wrapper)
    return decorator

def generate_summary(article_title, english_level):
    """Generate an article summary using OpenAI API"""
    if not client:
        return generate_fallback_summary(article_title, english_level)
    
    # Define complexity based on English level
    complexity = {
        'elementary': 'Use simple vocabulary and grammar suitable for A1-A2 English level. Use short sentences (maximum 8-10 words). Avoid complex words, idioms, and phrasal verbs. Use simple present and past tenses only. Explain any technical terms.',
        'intermediate': 'Use vocabulary and grammar suitable for B1-B2 English level. Use a mix of simple and compound sentences. Include some common idioms and phrasal verbs, but explain them if they are important to understanding. Use a variety of tenses.',
        'professional': 'Use advanced vocabulary and grammar suitable for C1-C2 English level. Use complex sentence structures, academic vocabulary, varied tenses, and specialized terminology appropriate to the subject. Do not simplify content.'
    }.get(english_level, 'Use vocabulary and grammar suitable for B1-B2 English level.')
    
    prompt = f"""
    Write a comprehensive summary about "{article_title}" for {english_level} level English learners.
    
    {complexity}
    
    Format requirements:
    1. Begin with a clear title
    2. Structure the content with clear paragraphs and headings
    3. Conclude with 2-3 sentences summarizing the main points
    
    Make the summary engaging, educational, and factually accurate. Maintain all important information while adapting the language to the appropriate level.
    """
    
    try:
        def make_openai_call():
            return client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=3000,
                temperature=0.7
            )
        
        response = make_openai_call()
        return response.choices[0].message.content
    except Exception as e:
        log.error(f"OpenAI error: {e}")
        return generate_fallback_summary(article_title, english_level)

def generate_fallback_summary(article_title, english_level):
    """Generate a fallback summary when OpenAI is unavailable"""
    level_text = {
        'elementary': 'Elementary (A1-A2)',
        'intermediate': 'Intermediate (B1-B2)', 
        'professional': 'Professional (C1-C2)'
    }.get(english_level, 'Intermediate (B1-B2)')
    
    return f"""
    <h1>Summary: {article_title}</h1>
    <h2>{level_text} English Summary</h2>
    <p>This is an educational summary about {article_title}. The AI summary service is currently unavailable, but you can still read the full Wikipedia article above to learn more about this topic.</p>
    <p>To practice your English skills, try reading the article and looking up any new vocabulary words you encounter. This will help improve your reading comprehension and expand your knowledge.</p>
    <p><strong>Study Tips:</strong></p>
    <ul>
        <li>Read the article slowly and carefully</li>
        <li>Write down new vocabulary words</li>
        <li>Try to summarize each paragraph in your own words</li>
        <li>Look for the main ideas and supporting details</li>
    </ul>
    """

def generate_lesson(article_title: str, english_level: str) -> str:
    if not article_title:
        raise ValueError("article_title is required")
    """Generate a comprehensive lesson using OpenAI API"""
    if not client:
        return generate_fallback_lesson(article_title, english_level)
    
    level_description = {
        'elementary': 'A1-A2 level (elementary) - Use simple vocabulary and grammar. Focus on basic sentence structures, common everyday words, and simple present and past tenses.',
        'intermediate': 'B1-B2 level (intermediate) - Use a moderate range of vocabulary and grammar structures. Include some idioms and phrasal verbs with explanations. Use various tenses and conditional forms.',
        'professional': 'C1-C2 level (professional) - Use advanced vocabulary, complex grammar structures, idiomatic expressions, and academic language. Challenge the learner with sophisticated content.'
    }.get(english_level, 'B1-B2 level (intermediate)')
    
    prompt = f"""
    Create a comprehensive English language lesson plan based on the following Wikipedia article, suitable for {level_description} English learners.
    
    Your lesson plan must include exactly these sections, formatted with clean HTML:
    
    <h1>English Lesson: [Topic]</h1>
    
    <h2>1. Vocabulary (Exactly 10 New Words)</h2>
    - Create a well-formatted HTML table with exactly 10 new vocabulary words from the article
    - For each word, include: Word, Part of Speech, Definition, Example Sentence 
    - Choose words appropriate for the {english_level} level English learner
    
    <h2>2. Reading Comprehension</h2>
    <h3>Summary</h3>
    - Create a level-appropriate summary of the article (3-4 paragraphs)
    
    <h3>True/False Questions</h3>
    - Create 5 true/false questions about the article
    - Format with expandable answers: <details><summary>Show answer</summary>True/False</details>
    
    <h3>Wh- Questions</h3>
    - Create 5 questions (What/Who/Where/When/Why/How)
    - Format with expandable answers: <details><summary>Show answer</summary>Answer</details>
    
    <h2>3. Word Matching Exercise</h2>
    - Create a two-column table (Word | Definition)
    - Add an Answer Key with expandable section
    
    <h2>4. Fill in the Blanks</h2>
    - Create one paragraph with 8-10 blanks
    - Show the Word Bank as an unordered list
    - Add expandable completed text section
    
    <h2>5. Discussion (Speaking Practice)</h2>
    - Provide 3 discussion questions related to the article topic
    - For each question, include 2-3 guiding points
    
    <h2>6. Essay Theme</h2>
    - Provide a writing prompt related to the article topic
    - Include specific requirements (word count, elements to include, etc.)
    - Tailor the difficulty to the {english_level} level
    
    Use proper HTML formatting with tables for all exercises. Make the lesson engaging, practical, and focused on real language use.
    
    Article title:
    {article_title}
    """
    
    try:
        def make_openai_call():
            return client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=3000,
                temperature=0.7
            )
        
        response = make_openai_call()
        return response.choices[0].message.content
    except Exception as e:
        log.error(f"OpenAI error: {e}")
        return generate_fallback_lesson(article_title, english_level)

def generate_fallback_lesson(article_content, english_level):
    """Generate a fallback lesson when OpenAI is unavailable"""
    article_title = "Learning Topic"
    level_text = {
        'elementary': 'Elementary (A1-A2)',
        'intermediate': 'Intermediate (B1-B2)', 
        'professional': 'Professional (C1-C2)'
    }.get(english_level, 'Intermediate (B1-B2)')
    
    return f"""
    <h1>English Lesson</h1>
    <h2>{level_text} Level</h2>
    <p>The AI lesson generator is currently unavailable. However, you can still practice your English with this article using these learning activities:</p>
    
    <h2>1. Reading Comprehension</h2>
    <p>Read the Wikipedia article above carefully and practice these skills:</p>
    <ul>
        <li>Identify the main topic and key points</li>
        <li>Look for new vocabulary words</li>
        <li>Notice sentence structures and grammar patterns</li>
    </ul>
    
    <h2>2. Vocabulary Practice</h2>
    <p>As you read, write down:</p>
    <ul>
        <li>Words you don't know</li>
        <li>Technical terms related to the topic</li>
        <li>Phrases that seem important</li>
    </ul>
    
    <h2>3. Discussion Questions</h2>
    <ol>
        <li>What is the main subject of this article?</li>
        <li>What new information did you learn?</li>
        <li>How does this topic connect to your interests or daily life?</li>
    </ol>
    
    <h2>4. Writing Exercise</h2>
    <p>Try to write a short summary of the article in your own words. This will help you practice expressing ideas clearly in English.</p>
    """

def generate_exercise(article_title, english_level, exercise_type):
    """Generate specific exercises using OpenAI API"""
    if not client:
        return generate_fallback_exercise(article_title, english_level, exercise_type)
    
    prompts = {
        "grammar": f"""
You are an experienced ESL content writer.

Create exactly **10 grammar exercises** based on the article “{article_title}”.
Take into account the learners’ level: **{english_level}**.
Focus on 1-2 grammar points that the article naturally illustrates (e.g. Past Simple vs Present Perfect, passive voice, modal verbs).

Return the output as **pure HTML** using *exactly* this skeleton:

<div class="lesson-section">
  <h2>Grammar Exercises</h2>
  <ol>
    <!-- Repeat 10× -->
    <li>
      📄 <strong>Question #{{n}}:</strong> <em>write the question here</em>
      <details><summary>Show answer</summary>Correct answer + brief explanation (1–2 sentences).</details>
    </li>
    <!-- … -->
  </ol>
</div>
""",

        "vocabulary": f"""
You are an ESL materials writer.

Select **12 key words / phrases** from the article “{article_title}” that a **{english_level}** learner should know.

For each word provide:  
1. The word itself.  
2. A concise definition (≤ 15 words, plain English).  
3. An example sentence from the article context with the word **blanked**: use “_____”.

Return strictly **HTML** with this structure:

<div class="lesson-section">
  <h2>Vocabulary Trainer</h2>
  <table>
    <thead><tr>
      <th>Word</th><th>Definition</th><th>Example (gap-fill)</th>
    </tr></thead>
    <tbody>
      <!-- 12 rows -->
      <tr>
        <td>example</td><td>a thing that …</td><td>He gave an _____ of …</td>
      </tr>
      <!-- … -->
    </tbody>
  </table>
  <p><em>Answers:</em></p>
  <ol>
    <!-- 12 answers to the gap-fill sentences -->
    <li>1 — example</li>
    <!-- … -->
  </ol>
</div>
""",
        "extra": f"""
You are an ESL lesson designer.

Create an “Extra Practice” block for the article “{article_title}”, level **{english_level}**.

Content:  
* **5 comprehension questions** (factual, answerable from the text).  
* **5 discussion prompts** (open-ended opinion questions).  
* **1 short writing task** (≈ 60 words) related to the topic.

Output **pure HTML** exactly like this:

<div class="lesson-section">
  <h2>Extra Practice</h2>

  <h3>Comprehension Check</h3>
  <ol>
    <!-- 5× -->
    <li>
      Question #{{n}}
      <details><summary>Show answer</summary>Answer sentence.</details>
    </li>
  </ol>

  <h3>Discuss</h3>
  <ul>
    <!-- 5× -->
    <li>Open question #{{n}}</li>
  </ul>

  <h3>Writing Task</h3>
  <p>Write ≈60 words: <em>prompt text…</em></p>
</div>
"""
}
    
    prompt = prompts.get(exercise_type, prompts['extra'])
    
    try:
        def make_openai_call():
            return client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2000,
                temperature=0.7
            )
        
        response = make_openai_call()
        return response.choices[0].message.content
    except Exception as e:
        log.error(f"OpenAI error: {e}")
        return generate_fallback_exercise(article_title, english_level, exercise_type)

def generate_fallback_exercise(article_title, english_level, exercise_type):
    """Generate fallback exercises when OpenAI is unavailable"""
    level_text = {
        'elementary': 'Elementary (A1-A2)',
        'intermediate': 'Intermediate (B1-B2)', 
        'professional': 'Professional (C1-C2)'
    }.get(english_level, 'Intermediate (B1-B2)')
    
    if exercise_type == 'grammar':
        return f"""
        <h1>Grammar Exercise - {level_text}</h1>
        <p>The AI exercise generator is currently unavailable. Practice grammar with these activities related to {article_title}:</p>
        
        <h2>Grammar Practice Activities</h2>
        <ol>
            <li><strong>Sentence Analysis:</strong> Find 5 complex sentences in the article and identify the main clause and subordinate clauses.</li>
            <li><strong>Tense Practice:</strong> Look for examples of different verb tenses in the article and write down 3 examples of each tense you find.</li>
            <li><strong>Article Usage:</strong> Notice how "a," "an," and "the" are used in the text. Write down 10 examples.</li>
            <li><strong>Passive Voice:</strong> Find sentences written in passive voice and rewrite them in active voice.</li>
            <li><strong>Conditional Sentences:</strong> Look for any conditional statements and identify their type.</li>
        </ol>
        """
    elif exercise_type == 'vocabulary':
        return f"""
        <h1>Vocabulary Exercise - {level_text}</h1>
        <p>The AI exercise generator is currently unavailable. Practice vocabulary with these activities related to {article_title}:</p>
        
        <h2>Vocabulary Building Activities</h2>
        <ol>
            <li><strong>Word Collection:</strong> Find 20 new vocabulary words from the article and write their definitions.</li>
            <li><strong>Context Clues:</strong> Choose 10 difficult words and try to guess their meaning from context before looking them up.</li>
            <li><strong>Word Families:</strong> Find words that belong to the same word family (e.g., create, creation, creative).</li>
            <li><strong>Synonyms and Antonyms:</strong> For 15 key words from the article, find synonyms and antonyms.</li>
            <li><strong>Usage Practice:</strong> Write original sentences using 10 new vocabulary words from the article.</li>
        </ol>
        """
    else:
        return f"""
        <h1>Extra Practice Exercise - {level_text}</h1>
        <p>The AI exercise generator is currently unavailable. Practice English with these activities related to {article_title}:</p>
        
        <h2>Comprehensive Practice Activities</h2>
        <ol>
            <li><strong>Summary Writing:</strong> Write a 150-word summary of the article in your own words.</li>
            <li><strong>Question Formation:</strong> Create 10 questions about the article content that test comprehension.</li>
            <li><strong>Opinion Essay:</strong> Write a short essay expressing your opinion about the topic (200-300 words).</li>
            <li><strong>Presentation Prep:</strong> Prepare a 5-minute presentation about the topic for classmates.</li>
            <li><strong>Research Extension:</strong> Find one additional source about this topic and compare the information.</li>
        </ol>
        """
