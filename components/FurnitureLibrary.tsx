'use client';

import { useState } from 'react';
import { Sofa, Bed, Table, Refrigerator, ChefHat, Droplets, Box, WashingMachine } from 'lucide-react';
import { ToolType } from '@/types';

interface FurnitureItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  width: number;
  height: number;
  type: 'furniture' | 'appliance' | 'fixture';
}

const furnitureItems: FurnitureItem[] = [
  { id: 'sofa', name: 'Sofa', icon: <Sofa className="w-5 h-5" />, width: 80, height: 30, type: 'furniture' },
  { id: 'bed', name: 'Bed', icon: <Bed className="w-5 h-5" />, width: 60, height: 80, type: 'furniture' },
  { id: 'chair', name: 'Chair', icon: <Box className="w-5 h-5" />, width: 20, height: 20, type: 'furniture' },
  { id: 'table', name: 'Table', icon: <Table className="w-5 h-5" />, width: 40, height: 40, type: 'furniture' },
  { id: 'refrigerator', name: 'Refrigerator', icon: <Refrigerator className="w-5 h-5" />, width: 30, height: 60, type: 'appliance' },
  { id: 'stove', name: 'Stove', icon: <ChefHat className="w-5 h-5" />, width: 30, height: 30, type: 'appliance' },
  { id: 'toilet', name: 'Toilet', icon: <Droplets className="w-5 h-5" />, width: 20, height: 25, type: 'fixture' },
  { id: 'shower', name: 'Shower', icon: <Droplets className="w-5 h-5" />, width: 30, height: 30, type: 'fixture' },
  { id: 'cabinet', name: 'Cabinet', icon: <Box className="w-5 h-5" />, width: 30, height: 20, type: 'fixture' },
  { id: 'washer', name: 'Washer/Dryer', icon: <WashingMachine className="w-5 h-5" />, width: 30, height: 30, type: 'appliance' },
];

interface FurnitureLibraryProps {
  onSelectFurniture: (item: FurnitureItem) => void;
}

export default function FurnitureLibrary({ onSelectFurniture }: FurnitureLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'furniture' | 'appliance' | 'fixture'>('all');

  const filteredItems = selectedCategory === 'all' 
    ? furnitureItems 
    : furnitureItems.filter(item => item.type === selectedCategory);

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Furniture Library</h3>
      
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-2 py-1 text-xs rounded ${selectedCategory === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedCategory('furniture')}
          className={`px-2 py-1 text-xs rounded ${selectedCategory === 'furniture' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
        >
          Furniture
        </button>
        <button
          onClick={() => setSelectedCategory('appliance')}
          className={`px-2 py-1 text-xs rounded ${selectedCategory === 'appliance' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
        >
          Appliances
        </button>
        <button
          onClick={() => setSelectedCategory('fixture')}
          className={`px-2 py-1 text-xs rounded ${selectedCategory === 'fixture' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
        >
          Fixtures
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectFurniture(item)}
            className="p-3 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors flex flex-col items-center gap-2"
            title={item.name}
          >
            {item.icon}
            <span className="text-xs text-gray-700">{item.name}</span>
            <span className="text-xs text-gray-500">{item.width}&quot; × {item.height}&quot;</span>
          </button>
        ))}
      </div>
    </div>
  );
}

