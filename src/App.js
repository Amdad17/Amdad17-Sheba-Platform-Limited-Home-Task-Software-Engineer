import React, { useState, useEffect } from 'react';

// Utility function to generate a unique short URL
const generateShortURL = (longURL) => {
  // Simple base62 encoding for creating unique short URLs
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const base = characters.length;
  
  // Use timestamp and hash of long URL to create unique identifier
  const hash = longURL.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  const timestamp = Date.now();
  const seed = hash + timestamp;
  
  let shortCode = '';
  let num = Math.abs(seed);
  
  for (let i = 0; i < 6; i++) {
    shortCode = characters[num % base] + shortCode;
    num = Math.floor(num / base);
  }
  
  return shortCode;
};

// URL validation function
const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

function App() {
  const [longURL, setLongURL] = useState('');
  const [shortenedURLs, setShortenedURLs] = useState([]);
  const [error, setError] = useState('');
  const [copiedURL, setCopiedURL] = useState(null);

  // Load existing URLs from localStorage on component mount
  useEffect(() => {
    const savedURLs = localStorage.getItem('shortenedURLs');
    if (savedURLs) {
      setShortenedURLs(JSON.parse(savedURLs));
    }
  }, []);

  // Save URLs to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem('shortenedURLs', JSON.stringify(shortenedURLs));
  }, [shortenedURLs]);

  const handleShortenURL = () => {
    // Reset error
    setError('');

    // Validate URL
    if (!longURL) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidURL(longURL)) {
      setError('Invalid URL format');
      return;
    }

    // Check for existing short URL
    const existingURL = shortenedURLs.find(url => url.original === longURL);
    if (existingURL) {
      setError('URL already shortened');
      return;
    }

    // Generate short URL
    const shortURL = generateShortURL(longURL);
    
    // Create new URL entry
    const newURLEntry = {
      original: longURL,
      shortened: `http://short.url/${shortURL}`,
      shortCode: shortURL
    };

    // Update state and localStorage
    setShortenedURLs([...shortenedURLs, newURLEntry]);
    // Clear input after successful shortening
    setLongURL('');
  };

  const handleCopyURL = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedURL(url);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedURL(null), 2000);
    });
  };

  const handleRedirect = (originalURL) => {
    window.open(originalURL, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">URL Shortener</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex space-x-2">
            <input 
              className="flex-grow border border-gray-300 rounded-md p-2"
              placeholder="Enter your long URL here" 
              value={longURL}
              onChange={(e) => setLongURL(e.target.value)}
            />
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              onClick={handleShortenURL}
            >
              Shorten
            </button>
          </div>
          {error && (
            <p className="text-red-500 mt-2">{error}</p>
          )}
        </div>

        {shortenedURLs.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Shortened URLs</h2>
            {shortenedURLs.map((url, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded shadow"
              >
                <div>
                  <div className="font-semibold">
                    Original: 
                    <span 
                      className="text-blue-600 ml-2 cursor-pointer hover:underline"
                      onClick={() => handleRedirect(url.original)}
                    >
                      {url.original}
                    </span>
                  </div>
                  <div className="text-green-600">
                    Shortened: {url.shortened}
                  </div>
                </div>
                <button 
                  className={`px-3 py-2 rounded-md transition-colors ${
                    copiedURL === url.shortened 
                    ? "bg-green-500 text-white" 
                    : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={() => handleCopyURL(url.shortened)}
                >
                  {copiedURL === url.shortened ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;