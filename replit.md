# WikiLearn - Educational Platform

## Overview

WikiLearn is a Flask-based web application that creates personalized English language learning experiences using Wikipedia content. The platform allows users to select topics of interest, choose their English proficiency level, and receive AI-generated summaries, lessons, and exercises tailored to their learning needs.

## System Architecture

### Frontend Architecture
- **Template Engine**: Jinja2-based HTML templates with Bootstrap 5 styling
- **CSS Framework**: Custom CSS with Bootstrap integration, featuring a KoFi-inspired design (white background, beige accents, light blue and red highlights)
- **JavaScript**: Vanilla JavaScript with modular structure for API interactions, infinite scrolling, and AI content generation
- **Responsive Design**: Mobile-first approach with flexible layouts

### Backend Architecture
- **Framework**: Flask 2.3.3 with minimal configuration
- **API Design**: RESTful endpoints for Wikipedia content retrieval and AI service integration
- **Session Management**: Flask-Session for user state management
- **Error Handling**: Comprehensive logging and graceful error recovery

### AI Integration
- **Primary Service**: OpenAI GPT-4o for content generation
- **Fallback Strategy**: Multiple model attempts with retry logic
- **Content Types**: Summaries, lessons, exercises, and vocabulary training
- **Adaptive Learning**: Content adjusted based on user's English proficiency level

## Key Components

### 1. Wikipedia API Integration (`wikipedia_api.py`)
- **Purpose**: Fetches articles, categories, and content from Wikipedia
- **Features**: Category browsing, article search, image filtering, pagination support
- **API Endpoint**: Uses official Wikipedia API with structured queries

### 2. OpenAI Service (`openai_service.py`)
- **Model**: GPT-4o (latest available model as of May 2024)
- **Timeout Handling**: Cross-platform timeout implementation (SIGALRM on Unix, ThreadPool on Windows)
- **Retry Logic**: Exponential backoff with randomization
- **Content Generation**: Summaries, lessons, and exercises tailored to English proficiency levels

### 3. Configuration Management (`config.py`)
- **Categories**: 16 predefined learning categories (Science, History, Geography, etc.)
- **Subcategories**: Hierarchical organization for better content discovery
- **English Levels**: Elementary (A1-A2), Intermediate (B1-B2), Professional (C1-C2)

### 4. Route Handlers (`routes.py`)
- **Category Navigation**: Hierarchical browsing from categories to subcategories to articles
- **Article Display**: Full article rendering with AI enhancement options
- **API Endpoints**: JSON responses for dynamic content loading

### 5. Frontend JavaScript Modules
- **Infinite Scroll** (`infinite_scroll.js`): Smooth article loading with deduplication
- **Wikipedia API** (`wikipedia_api.js`): Client-side API interactions
- **Puter Enhanced** (`puter_enhanced.js`): AI content generation with error handling

## Data Flow

1. **User Navigation**: Category → Subcategory → Articles
2. **Content Retrieval**: Wikipedia API fetches articles with metadata
3. **Content Enhancement**: OpenAI generates educational content based on user's English level
4. **Dynamic Loading**: Infinite scroll provides seamless browsing experience
5. **Personalization**: Content adapts to selected English proficiency level

## External Dependencies

### Core Dependencies
- **Flask Ecosystem**: Flask, Flask-SQLAlchemy, Flask-Session
- **HTTP Requests**: requests, urllib3, certifi
- **Content Processing**: trafilatura, markdown, python-docx
- **AI Services**: openai
- **Database**: psycopg2-binary (PostgreSQL support)
- **Validation**: email-validator

### Frontend Libraries
- **Bootstrap 5.1.3**: UI framework and responsive design
- **Font Awesome 6.0.0**: Icon library
- **Intersection Observer Polyfill**: Browser compatibility for infinite scroll

### API Services
- **Wikipedia API**: Article content and metadata retrieval
- **OpenAI API**: AI-powered content generation and enhancement

## Deployment Strategy

### Production Considerations
- **WSGI Server**: Gunicorn 23.0.0 for production deployment
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Environment Variables**: 
  - `OPENAI_API_KEY`: Required for AI functionality
  - `SESSION_SECRET`: Flask session security
- **Static Assets**: CSS and JavaScript served via Flask static routes

### Scalability Features
- **Infinite Scroll**: Reduces initial page load time
- **Session Storage**: Caches generated content to reduce API calls
- **Timeout Management**: Prevents server hangs from slow API responses
- **Error Recovery**: Graceful degradation when AI services are unavailable

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 06, 2025. Initial setup