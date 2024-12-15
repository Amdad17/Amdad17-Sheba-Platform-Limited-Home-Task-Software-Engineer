import React, { useState, useEffect } from 'react';

const generateShortURL = (longURL) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const base = characters.length;
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

  useEffect(() => {
    const savedURLs = localStorage.getItem('shortenedURLs');
    if (savedURLs) {
      setShortenedURLs(JSON.parse(savedURLs));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('shortenedURLs', JSON.stringify(shortenedURLs));
  }, [shortenedURLs]);

  const handleShortenURL = () => {
    setError('');
    if (!longURL) {
      setError('Please enter a URL');
      return;
    }
    if (!isValidURL(longURL)) {
      setError('Invalid URL format');
      return;
    }
    const existingURL = shortenedURLs.find(url => url.original === longURL);
    if (existingURL) {
      setError('URL already shortened');
      return;
    }
    const shortURL = generateShortURL(longURL);
    const newURLEntry = {
      original: longURL,
      shortened: `http://short.url/${shortURL}`,
      shortCode: shortURL
    };
    setShortenedURLs([...shortenedURLs, newURLEntry]);
    setLongURL('');
  };

  const handleCopyURL = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedURL(url);
      setTimeout(() => setCopiedURL(null), 2000);
    });
  };

  const handleRedirect = (originalURL) => {
    window.open(originalURL, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-extrabold text-blue-700 text-center mb-8">URL Shortener</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            className="flex-grow border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your long URL here"
            value={longURL}
            onChange={(e) => setLongURL(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-all shadow-md"
            onClick={handleShortenURL}
          >
            Shorten
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        {shortenedURLs.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Your Shortened URLs</h2>
            <div className="space-y-4">
              {shortenedURLs.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm"
                >
                  <div>
                    <p className="text-gray-700 font-medium">
                      <span className="font-semibold text-gray-900">Original:</span>{' '}
                      <span
                        className="text-blue-600 underline cursor-pointer hover:text-blue-800"
                        onClick={() => handleRedirect(url.original)}
                      >
                        {url.original}
                      </span>
                    </p>
                    <p className="text-green-700 font-semibold">
                      Shortened: <span>{url.shortened}</span>
                    </p>
                  </div>
                  <button
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      copiedURL === url.shortened
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    onClick={() => handleCopyURL(url.shortened)}
                  >
                    {copiedURL === url.shortened ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
