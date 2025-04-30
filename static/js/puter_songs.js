/* static/js/puter_songs.js
   создаёт «короткое объяснение» и «полный урок» по песне через Puter.js
   ------------------------------------------------------------------ */

document.addEventListener('DOMContentLoaded', () => {
/* --- выбор уровня --------------------------------------------------- */
const levelBtns = document.querySelectorAll('.english-level-btn');
let   level     = 'intermediate';
levelBtns.forEach(btn => btn.addEventListener('click', () => {
   levelBtns.forEach(x => x.classList.remove('active'));
   btn.classList.add('active');
   level = btn.dataset.level;
}));

/* --- элементы DOM ---------------------------------------------------- */
const out        = document.getElementById('song-output');
const title      = document.getElementById('song-title').value;
const lyricsText = document.getElementById('lyrics').value;

document.getElementById('explain-btn')
       .addEventListener('click', () => generate('explain'));
document.getElementById('lesson-btn')
       .addEventListener('click', () => generate('lesson'));

/* --- генерация через Puter ------------------------------------------ */
async function generate(mode){
   out.innerHTML =
     '<div class="loading"><div class="loading-spinner"></div>Generating…</div>';

   const complexity = {
     elementary : 'Use very simple words and only present tenses.',
     intermediate: 'Use clear B1-B2 English (mixed tenses, no slang).',
     professional: 'Use advanced C1 vocabulary and idioms.'
   }[level];

   const prompt = (mode === 'explain')
     ? `Explain the meaning and story of the song below in ${level} English.\n${complexity}\n\nLyrics:\n${lyricsText}`
     : `Create a full ESL lesson (vocabulary table, comprehension Qs, discussion, writing) based on the song «${title}». Target level: ${level}. Give clean, self-contained HTML only.\n\nLyrics:\n${lyricsText}`;

   try {
     const resp = await puter.ai.chat(prompt, { model: 'gpt-4o-mini' });
     out.innerHTML = formatAIResponse(resp);
   } catch (e) {
     console.error(e);
     out.innerHTML =
       `<p class="error-message">Generation failed: ${e.message}</p>`;
   }
}
});
