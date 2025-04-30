// src/static/js/single_analysis.js

function initSingleAnalysis() {
    document.getElementById('singleStockForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const stockSymbol = document.getElementById('singleStockSymbol').value;
        const resultsDiv = document.getElementById('singleResults');
        const footerErrorDiv = document.getElementById('singleFooterError');
        footerErrorDiv.innerHTML = '';
        resultsDiv.innerHTML = '<div class="loading"><i class="fas fa-circle-notch"></i> Analyzing sentiment for ' + stockSymbol + '. Please wait...</div>';
        
        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `stock_symbol=${stockSymbol}`
            });
            
            const data = await response.json();
            
            if (data.error) {
                resultsDiv.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> Error: ${data.error}</div>`;
                return;
            }
            
            let html = '<div class="results-container">';
            html += `<div class="results-header">
                        <h2>Analysis Results for ${data.stock_symbol}</h2>
                        <div class="timestamp">${new Date().toLocaleString()}</div>
                     </div>`;
            html += '<div class="results-content">';
            
            if (data.sentiment.success) {
                // Sentiment Summary
                html += '<div class="sentiment-summary">';
                html += '<h3>Sentiment Analysis</h3>';
                
                const sentimentClass = getSentimentClass(data.sentiment.average_sentiment);
                
                html += '<div class="sentiment-stats">';
                html += `<div class="stat-item">
                            <div class="stat-label">Average Sentiment</div>
                            <div class="stat-value sentiment-${sentimentClass}">${(data.sentiment.average_sentiment * 100).toFixed(1)}%</div>
                         </div>`;
                html += `<div class="stat-item">
                            <div class="stat-label">Total Posts Analyzed</div>
                            <div class="stat-value">${data.sentiment.post_count}</div>
                         </div>`;
                html += '</div>';
                
                // Distribution
                const distribution = data.sentiment.sentiment_distribution;
                const posCount = distribution.positive || 0;
                const neuCount = distribution.neutral || 0;
                const negCount = distribution.negative || 0;
                const total = posCount + neuCount + negCount;
                
                html += '<div class="sentiment-distribution">';
                html += '<div class="distribution-title">Sentiment Distribution</div>';
                html += '<div class="distribution-bars" id="single-distribution-bars">';
                
                const posPercent = total > 0 ? (posCount / total * 100).toFixed(1) : 0;
                const neuPercent = total > 0 ? (neuCount / total * 100).toFixed(1) : 0;
                const negPercent = total > 0 ? (negCount / total * 100).toFixed(1) : 0;
                
                html += `<div class="dist-bar dist-bar-positive" data-count="${posCount}" data-percent="${posPercent}%">
                            <div class="dist-bar-count">${posCount}</div>
                            <div class="dist-bar-fill" style="height: ${total > 0 ? (posCount / total * 100) : 0}%"></div>
                            <div class="dist-bar-label">Positive</div>
                         </div>`;
                
                html += `<div class="dist-bar dist-bar-neutral" data-count="${neuCount}" data-percent="${neuPercent}%">
                            <div class="dist-bar-count">${neuCount}</div>
                            <div class="dist-bar-fill" style="height: ${total > 0 ? (neuCount / total * 100) : 0}%"></div>
                            <div class="dist-bar-label">Neutral</div>
                         </div>`;
                
                html += `<div class="dist-bar dist-bar-negative" data-count="${negCount}" data-percent="${negPercent}%">
                            <div class="dist-bar-count">${negCount}</div>
                            <div class="dist-bar-fill" style="height: ${total > 0 ? (negCount / total * 100) : 0}%"></div>
                            <div class="dist-bar-label">Negative</div>
                         </div>`;
                
                html += '<div class="dist-tooltip" id="single-dist-tooltip"></div>';
                html += '</div>'; // close distribution-bars
                html += '</div>'; // close sentiment-distribution
                html += '</div>'; // close sentiment-summary
                
                // Stock Data section
                if (data.stock_data.success) {
                    html += '<div class="stock-data">';
                    html += '<h3>Stock Data</h3>';
                    html += `<div class="stock-price">${data.stock_data.data.currency}${data.stock_data.data.current_price.toFixed(2)}</div>`;
                    html += '</div>';
                } else {
                    // Move error to footer
                    const stockErrorMsg = `<div class="error"><i class="fas fa-exclamation-circle"></i> ${data.stock_data.error}</div>`;
                    setTimeout(() => {
                        document.getElementById('singleFooterError').innerHTML = stockErrorMsg;
                    }, 100);
                }
                
                // Top Posts
                html += '<div class="posts-section">';
                html += '<h3>Top Reddit Posts</h3>';
                
                if (data.sentiment.top_posts && data.sentiment.top_posts.length > 0) {
                    data.sentiment.top_posts.forEach(post => {
                        const sentimentClass = post.sentiment > 0.1 ? 'positive' : (post.sentiment < -0.1 ? 'negative' : 'neutral');
                        const sentimentIcon = getSentimentIcon(sentimentClass);
                        
                        html += `<div class="post-card">
                                    <div class="post-header">
                                        <div class="post-title">${post.title}</div>
                                        <div class="post-meta">
                                            <span class="post-score"><i class="fas fa-arrow-up"></i> ${post.score}</span>
                                            <span class="post-date">${post.created_utc}</span>
                                            <span class="post-subreddit">r/${post.subreddit}</span>
                                        </div>
                                    </div>
                                    <div class="post-content">${truncateText(post.text, 200)}</div>
                                    <div class="post-footer">
                                        <div class="post-sentiment sentiment-${sentimentClass}">
                                            <span class="sentiment-icon">${sentimentIcon}</span>
                                            <span class="sentiment-label">Sentiment:</span>
                                            <span class="sentiment-value">${(post.sentiment * 100).toFixed(1)}%</span>
                                        </div>
                                        <a href="${post.url}" target="_blank" class="post-link">View on Reddit <i class="fas fa-external-link-alt"></i></a>
                                    </div>
                                </div>`;
                    });
                } else {
                    html += '<div class="no-posts">No posts found</div>';
                }
                
                html += '</div>'; // close posts-section
            } else {
                html += `<div class="error"><i class="fas fa-exclamation-circle"></i> ${data.sentiment.error || 'Error analyzing sentiment'}</div>`;
            }
            
            html += '</div>'; // close results-content
            html += '</div>'; // close results-container
            
            resultsDiv.innerHTML = html;
            
            // Enhanced distribution bar hover events
            setupEnhancedDistributionTooltips();
            
        } catch (err) {
            resultsDiv.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> Error: ${err.message}</div>`;
            console.error('Error during analysis:', err);
        }
    });
}

