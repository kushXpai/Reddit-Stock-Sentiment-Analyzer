#!/usr/bin/env python3
# direct_nltk_downloader.py

import os
import sys
import urllib.request
import zipfile
import shutil
from pathlib import Path

# URLs for direct download of NLTK resources
RESOURCE_URLS = {
    'vader_lexicon': 'https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/sentiment/vader_lexicon.zip',
    'punkt': 'https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/tokenizers/punkt.zip',
    'stopwords': 'https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora/stopwords.zip',
    'wordnet': 'https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora/wordnet.zip',
    'omw-1.4': 'https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora/omw-1.4.zip'
}

# Resource directory structure
RESOURCE_DIRS = {
    'vader_lexicon': 'sentiment',
    'punkt': 'tokenizers',
    'stopwords': 'corpora',
    'wordnet': 'corpora',
    'omw-1.4': 'corpora'
}

def download_file(url, local_path):
    """Download a file from URL to local path"""
    print(f"Downloading {url}...")
    try:
        urllib.request.urlretrieve(url, local_path)
        return True
    except Exception as e:
        print(f"Error downloading {url}: {str(e)}")
        return False

def extract_zip(zip_path, extract_dir):
    """Extract a zip file"""
    print(f"Extracting {zip_path}...")
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        return True
    except Exception as e:
        print(f"Error extracting {zip_path}: {str(e)}")
        return False

def main():
    nltk_data_dir = Path('./nltk_data').absolute()
    nltk_data_dir.mkdir(exist_ok=True)
    print(f"Using NLTK data directory: {nltk_data_dir}")
    
    downloads_dir = nltk_data_dir / 'downloads'
    downloads_dir.mkdir(exist_ok=True)
    
    success_count = 0
    
    for resource, url in RESOURCE_URLS.items():
        resource_dir = nltk_data_dir / RESOURCE_DIRS[resource]
        resource_dir.mkdir(exist_ok=True)
        
        zip_path = downloads_dir / f"{resource}.zip"
        if download_file(url, zip_path):
            if extract_zip(zip_path, resource_dir):
                print(f"✓ Successfully installed {resource}")
                success_count += 1
            else:
                print(f"⚠️ Failed to extract {resource}")
        else:
            print(f"⚠️ Failed to download {resource}")
    
    if downloads_dir.exists():
        shutil.rmtree(downloads_dir)
    
    print(f"\nInstalled {success_count} out of {len(RESOURCE_URLS)} resources")
    print(f"NLTK data directory: {nltk_data_dir}")
    
    with open('nltk_data_path.txt', 'w') as f:
        f.write(str(nltk_data_dir))
    
    print("\nSetup complete! You can now run your application.")

if __name__ == "__main__":
    main()