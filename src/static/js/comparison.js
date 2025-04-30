// src/static/js/comparison.js

function initComparison() {
    document.getElementById('comparisonForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const stockSymbol1 = document.getElementById('stockSymbol1').value;
        const stockSymbol2 = document.getElementById('stockSymbol2').value;
        const resultsDiv = document.getElementById('comparisonResults');
        const footerErrorDiv = document.getElementById('comparisonFooterError');
        
        footerErrorDiv.innerHTML = '';
        resultsDiv.innerHTML = '<div class="loading"><i class="fas fa-circle-notch"></i> Comparing stocks ' + 
            stockSymbol1 + ' and ' + stockSymbol2 + '. Please wait...</div>';
        
        try {
            const response = await fetch('/compare', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `stock_symbol1=${stockSymbol1}&stock_symbol2=${stockSymbol2}`
            });
            
            const data = await response.json();
            
            if (data.error) {
                resultsDiv.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> Error: ${data.error}</div>`;
                return;
            }
            
            let html = '<div class="comparison-container">';
            html += `<div class="comparison-header">
                        <h2>Comparison Results: ${data.stock_symbol1} vs ${data.stock_symbol2}</h2>
                        <div class="timestamp">${new Date().toLocaleString()}</div>
                    </div>`;
            
            // Generate the comparison content
            html += '<div class="comparison-content">';
            
            // Side-by-side sentiment comparison
            html += '<div class="comparison-section sentiment-comparison">';
            html += '<h3>Sentiment Analysis Comparison</h3>';
            
            html += '<div class="comparison-grid">';
            
            // Stock 1 column
            html += '<div class="comparison-column">';
            html += `<div class="comparison-column-header">${data.stock_symbol1}</div>`;
            
            if (data.sentiment1.success) {
                // Display sentiment summary for stock 1
                const sentimentClass1 = getSentimentClass(data.sentiment1.average_sentiment);
                
                html += '<div class="sentiment-summary">';
                html += `<div class="sentiment-score sentiment-${sentimentClass1}">
                            <div class="score-label">Sentiment Score</div>
                            <div class="score-value">${(data.sentiment1.average_sentiment * 100).toFixed(1)}%</div>
                            <div class="sentiment-icon">${getSentimentIcon(sentimentClass1)}</div>
                        </div>`;
                
                html += `<div class="post-count">
                            <div class="count-label">Posts Analyzed</div>
                            <div class="count-value">${data.sentiment1.post_count}</div>
                        </div>`;
                
                // Distribution for stock 1
                const distribution1 = data.sentiment1.sentiment_distribution;
                html += createDistributionChart(distribution1, 'dist1');
                
                html += '</div>'; // close sentiment-summary
            } else {
                html += `<div class="error"><i class="fas fa-exclamation-circle"></i> ${data.sentiment1.error || 'Error analyzing sentiment'}</div>`;
            }
            
            html += '</div>'; // close comparison-column for stock 1
            
            // VS divider
            html += '<div class="comparison-vs">';
            html += '<div class="vs-circle">VS</div>';
            html += '</div>';
            
            // Stock 2 column
            html += '<div class="comparison-column">';
            html += `<div class="comparison-column-header">${data.stock_symbol2}</div>`;
            
            if (data.sentiment2.success) {
                // Display sentiment summary for stock 2
                const sentimentClass2 = getSentimentClass(data.sentiment2.average_sentiment);
                
                html += '<div class="sentiment-summary">';
                html += `<div class="sentiment-score sentiment-${sentimentClass2}">
                            <div class="score-label">Sentiment Score</div>
                            <div class="score-value">${(data.sentiment2.average_sentiment * 100).toFixed(1)}%</div>
                            <div class="sentiment-icon">${getSentimentIcon(sentimentClass2)}</div>
                        </div>`;
                
                html += `<div class="post-count">
                            <div class="count-label">Posts Analyzed</div>
                            <div class="count-value">${data.sentiment2.post_count}</div>
                        </div>`;
                
                // Distribution for stock 2
                const distribution2 = data.sentiment2.sentiment_distribution;
                html += createDistributionChart(distribution2, 'dist2');
                
                html += '</div>'; // close sentiment-summary
            } else {
                html += `<div class="error"><i class="fas fa-exclamation-circle"></i> ${data.sentiment2.error || 'Error analyzing sentiment'}</div>`;
            }
            
            html += '</div>'; // close comparison-column for stock 2
            
            html += '</div>'; // close comparison-grid
            html += '</div>'; // close sentiment-comparison section
            
            // Stock Price Comparison
            html += '<div class="comparison-section price-comparison">';
            html += '<h3>Stock Price Comparison</h3>';
            
            html += '<div class="stock-price-grid">';
            
            // Stock 1 price
            html += '<div class="stock-price-item">';
            html += `<div class="price-header">${data.stock_symbol1}</div>`;
            if (data.stock_data1 && data.stock_data1.success) {
                html += `<div class="price-value">${data.stock_data1.data.currency}${data.stock_data1.data.current_price.toFixed(2)}</div>`;
            } else {
                const errorMsg = data.stock_data1 ? data.stock_data1.error : 'Price data not available';
                html += `<div class="price-error"><i class="fas fa-exclamation-circle"></i> ${errorMsg}</div>`;
            }
            html += '</div>'; // close stock-price-item
            
            // Stock 2 price
            html += '<div class="stock-price-item">';
            html += `<div class="price-header">${data.stock_symbol2}</div>`;
            if (data.stock_data2 && data.stock_data2.success) {
                html += `<div class="price-value">${data.stock_data2.data.currency}${data.stock_data2.data.current_price.toFixed(2)}</div>`;
            } else {
                const errorMsg = data.stock_data2 ? data.stock_data2.error : 'Price data not available';
                html += `<div class="price-error"><i class="fas fa-exclamation-circle"></i> ${errorMsg}</div>`;
            }
            html += '</div>'; // close stock-price-item
            
            html += '</div>'; // close stock-price-grid
            html += '</div>'; // close price-comparison section
            
            // Top Posts Comparison
            html += '<div class="comparison-section posts-comparison">';
            html += '<h3>Top Reddit Posts Comparison</h3>';
            
            html += '<div class="posts-grid">';
            
            // Stock 1 posts
            html += '<div class="posts-column">';
            html += `<div class="posts-header">${data.stock_symbol1} Top Posts</div>`;
            
            if (data.sentiment1.success && data.sentiment1.top_posts && data.sentiment1.top_posts.length > 0) {
                data.sentiment1.top_posts.slice(0, 3).forEach(post => {
                    html += createPostCard(post);
                });
            } else {
                html += '<div class="no-posts">No posts found</div>';
            }
            
            html += '</div>'; // close posts-column
            
            // Stock 2 posts
            html += '<div class="posts-column">';
            html += `<div class="posts-header">${data.stock_symbol2} Top Posts</div>`;
            
            if (data.sentiment2.success && data.sentiment2.top_posts && data.sentiment2.top_posts.length > 0) {
                data.sentiment2.top_posts.slice(0, 3).forEach(post => {
                    html += createPostCard(post);
                });
            } else {
                html += '<div class="no-posts">No posts found</div>';
            }
            
            html += '</div>'; // close posts-column
            
            html += '</div>'; // close posts-grid
            html += '</div>'; // close posts-comparison section
            
            // Conclusion section
            if (data.sentiment1.success && data.sentiment2.success) {
                html += '<div class="comparison-section conclusion">';
                html += '<h3>Comparison Conclusion</h3>';
                
                const sentiment1 = data.sentiment1.average_sentiment;
                const sentiment2 = data.sentiment2.average_sentiment;
                const postCount1 = data.sentiment1.post_count;
                const postCount2 = data.sentiment2.post_count;
                
                let conclusion = '';
                
                // Compare sentiment scores
                if (sentiment1 > sentiment2) {
                    conclusion += `<p>${data.stock_symbol1} has a more positive sentiment (${(sentiment1 * 100).toFixed(1)}%) compared to ${data.stock_symbol2} (${(sentiment2 * 100).toFixed(1)}%).</p>`;
                } else if (sentiment2 > sentiment1) {
                    conclusion += `<p>${data.stock_symbol2} has a more positive sentiment (${(sentiment2 * 100).toFixed(1)}%) compared to ${data.stock_symbol1} (${(sentiment1 * 100).toFixed(1)}%).</p>`;
                } else {
                    conclusion += `<p>Both stocks have the same sentiment score (${(sentiment1 * 100).toFixed(1)}%).</p>`;
                }
                
                // Compare post activity
                if (postCount1 > postCount2) {
                    conclusion += `<p>${data.stock_symbol1} has more discussion activity with ${postCount1} posts, compared to ${postCount2} posts for ${data.stock_symbol2}.</p>`;
                } else if (postCount2 > postCount1) {
                    conclusion += `<p>${data.stock_symbol2} has more discussion activity with ${postCount2} posts, compared to ${postCount1} posts for ${data.stock_symbol1}.</p>`;
                } else {
                    conclusion += `<p>Both stocks have the same level of discussion activity with ${postCount1} posts each.</p>`;
                }
                
                html += conclusion;
                html += '</div>'; // close conclusion section
            }
            
            html += '</div>'; // close comparison-content
            html += '</div>'; // close comparison-container
            
            resultsDiv.innerHTML = html;
            
            // Set up tooltips for distribution charts
            setupEnhancedDistributionTooltips('dist1');
            setupEnhancedDistributionTooltips('dist2');
            
        } catch (err) {
            resultsDiv.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> Error: ${err.message}</div>`;
            console.error('Error during comparison:', err);
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

function createDistributionChart(distribution, id) {
    const posCount = distribution.positive || 0;
    const neuCount = distribution.neutral || 0;
    const negCount = distribution.negative || 0;
    const total = posCount + neuCount + negCount;
    
    let html = '<div class="sentiment-distribution">';
    html += '<div class="distribution-title">Sentiment Distribution</div>';
    html += `<div class="distribution-bars" id="${id}-bars">`;
    
    const posPercent = total > 0 ? (posCount / total * 100).toFixed(1) : 0;
    const neuPercent = total > 0 ? (neuCount / total * 100).toFixed(1) : 0;
    const negPercent = total > 0 ? (negCount / total * 100).toFixed(1) : 0;
    
    html += `<div class="dist-bar dist-bar-positive" data-count="${posCount}" data-percent="${posPercent}%">
                <div class="dist-bar-count">${posCount}</div>
                <div class="dist-bar-fill" style="height: ${total > 0 ? (posCount / total * 100) : 0}%"></div>
                <div class="dist-bar-label">Pos</div>
             </div>`;
    
    html += `<div class="dist-bar dist-bar-neutral" data-count="${neuCount}" data-percent="${neuPercent}%">
                <div class="dist-bar-count">${neuCount}</div>
                <div class="dist-bar-fill" style="height: ${total > 0 ? (neuCount / total * 100) : 0}%"></div>
                <div class="dist-bar-label">Neu</div>
             </div>`;
    
    html += `<div class="dist-bar dist-bar-negative" data-count="${negCount}" data-percent="${negPercent}%">
                <div class="dist-bar-count">${negCount}</div>
                <div class="dist-bar-fill" style="height: ${total > 0 ? (negCount / total * 100) : 0}%"></div>
                <div class="dist-bar-label">Neg</div>
             </div>`;
    
    html += `<div class="dist-tooltip" id="${id}-tooltip"></div>`;
    html += '</div>'; // close distribution-bars
    html += '</div>'; // close sentiment-distribution
    
    return html;
}

function createPostCard(post) {
    const sentimentClass = post.sentiment > 0.1 ? 'positive' : (post.sentiment < -0.1 ? 'negative' : 'neutral');
    const sentimentIcon = getSentimentIcon(sentimentClass);
    
    let html = `<div class="post-card">
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
    
    return html;
}

function setupEnhancedDistributionTooltips(id) {
    setTimeout(() => {
        const bars = document.querySelectorAll(`#${id}-bars .dist-bar`);
        const tooltip = document.getElementById(`${id}-tooltip`);
        
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
    }, 500); // Small delay to ensure DOM is ready
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}