function getSentimentClass(sentiment) {
    if (sentiment > 0.1) return 'positive';
    if (sentiment < -0.1) return 'negative';
    return 'neutral';
}

function getSentimentIcon(sentimentClass) {
    switch(sentimentClass) {
        case 'positive':
            return '<i class="fas fa-thumbs-up"></i>';
        case 'negative':
            return '<i class="fas fa-thumbs-down"></i>';
        default:
            return '<i class="fas fa-minus"></i>';
    }
}

function setupEnhancedDistributionTooltips() {
    const bars = document.querySelectorAll('#single-distribution-bars .dist-bar');
    const tooltip = document.getElementById('single-dist-tooltip');
    
    if (bars && tooltip) {
        bars.forEach(bar => {
            bar.addEventListener('mouseover', function(e) {
                const count = this.getAttribute('data-count');
                const percent = this.getAttribute('data-percent');
                let sentimentType = '';
                
                if (this.classList.contains('dist-bar-positive')) {
                    sentimentType = 'Positive';
                } else if (this.classList.contains('dist-bar-neutral')) {
                    sentimentType = 'Neutral';
                } else if (this.classList.contains('dist-bar-negative')) {
                    sentimentType = 'Negative';
                }
                
                tooltip.innerHTML = `<strong>${sentimentType} Posts</strong><br>${count} posts (${percent})`;
                tooltip.style.display = 'block';
                tooltip.style.left = `${this.offsetLeft + this.offsetWidth / 2 - tooltip.offsetWidth / 2}px`;
                tooltip.style.top = `${this.offsetTop - tooltip.offsetHeight - 10}px`;
            });
            
            bar.addEventListener('mouseout', function() {
                tooltip.style.display = 'none';
            });
        });
    }
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}