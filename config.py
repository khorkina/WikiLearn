import os
import os
from dotenv import load_dotenv
load_dotenv()
try:
    from dotenv import load_dotenv
    load_dotenv()
except ModuleNotFoundError:
    pass

GENIUS_ACCESS_TOKEN = os.getenv("GENIUS_ACCESS_TOKEN")
if not GENIUS_ACCESS_TOKEN:
    raise RuntimeError("GENIUS_ACCESS_TOKEN is not set")

from os import getenv
GENIUS_TOKEN = os.getenv("GENIUS_ACCESS_TOKEN")   # ← уже сделали

# если токен пуст– выводим понятную ошибку
if not GENIUS_TOKEN:
    raise RuntimeError("Set GENIUS_ACCESS_TOKEN in your environment")
# … существующие …
from os import getenv
GENIUS_TOKEN = getenv("GENIUS_ACCESS_TOKEN")

SONG_GENRES = [
    "Pop", "Rock", "Hip-Hop", "R&B", "Country",
    "Indie", "Electronic", "Metal", "Jazz", "Classical"
]

# Wikipedia API configuration
WIKIPEDIA_API_ENDPOINT = "https://en.wikipedia.org/w/api.php"

# English levels
ENGLISH_LEVELS = {
    'elementary': 'Elementary (A1-A2)',
    'intermediate': 'Intermediate (B1-B2)',
    'professional': 'Professional (C1-C2)'
}

# Categories for the homepage
CATEGORIES = [
    {"name": "Politics", "icon": "vote-yea"},
    {"name": "Art", "icon": "palette"},
    {"name": "History", "icon": "landmark"},
    {"name": "Culture", "icon": "globe-americas"},
    {"name": "Literature", "icon": "book-open"},
    {"name": "Music", "icon": "music"},
    {"name": "Science", "icon": "flask"},
    {"name": "Technology", "icon": "microchip"},
    {"name": "Sports", "icon": "futbol"},
    {"name": "Philosophy", "icon": "brain"},
    {"name": "Religion", "icon": "pray"},
    {"name": "Film", "icon": "film"},
    {"name": "Food", "icon": "utensils"},
    {"name": "Geography", "icon": "map-marked-alt"},
    {"name": "Architecture", "icon": "building"},
    {"name": "Business", "icon": "briefcase"},
]

# Map categories to subcategories
SUBCATEGORIES = {
    "Politics": ["Democracy", "International Relations", "Political Ideologies", "Political Movements", "Elections"],
    "Art": ["Painting", "Sculpture", "Photography", "Modern Art", "Classical Art", "Art Movements"],
    "History": ["Ancient History", "Medieval Period", "Renaissance", "Industrial Revolution", "20th Century", "World Wars"],
    "Culture": ["Traditions", "Folklore", "Customs", "Festivals", "Cultural Movements"],
    "Literature": ["Poetry", "Fiction", "Drama", "Literary Movements", "Classical Literature", "Modern Literature"],
    "Music": ["Classical", "Jazz", "Rock", "Hip Hop", "Electronic", "Folk", "Pop"],
    "Science": ["Physics", "Chemistry", "Biology", "Astronomy", "Geology", "Medicine"],
    "Technology": ["Computing", "Internet", "Artificial Intelligence", "Robotics", "Space Technology"],
    "Sports": ["Football", "Basketball", "Tennis", "Swimming", "Athletics", "Winter Sports"],
    "Philosophy": ["Ancient Philosophy", "Modern Philosophy", "Ethics", "Logic", "Metaphysics"],
    "Religion": ["Christianity", "Islam", "Buddhism", "Hinduism", "Judaism", "Mythology"],
    "Film": ["Directors", "Genres", "Film History", "Cinema Movements", "Film Technology"],
    "Food": ["Cuisine", "Cooking Methods", "Ingredients", "Food Culture", "Beverages"],
    "Geography": ["Continents", "Countries", "Oceans", "Mountains", "Climate", "Ecosystems"],
    "Architecture": ["Ancient Architecture", "Modern Architecture", "Architectural Styles", "Famous Buildings", "Urban Planning"],
    "Business": ["Economics", "Finance", "Marketing", "Entrepreneurship", "Management", "International Trade"
    ]
}
