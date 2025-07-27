import os

# Wikipedia API Configuration
WIKIPEDIA_API_ENDPOINT = "https://en.wikipedia.org/w/api.php"

# OpenAI API Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Categories and subcategories for navigation
CATEGORIES = [
    {"name": "Science", "icon": "microscope"},
    {"name": "History", "icon": "landmark"},
    {"name": "Geography", "icon": "globe"},
    {"name": "Technology", "icon": "laptop"},
    {"name": "Arts", "icon": "palette"},
    {"name": "Sports", "icon": "futbol"},
    {"name": "Literature", "icon": "book"},
    {"name": "Music", "icon": "music"},
    {"name": "Business", "icon": "briefcase"},
    {"name": "Health", "icon": "heartbeat"},
    {"name": "Environment", "icon": "leaf"},
    {"name": "Philosophy", "icon": "brain"},
    {"name": "Culture", "icon": "globe-americas"},
    {"name": "Politics", "icon": "balance-scale"},
    {"name": "Economy", "icon": "chart-line"},
    {"name": "Education", "icon": "graduation-cap"},
]

SUBCATEGORIES = {
    "Science": [
        "Physics", "Chemistry", "Biology", "Mathematics", "Astronomy",
        "Medicine", "Environmental Science", "Computer Science"
    ],
    "History": [
        "Ancient History", "Medieval History", "Modern History", "World War I",
        "World War II", "American History", "European History", "Asian History"
    ],
    "Geography": [
        "Countries", "Cities", "Mountains", "Rivers", "Oceans",
        "Continents", "Climate", "Natural Disasters"
    ],
    "Technology": [
        "Artificial Intelligence", "Internet", "Mobile Technology", "Space Technology",
        "Transportation", "Energy", "Robotics", "Biotechnology"
    ],
    "Arts": [
        "Painting", "Sculpture", "Architecture", "Photography", "Cinema",
        "Theater", "Dance", "Design"
    ],
    "Sports": [
        "Football", "Basketball", "Tennis", "Swimming", "Athletics",
        "Winter Sports", "Combat Sports", "Motor Sports"
    ],
    "Literature": [
        "Fiction", "Poetry", "Drama", "Non-fiction", "Science Fiction",
        "Fantasy", "Mystery", "Biography"
    ],
    "Music": [
        "Classical Music", "Jazz", "Rock", "Pop", "Electronic Music",
        "Folk Music", "Opera", "World Music"
    ],
    "Business": [
        "Management", "Marketing", "Finance", "Entrepreneurship", "Economics",
        "Leadership", "Strategy", "International Business"
    ],
    "Health": [
        "Nutrition", "Mental Health", "Exercise", "Medical Research", "Public Health",
        "Healthcare Systems", "Diseases", "Wellness"
    ],
    "Environment": [
        "Climate Change", "Conservation", "Renewable Energy", "Pollution", "Biodiversity",
        "Sustainability", "Natural Resources", "Ecology"
    ],
    "Philosophy": [
        "Ethics", "Logic", "Metaphysics", "Political Philosophy", "Philosophy of Mind",
        "Ancient Philosophy", "Modern Philosophy", "Eastern Philosophy"
    ],
    "Culture": [
        "Traditions", "Festivals", "Languages", "Customs", "Religion",
        "Social Movements", "Cultural Heritage", "Anthropology"
    ],
    "Politics": [
        "Government Systems", "International Relations", "Political Theory", "Elections",
        "Public Policy", "Diplomacy", "Political History", "Civil Rights"
    ],
    "Economy": [
        "Economic Theory", "Global Economy", "Trade", "Banking", "Stock Market",
        "Economic History", "Development Economics", "Monetary Policy"
    ],
    "Education": [
        "Teaching Methods", "Educational Psychology", "Curriculum", "Higher Education",
        "Online Learning", "Educational Technology", "Language Learning", "Academic Research"
    ]
}

# English proficiency levels
ENGLISH_LEVELS = {
    "elementary": "Elementary (A1-A2)",
    "intermediate": "Intermediate (B1-B2)", 
    "professional": "Professional (C1-C2)"
}
