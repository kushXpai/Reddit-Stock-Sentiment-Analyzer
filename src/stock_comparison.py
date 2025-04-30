# src/stock_comparison.py

import os
import nltk
nltk_data_dir = os.path.abspath('./nltk_data')
nltk.data.path.insert(0, nltk_data_dir)

from src.reddit_sentiment import RedditSentimentAnalyzer
from src.stock_data import StockDataFetcher
import pandas as pd

class StockComparison:
    def __init__(self):
        self.sentiment_analyzer = RedditSentimentAnalyzer()
        self.stock_fetcher = StockDataFetcher()
    
    def compare_stocks(self, stock_symbol1, stock_symbol2):
        """
        Compare sentiment and stock data for two different stock symbols
        
        Args:
            stock_symbol1 (str): First stock symbol to analyze
            stock_symbol2 (str): Second stock symbol to analyze
            
        Returns:
            dict: Comparison results including sentiment and stock data for both symbols
        """
        try:
            # Get sentiment data for both stocks
            sentiment_data1 = self.sentiment_analyzer.analyze_sentiment(stock_symbol1)
            sentiment_data2 = self.sentiment_analyzer.analyze_sentiment(stock_symbol2)
            
            # Get stock price data for both stocks
            stock_data1 = self.stock_fetcher.get_stock_data(stock_symbol1)
            stock_data2 = self.stock_fetcher.get_stock_data(stock_symbol2)
            
            # Create the comparison result
            result = {
                'stock_symbol1': stock_symbol1,
                'stock_symbol2': stock_symbol2,
                'sentiment1': sentiment_data1,
                'sentiment2': sentiment_data2,
                'stock_data1': stock_data1,
                'stock_data2': stock_data2
            }
            
            # Add comparative metrics if both sentiment analyses were successful
            if sentiment_data1.get('success', False) and sentiment_data2.get('success', False):
                result['comparison'] = self._calculate_comparison_metrics(
                    stock_symbol1, sentiment_data1,
                    stock_symbol2, sentiment_data2
                )
            
            return result
            
        except Exception as e:
            return {'error': str(e)}
    
    def _calculate_comparison_metrics(self, symbol1, sentiment1, symbol2, sentiment2):
        """
        Calculate additional comparative metrics between the two stocks
        
        Args:
            symbol1 (str): First stock symbol
            sentiment1 (dict): Sentiment data for first stock
            symbol2 (str): Second stock symbol
            sentiment2 (dict): Sentiment data for second stock
            
        Returns:
            dict: Comparison metrics
        """
        sentiment_diff = sentiment1['average_sentiment'] - sentiment2['average_sentiment']
        sentiment_ratio = abs(sentiment1['average_sentiment'] / sentiment2['average_sentiment']) if sentiment2['average_sentiment'] != 0 else float('inf')
        
        # Determine which stock has more positive sentiment
        more_positive = symbol1 if sentiment1['average_sentiment'] > sentiment2['average_sentiment'] else symbol2
        
        # Determine which stock has more posts (more discussion volume)
        more_posts = symbol1 if sentiment1['post_count'] > sentiment2['post_count'] else symbol2
        post_count_diff = abs(sentiment1['post_count'] - sentiment2['post_count'])
        
        # Create comparison metrics
        comparison = {
            'sentiment_difference': sentiment_diff,
            'sentiment_ratio': sentiment_ratio,
            'more_positive_stock': more_positive,
            'more_discussed_stock': more_posts,
            'post_count_difference': post_count_diff
        }
        
        return comparison