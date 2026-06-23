import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import productsData from '../data/products.json';
import './ProductSearch.css';

interface Product {
  slug: string;
  name: string;
  category: string;
  description?: string;
  imageUrl?: string;
}

export default function ProductSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim().length > 1) {
      const lowerQuery = query.toLowerCase();
      const filtered = (productsData as Product[]).filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        p.category.toLowerCase().includes(lowerQuery) || 
        (p.description && p.description.toLowerCase().includes(lowerQuery))
      ).slice(0, 8);
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/products/${slug}`);
  };

  return (
    <div className="ps-container" ref={searchRef}>
      <button 
        className="ps-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Search Products"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>

      {isOpen && (
        <div className="ps-overlay">
          <div className="ps-input-wrap">
            <svg className="ps-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              className="ps-input" 
              placeholder="Search products..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button className="ps-clear" onClick={() => setQuery('')}>&times;</button>
            )}
          </div>
          
          {query.trim().length > 1 && (
            <div className="ps-results">
              {results.length > 0 ? (
                <ul className="ps-results-list">
                  {results.map((product) => (
                    <li key={product.slug}>
                      <button className="ps-result-item" onClick={() => handleSelect(product.slug)}>
                        <div className="ps-result-info">
                          <span className="ps-result-name">{product.name}</span>
                          <span className="ps-result-cat">{product.category}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="ps-no-results">No products found for "{query}"</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
