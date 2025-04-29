# run.py

import os
import sys

os.environ['NLTK_DATA'] = os.path.abspath('./nltk_data')

sys.path.append(os.path.abspath('.'))

from src.app import app

if __name__ == "__main__":
    app.run(debug=True)