import React, { useState } from 'react';
import { Tag } from '@/types';

export default function TabList({ tags }: { tags: Tag[] }) {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <div className="flex border-b border-gray-200">
      {tags.map((tag, index) => (
        <button
          key={tag.id}
          className={`px-6 py-2 text-sm font-medium transition-colors relative
                    ${activeTab === index 
                      ? 'text-purple-700' 
                      : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab(index)}
        >
          {tag.name}
          {activeTab === index && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-700" />
          )}
        </button>
      ))}
    </div>
  );
}
