import os
import logging
from flask import (
    render_template, jsonify, request, redirect, abort
)

from app import app
from wikipedia_api import get_category_articles, get_full_article
from openai_service import generate_summary, generate_lesson, generate_exercise
from config import (
    CATEGORIES, SUBCATEGORIES, ENGLISH_LEVELS
)

log = logging.getLogger(__name__)

# ------------------------------------------------------------------
# Wikipedia routes
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

# ------------------------------------------------------------------
# OpenAI API routes
# ------------------------------------------------------------------

@app.route("/api/generate-summary", methods=["POST"])
def api_generate_summary():
    """Generate article summary using OpenAI"""
    data = request.get_json()
    article_title = data.get("article_title")
    english_level = data.get("english_level", "intermediate")
    
    try:
        summary = generate_summary(article_title, english_level)
        return jsonify({"success": True, "summary": summary})
    except Exception as e:
        log.error(f"Summary generation failed: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/generate-lesson", methods=["POST"])
def api_generate_lesson():
    """Generate lesson plan using OpenAI"""
    data = request.get_json()
    article_title = data.get("article_title")  
    english_level = data.get("english_level", "intermediate")

    
    try:
        lesson = generate_lesson(article_title, english_level)
        return jsonify({"success": True, "lesson": lesson})
    except Exception as e:
        log.error(f"Lesson generation failed: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/generate-exercise", methods=["POST"])
def api_generate_exercise():
    """Generate specific exercises using OpenAI"""
    data = request.get_json()
    article_title = data.get("article_title")
    english_level = data.get("english_level", "intermediate")
    exercise_type = data.get("exercise_type", "extra")
    
    try:
        exercise = generate_exercise(article_title, english_level, exercise_type)
        return jsonify({"success": True, "exercise": exercise})
    except Exception as e:
        log.error(f"Exercise generation failed: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
