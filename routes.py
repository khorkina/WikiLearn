from flask import render_template, request, redirect, url_for, jsonify, session
from app import app
from wikipedia_api import get_category_articles, get_subcategories, get_full_article
from config import CATEGORIES, SUBCATEGORIES, ENGLISH_LEVELS
import logging
from flask import render_template, jsonify, request, abort
import lyricsgenius, requests, os, itertools
from config import GENIUS_TOKEN, SONG_GENRES, ENGLISH_LEVELS

genius = lyricsgenius.Genius(GENIUS_TOKEN, skip_non_songs=True,
                             excluded_terms=["(Remix)", "(Live)"],
                             remove_section_headers=True)

# 4.1  список жанров
@app.route("/songs")
def songs_genres():
    return render_template("songs_genres.html", genres=SONG_GENRES)

# 4.2  лента песен (HTML first + JSON for infinite scroll)
@app.route("/songs/<genre>")
def songs_feed(genre):
    if genre not in SONG_GENRES:
        abort(404)
    return render_template("songs_feed.html", genre=genre)

# API-эндпоинт подгрузки
@app.route("/api/songs/<genre>")
def api_songs(genre):
    page = int(request.args.get("page", 1))
    per  = 10
    if genre not in SONG_GENRES:
        return jsonify([])
    # Genius search — сортировка по популярности
    res = genius.search_lyrics(genre, per_page=per, page=page)
    items = [{
        "id": hit["result"]["id"],
        "title": hit["result"]["title"],
        "artist": hit["result"]["primary_artist"]["name"],
        "thumb": hit["result"]["song_art_image_thumbnail_url"]
    } for hit in res["sections"][0]["hits"]]
    return jsonify(items)

# 4.3  страница конкретной песни
@app.route("/song/<int:song_id>")
def song_page(song_id):
    try:
        song = genius.song(song_id)["song"]
        lyrics = genius.lyrics(song_id)
    except Exception:
        abort(404)
    return render_template("song.html",
                           song=song,
                           lyrics=lyrics,
                           levels=ENGLISH_LEVELS)


@app.route('/')
def index():
    """Render the homepage with categories"""
    return render_template('index.html', categories=CATEGORIES)
    
@app.route('/test-puter')
def test_puter():
    """Test page for Puter.js functionality"""
    return render_template('puter_test.html')
    
@app.route('/standalone-puter-test')
def standalone_puter_test():
    """Standalone test page for Puter.js that follows the official guide exactly"""
    return redirect('/static/puter_standalone_test.html')

@app.route('/subcategories/<category>')
def subcategories(category):
    """Display subcategories for the selected category"""
    if category in SUBCATEGORIES:
        subcats = SUBCATEGORIES[category]
        return render_template('subcategories.html', 
                              category=category, 
                              subcategories=subcats)
    else:
        # Default subcategories if the category doesn't exist
        return render_template('subcategories.html', 
                              category=category, 
                              subcategories=["General"])

@app.route('/articles/<category>/<subcategory>')
def articles(category, subcategory):
    """Display article feed for the selected subcategory"""
    return render_template('articles.html', 
                          category=category, 
                          subcategory=subcategory)

@app.route('/api/articles/<category>/<subcategory>')
def get_articles(category, subcategory):
    """API endpoint to get articles for infinite scroll"""
    images_only = request.args.get('images_only', 'false') == 'true'
    continue_from = request.args.get('continue', None)
    
    try:
        articles, continue_token = get_category_articles(category, subcategory, images_only, continue_from)
        return jsonify({
            'articles': articles,
            'continue': continue_token
        })
    except Exception as e:
        logging.error(f"Error fetching articles: {str(e)}")
        return jsonify({
            'error': str(e),
            'articles': [],
            'continue': None
        }), 500

@app.route('/article/<path:title>')
def article(title):
    """Display a full Wikipedia article"""
    try:
        article_data = get_full_article(title)
        return render_template('article.html', 
                              article=article_data,
                              english_levels=ENGLISH_LEVELS)
    except Exception as e:
        logging.error(f"Error fetching article '{title}': {str(e)}")
        return render_template('article.html', 
                              error=str(e),
                              english_levels=ENGLISH_LEVELS)

@app.route('/summary/<path:title>')
def summary(title):
    """Display the AI-generated summary based on English level"""
    english_level = request.args.get('level', 'intermediate')
    article_data = get_full_article(title)
    
    return render_template('summary.html',
                          article=article_data,
                          english_level=english_level,
                          english_levels=ENGLISH_LEVELS)

@app.route('/lesson/<path:title>')
def lesson(title):
    """Display the generated lesson"""
    english_level = request.args.get('level', 'intermediate')
    article_data = get_full_article(title)
    
    return render_template('lesson.html',
                          article=article_data,
                          english_level=english_level,
                          english_levels=ENGLISH_LEVELS)
