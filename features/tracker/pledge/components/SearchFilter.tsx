'use client';

import { Combobox } from '@headlessui/react';
import { Search } from 'lucide-react';

export function SearchFilter() {
  return (
    <div className="flex m-6">
      {/* 検索 */}
      <div>
        <Combobox
          onChange={() => {}}
          as="div"
          className="relative mx-auto rounded-xl max-w-xl bg-white ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-gray-400 focus-within:bg-gray-50 transition-all"
        >
          <div className="flex items-center px-4">
            <Search className="h-5 w-5 text-gray-500 shrink-0" />
            <Combobox.Input
              className="h-10 w-full border-0 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:ring-0 focus:outline-none ml-3"
              placeholder="検索"
            />
          </div>
          <Combobox.Options className="py-4 text-sm max-h-40 overflow-auto">
            {/* 将来的には検索の多いものを表示するとか */}
            <Combobox.Option value="1">
              {({ active }) => (
                <div className={`space-x-1 px-4 py-2 ${active ? 'bg-gray-600' : 'bg-white'}`}>
                  <span className={`font-medium ${active ? 'text-white' : 'text-gray-500'}`}>
                    検索結果1
                  </span>
                </div>
              )}
            </Combobox.Option>
            <Combobox.Option value="2">
              {({ active }) => (
                <div className={`space-x-1 px-4 py-2 ${active ? 'bg-gray-600' : 'bg-white'}`}>
                  <span className={`font-medium ${active ? 'text-white' : 'text-gray-500'}`}>
                    検索結果2
                  </span>
                </div>
              )}
            </Combobox.Option>
          </Combobox.Options>
        </Combobox>
      </div>
      {/* タグフィルタリング */}
      <div></div>
    </div>
  );
}