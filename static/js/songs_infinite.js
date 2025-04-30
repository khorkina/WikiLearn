document.addEventListener('DOMContentLoaded', () => {
    const feed  = document.getElementById('song-feed');
    const loadI = document.getElementById('loading-indicator');
    let page = 1, loading=false, genre = location.pathname.split('/').pop();
  
    const load = async () => {
      if(loading) return;
      loading = true; loadI.classList.remove('d-none');
      const res = await fetch(`/api/songs/${genre}?page=${page}`).then(r=>r.json());
      res.forEach(s=>{
        feed.insertAdjacentHTML('beforeend', `
          <a href="/song/${s.id}" class="article-card">
            <img src="${s.thumb}" class="article-img">
            <div class="article-content">
              <h4 class="article-title">${s.title}</h4>
              <p class="article-excerpt">${s.artist}</p>
            </div>
          </a>`);
      });
      page++; loading=false; loadI.classList.add('d-none');
    };
    load();                       // first load
    window.addEventListener('scroll', () => {
      if(window.innerHeight + window.scrollY >= document.body.offsetHeight - 800)
        load();
    });
  });
  