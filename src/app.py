# src/app.py

import os
import nltk
nltk_data_dir = os.path.abspath('./nltk_data')
nltk.data.path.insert(0, nltk_data_dir)

from flask import Flask, render_template, request, jsonify
from src.reddit_sentiment import RedditSentimentAnalyzer
from src.stock_data import StockDataFetcher
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

sentiment_analyzer = RedditSentimentAnalyzer()
stock_fetcher = StockDataFetcher()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        stock_symbol = request.form.get('stock_symbol', '').upper()
        
        sentiment_data = sentiment_analyzer.analyze_sentiment(stock_symbol)
        
        stock_data = stock_fetcher.get_stock_data(stock_symbol)
        
        result = {
            'stock_symbol': stock_symbol,
            'sentiment': sentiment_data,
            'stock_data': stock_data
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)