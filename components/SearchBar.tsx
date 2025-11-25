'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Complex, SitePlan, Building, Floorplan } from '@/types';

interface SearchResult {
  type: 'complex' | 'siteplan' | 'building' | 'floorplan';
  id: string;
  name: string;
  path: string[];
}

export default function SearchBar() {
  const { complexes, setCurrentComplex, setCurrentSitePlan, setCurrentBuilding, setCurrentFloorplan } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    complexes.forEach((complex) => {
      // Search complexes
      if (complex.name.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          type: 'complex',
          id: complex.id,
          name: complex.name,
          path: [complex.name],
        });
      }

      // Search site plans
      complex.sitePlans.forEach((sitePlan) => {
        if (sitePlan.name.toLowerCase().includes(lowerQuery)) {
          searchResults.push({
            type: 'siteplan',
            id: sitePlan.id,
            name: sitePlan.name,
            path: [complex.name, sitePlan.name],
          });
        }

        // Search buildings
        sitePlan.buildings.forEach((building) => {
          if (building.name.toLowerCase().includes(lowerQuery)) {
            searchResults.push({
              type: 'building',
              id: building.id,
              name: building.name,
              path: [complex.name, sitePlan.name, building.name],
            });
          }

          // Search floorplans
          building.floorplans.forEach((floorplan) => {
            const unitNumbers = floorplan.metadata.unitNumbers?.join(', ') || '';
            const floorNumber = floorplan.metadata.floorNumber || '';
            const buildingId = floorplan.metadata.buildingId || '';
            const searchableText = [
              unitNumbers,
              floorNumber,
              buildingId,
              floorplan.metadata.floorplanType || '',
            ].join(' ').toLowerCase();

            if (
              searchableText.includes(lowerQuery) ||
              unitNumbers.toLowerCase().includes(lowerQuery) ||
              floorNumber.toLowerCase().includes(lowerQuery) ||
              buildingId.toLowerCase().includes(lowerQuery)
            ) {
              const floorplanName = `${floorplan.metadata.floorplanType || 'Untitled'} - ${unitNumbers || floorNumber || 'No units'}`;
              searchResults.push({
                type: 'floorplan',
                id: floorplan.id,
                name: floorplanName,
                path: [complex.name, sitePlan.name, building.name],
              });
            }
          });
        });
      });
    });

    setResults(searchResults);
  }, [query, complexes]);

  const handleSelect = (result: SearchResult) => {
    setCurrentComplex(result.path[0] === complexes.find(c => c.id === result.id)?.name ? result.id : '');
    
    if (result.type === 'siteplan' || result.type === 'building' || result.type === 'floorplan') {
      const complex = complexes.find(c => c.sitePlans.some(sp => sp.id === result.id || sp.buildings.some(b => b.id === result.id || b.floorplans.some(fp => fp.id === result.id))));
      if (complex) {
        setCurrentComplex(complex.id);
        const sitePlan = complex.sitePlans.find(sp => sp.id === result.id || sp.buildings.some(b => b.id === result.id || b.floorplans.some(fp => fp.id === result.id)));
        if (sitePlan) {
          setCurrentSitePlan(sitePlan.id);
          if (result.type === 'building' || result.type === 'floorplan') {
            const building = sitePlan.buildings.find(b => b.id === result.id || b.floorplans.some(fp => fp.id === result.id));
            if (building) {
              setCurrentBuilding(building.id);
              if (result.type === 'floorplan') {
                setCurrentFloorplan(result.id);
              }
            }
          }
        }
      }
    }
    
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by complex, building, or unit number..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-800">{result.name}</div>
              <div className="text-xs text-gray-500 mt-1">{result.path.join(' › ')}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

