import os
import logging
from flask import (
    render_template, jsonify, request, redirect, abort
)

from app import app
from wikipedia_api import get_category_articles, get_full_article
from config import (
    CATEGORIES, SUBCATEGORIES, ENGLISH_LEVELS,
    SONG_GENRES, GENIUS_TOKEN
)

import lyricsgenius

log = logging.getLogger(__name__)

# ------------------------------------------------------------------
# 1.  Genius API инициализация
# ------------------------------------------------------------------
genius = lyricsgenius.Genius(
    GENIUS_TOKEN,
    skip_non_songs=True,
    excluded_terms=["(Remix)", "(Live)"],
    remove_section_headers=True,
    retries=3,
)

# ------------------------------------------------------------------
# 2.  Песенные разделы
# ------------------------------------------------------------------
@app.route("/songs")
def songs_genres():
    """Список жанров (простая страница-меню)."""
    return render_template("songs_genres.html", genres=SONG_GENRES)


@app.route("/songs/<genre>")
def songs_feed(genre):
    """Лента песен конкретного жанра (HTML)."""
    if genre not in SONG_GENRES:
        abort(404)
    return render_template("songs_feed.html", genre=genre)


@app.route("/api/songs/<genre>")
def api_songs(genre):
    """JSON-эндпоинт для ∞-скролла."""
    if genre not in SONG_GENRES:
        return jsonify([])

    page     = int(request.args.get("page", 1))
    per_page = 10
    # у LyricsGenius нужный метод — search_songs
    try:
        search = genius.search_songs(genre, per_page=per_page, page=page)
    except Exception as e:               # noqa: BLE001
        log.exception("Genius search failed: %s", e)
        abort(502)

    hits = search.get("hits", [])
    items = [
        {
            "id":     h["result"]["id"],
            "title":  h["result"]["title"],
            "artist": h["result"]["primary_artist"]["name"],
            "thumb":  h["result"]["song_art_image_thumbnail_url"],
        }
        for h in hits
    ]
    return jsonify(items)


@app.route("/song/<int:song_id>")
def song_page(song_id):
    """Страница с текстом песни + кнопки «объяснить/урок»."""
    try:
        song   = genius.song(song_id)["song"]
        lyrics = genius.lyrics(song_id)
    except Exception:                    # noqa: BLE001
        abort(404)

    return render_template(
        "song.html",
        song=song,
        lyrics=lyrics,
        levels=ENGLISH_LEVELS,
    )

# ------------------------------------------------------------------
# 3.  Wikipedia разделы (как и были)
# ------------------------------------------------------------------
@app.route("/")
def index():
    return render_template("index.html", categories=CATEGORIES)


@app.route("/subcategories/<category>")
def subcategories(category):
    subs = SUBCATEGORIES.get(category, ["General"])
    return render_template(
        "subcategories.html",
        category=category,
        subcategories=subs,
    )


@app.route("/articles/<category>/<subcategory>")
def articles(category, subcategory):
    return render_template(
        "articles.html", category=category, subcategory=subcategory
    )


@app.route("/api/articles/<category>/<subcategory>")
def api_articles(category, subcategory):
    images_only   = request.args.get("images_only") == "true"
    continue_from = request.args.get("continue")

    try:
        data, token = get_category_articles(
            category, subcategory, images_only, continue_from
        )
        return jsonify({"articles": data, "continue": token})
    except Exception as e:               # noqa: BLE001
        log.exception(e)
        return jsonify({"error": str(e), "articles": []}), 500


@app.route("/article/<path:title>")
def article(title):
    try:
        art = get_full_article(title)
        return render_template(
            "article.html", article=art, english_levels=ENGLISH_LEVELS
        )
    except Exception as e:               # noqa: BLE001
        log.exception(e)
        return render_template("article.html", error=str(e))


@app.route("/summary/<path:title>")
def summary(title):
    level = request.args.get("level", "intermediate")
    art   = get_full_article(title)
    return render_template(
        "summary.html",
        article=art,
        english_level=level,
        english_levels=ENGLISH_LEVELS,
    )


@app.route("/lesson/<path:title>")
def lesson(title):
    level = request.args.get("level", "intermediate")
    art   = get_full_article(title)
    return render_template(
        "lesson.html",
        article=art,
        english_level=level,
        english_levels=ENGLISH_LEVELS,
    )
