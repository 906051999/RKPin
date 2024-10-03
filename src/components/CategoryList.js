'use client';

import { useState, useEffect, useCallback } from 'react';
import Card from './Card';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [items, setItems] = useState([]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
        setActiveCategory(prevActive => prevActive || data[0].name);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchItems = useCallback(async () => {
    if (activeCategory) {
      try {
        const response = await fetch(`/api/${activeCategory}`);
        const data = await response.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching items:', error);
        setItems([]);
      }
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-12">
        <ul className="flex flex-wrap justify-center gap-4">
          {categories.map(({ name, count }) => (
            <li key={name}>
              <button
                onClick={() => setActiveCategory(name)}
                className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  activeCategory === name
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                {name}
                <span className="ml-2 px-2 py-1 bg-white text-indigo-600 rounded-full text-xs">{count}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {items.map((item) => (
          <Card key={item.id} type={activeCategory} data={item} />
        ))}
      </div>
    </div>
  );
}