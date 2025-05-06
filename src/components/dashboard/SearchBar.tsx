
import React from 'react';
import { Search } from 'lucide-react';

export const SearchBar: React.FC = () => {
  return (
    <div className="search-bar flex items-center px-4 py-2.5">
      <Search className="h-5 w-5 text-gray-400 ml-2" />
      <input
        type="text"
        placeholder="ابحث هنا..."
        className="w-full bg-transparent border-none focus:outline-none text-right text-gray-700"
      />
    </div>
  );
};
