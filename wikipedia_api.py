import requests
import json
import logging
from config import WIKIPEDIA_API_ENDPOINT

def get_subcategories(category):
    """
    Get subcategories for a given Wikipedia category
    """
    params = {
        'action': 'query',
        'list': 'categorymembers',
        'cmtitle': f'Category:{category}',
        'cmtype': 'subcat',
        'format': 'json',
        'cmlimit': 20
    }
    
    response = requests.get(WIKIPEDIA_API_ENDPOINT, params=params)
    data = response.json()
    
    subcategories = []
    if 'query' in data and 'categorymembers' in data['query']:
        for member in data['query']['categorymembers']:
            subcategory = member['title'].replace('Category:', '')
            subcategories.append(subcategory)
    
    return subcategories

def get_category_articles(category, subcategory, images_only=False, continue_from=None):
    """
    Get articles from a specific category and subcategory
    Optionally filter to only include articles with images
    Support continuation for infinite scrolling
    Results are ordered randomly for variety
    """
    search_term = f"{category} {subcategory}" if subcategory != "General" else category
    
    # Use both search and random order to get more interesting results
    if continue_from and int(continue_from) > 100:
        # After a certain number of articles, expand the search to related topics
        # for a more engaging infinite scrolling experience
        search_term = f"{search_term} related"
    
    params = {
        'action': 'query',
        'generator': 'search',
        'gsrsearch': search_term,
        'gsrlimit': 10,
        'prop': 'extracts|pageimages|info',
        'exintro': True,
        'explaintext': True,
        'piprop': 'original',
        'inprop': 'url',
        'format': 'json',
        # Add random sort parameter for variety
        'gsrinfo': 'totalhits',
        'gsrsort': 'random' if not continue_from else 'relevance'  # First page random, then relevance for continuity
    }
    
    if continue_from:
        params['gsroffset'] = continue_from
    
    response = requests.get(WIKIPEDIA_API_ENDPOINT, params=params)
    data = response.json()
    
    articles = []
    continue_token = None
    
    if 'query' in data and 'pages' in data['query']:
        for page_id, page_data in data['query']['pages'].items():
            # Get image information
            image_url = None
            if 'original' in page_data:
                image_url = page_data['original'].get('source')
            elif 'thumbnail' in page_data:
                image_url = page_data['thumbnail'].get('source')
            
            # If images_only is True, skip articles without images
            if images_only and not image_url:
                continue
                
            article = {
                'id': page_id,
                'title': page_data.get('title', 'Untitled'),
                'extract': page_data.get('extract', 'No description available').split('.')[0] + '.',
                'image': image_url,
                'url': page_data.get('fullurl', '')
            }
            articles.append(article)
    
    # Get continuation token for infinite scrolling
    if 'continue' in data and 'gsroffset' in data['continue']:
        continue_token = data['continue']['gsroffset']
    
    return articles, continue_token

def get_full_article(title):
    """
    Get the full content of a Wikipedia article by title
    """
    params = {
        'action': 'query',
        'titles': title,
        'prop': 'extracts|pageimages|info',
        'exsectionformat': 'wiki',
        'explaintext': False,
        'piprop': 'original',
        'inprop': 'url',
        'format': 'json'
    }
    
    response = requests.get(WIKIPEDIA_API_ENDPOINT, params=params)
    data = response.json()
    
    if 'query' in data and 'pages' in data['query']:
        for page_id, page_data in data['query']['pages'].items():
            article = {
                'id': page_id,
                'title': page_data.get('title', 'Untitled'),
                'content': page_data.get('extract', 'No content available'),
                'image': page_data.get('original', {}).get('source') if 'original' in page_data else None,
                'url': page_data.get('fullurl', '')
            }
            return article
    
    raise Exception("Article not found")
