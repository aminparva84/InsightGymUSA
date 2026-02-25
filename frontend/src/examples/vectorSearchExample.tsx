/**
 * Example React component demonstrating vector search usage
 */

import React, { useState, useEffect } from 'react';
import { 
  searchExercisesWithProfile, 
  getExerciseRecommendations,
  getSafeExercisesForUser,
  searchExercisesByMuscle
} from '../services/vectorSearchHelpers';
import { SearchResult } from '../services/vectorSearch';

interface VectorSearchExampleProps {
  userId: number;
  language?: 'fa' | 'en';
}

const VectorSearchExample: React.FC<VectorSearchExampleProps> = ({ 
  userId, 
  language = 'en' 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'search' | 'recommendations' | 'safe' | 'muscle'>('search');

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let searchResults: SearchResult[];
      
      switch (searchType) {
        case 'search':
          searchResults = await searchExercisesWithProfile(query, userId, {
            language,
            maxResults: 20
          });
          break;
        case 'recommendations':
          searchResults = await getExerciseRecommendations(userId, {
            language,
            maxResults: 20
          });
          break;
        case 'safe':
          searchResults = await getSafeExercisesForUser(userId, {
            language,
            maxResults: 20
          });
          break;
        case 'muscle':
          searchResults = await searchExercisesByMuscle(query, userId, {
            language,
            maxResults: 20
          });
          break;
        default:
          searchResults = [];
      }
      
      setResults(searchResults);
    } catch (err: any) {
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const recommendations = await getExerciseRecommendations(userId, {
        language,
        maxResults: 20
      });
      setResults(recommendations);
    } catch (err: any) {
      setError(err.message || 'Failed to get recommendations');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSafeExercises = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const safeExercises = await getSafeExercisesForUser(userId, {
        language,
        maxResults: 50
      });
      setResults(safeExercises);
    } catch (err: any) {
      setError(err.message || 'Failed to get safe exercises');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vector-search-example">
      <h2>Smart Exercise Search</h2>
      
      {/* Search Type Selector */}
      <div className="search-type-selector">
        <button 
          className={searchType === 'search' ? 'active' : ''}
          onClick={() => setSearchType('search')}
        >
          Search
        </button>
        <button 
          className={searchType === 'recommendations' ? 'active' : ''}
          onClick={() => setSearchType('recommendations')}
        >
          Recommendations
        </button>
        <button 
          className={searchType === 'safe' ? 'active' : ''}
          onClick={() => setSearchType('safe')}
        >
          Safe Exercises
        </button>
        <button 
          className={searchType === 'muscle' ? 'active' : ''}
          onClick={() => setSearchType('muscle')}
        >
          By Muscle
        </button>
      </div>

      {/* Search Input */}
      {searchType !== 'recommendations' && searchType !== 'safe' && (
        <div className="search-input">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises... (e.g., chest exercises)"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      )}

      {/* Quick Actions */}
      {searchType === 'recommendations' && (
        <button onClick={handleGetRecommendations} disabled={loading} className="action-btn">
          {loading ? 'Loading...' : 'Get Recommendations'}
        </button>
      )}

      {searchType === 'safe' && (
        <button onClick={handleGetSafeExercises} disabled={loading} className="action-btn">
          {loading ? 'Loading...' : 'Show Safe Exercises'}
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="search-results">
          <h3>
            {`Results (${results.length})`}
          </h3>
          <div className="results-list">
            {results.map((result, index) => (
              <div key={result.exercise_id} className="result-item">
                <div className="result-header">
                  <h4>{result.name_en || result.name_fa}</h4>
                  <span className="similarity-score">
                    {Math.round(result.score * 100)}% similarity
                  </span>
                </div>
                <div className="result-metadata">
                  <span className="badge">{result.metadata.level}</span>
                  <span className="badge">{result.metadata.intensity}</span>
                  <span className="badge">{result.metadata.equipment}</span>
                  <span className="badge">
                    {result.metadata.muscle || result.metadata.muscle_fa}
                  </span>
                </div>
                {result.metadata.injury_tags && result.metadata.injury_tags.length > 0 && (
                  <div className="injury-warning">
                    Injury Warning: {result.metadata.injury_tags.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <div className="no-results">
          No results found
        </div>
      )}
    </div>
  );
};

export default VectorSearchExample;



