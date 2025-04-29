# stock_sentiment.py

import os
import nltk
nltk_data_dir = os.path.abspath('./nltk_data')
nltk.data.path.insert(0, nltk_data_dir)

import praw
import pandas as pd
import numpy as np
import yfinance as yf
from nltk.sentiment import SentimentIntensityAnalyzer
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

class StockSentimentAnalyzer:
    def __init__(self):
        self.reddit = praw.Reddit(
            client_id=os.getenv('REDDIT_CLIENT_ID'),
            client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
            user_agent=os.getenv('REDDIT_USER_AGENT')
        )
        self.sia = SentimentIntensityAnalyzer()

    def get_reddit_posts(self, stock_symbol, limit=100):
        posts = []
        for post in self.reddit.subreddit('stocks+investing+wallstreetbets').search(
            f'{stock_symbol} stock', limit=limit
        ):
            posts.append({
                'title': post.title,
                'text': post.selftext,
                'score': post.score,
                'created_utc': datetime.fromtimestamp(post.created_utc)
            })
        return pd.DataFrame(posts)

    def analyze_sentiment(self, text):
        return self.sia.polarity_scores(text)['compound']

    def get_stock_data(self, stock_symbol, days=30):
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        stock = yf.Ticker(stock_symbol)
        return stock.history(start=start_date, end=end_date)

    def predict_trend(self, stock_symbol):
        posts_df = self.get_reddit_posts(stock_symbol)
        
        posts_df['sentiment'] = posts_df['text'].apply(self.analyze_sentiment)
        avg_sentiment = posts_df['sentiment'].mean()
        
        stock_data = self.get_stock_data(stock_symbol)
        
        if avg_sentiment > 0.2:
            return "Bullish (Positive sentiment detected)"
        elif avg_sentiment < -0.2:
            return "Bearish (Negative sentiment detected)"
        else:
            return "Neutral (Mixed sentiment)"

def main():
    analyzer = StockSentimentAnalyzer()
    
    stock_symbol = input("Enter stock symbol (e.g., AAPL): ").upper()
    
    try:
        prediction = analyzer.predict_trend(stock_symbol)
        print(f"\nAnalysis for {stock_symbol}:")
        print(prediction)
        
        posts = analyzer.get_reddit_posts(stock_symbol, limit=5)
        print("\nRecent Reddit posts about this stock:")
        for _, post in posts.iterrows():
            print(f"\nTitle: {post['title']}")
            print(f"Sentiment: {analyzer.analyze_sentiment(post['text']):.2f}")
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()