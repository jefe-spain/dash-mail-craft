import { useState, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { filterJSONData } from '@/lib/json-filter';

export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
interface JSONObject {
  [key: string]: JSONValue;
}
interface JSONArray extends Array<JSONValue> {}

interface JSONViewerProps {
  data: JSONValue;
  rootLabel?: string;
  defaultExpanded?: boolean;
  className?: string;
  searchTerm?: string;
  filterTerm?: string;
  filterMode?: boolean; // If true, shows filtered data, otherwise highlights matches
}

export const JSONViewer = ({
  data,
  rootLabel = 'root',
  defaultExpanded = true,
  className,
  searchTerm = '',
  filterTerm = '',
  filterMode = false,
}: JSONViewerProps) => {
  // If in filter mode and there's a filter term, filter the data
  const displayData = useMemo(() => {
    if (filterMode && filterTerm) {
      const filtered = filterJSONData(data, filterTerm);
      // If no matches found, return empty object
      if (filtered === undefined) {
        return { noMatches: true };
      }
      return filtered;
    }
    return data;
  }, [data, filterTerm, filterMode]);
  return (
    <div className={cn('font-mono text-sm rounded-md', className)}>
      <JSONNode 
        data={displayData} 
        name={rootLabel} 
        isRoot 
        defaultExpanded={defaultExpanded}
        level={0}
        searchTerm={filterMode ? '' : searchTerm} // Only use search term for highlighting if not in filter mode
      />
    </div>
  );
};

interface JSONNodeProps {
  data: JSONValue;
  name: string | number;
  level: number;
  defaultExpanded: boolean;
  isRoot?: boolean;
  searchTerm?: string;
  path?: string;
}

const JSONNode = ({ data, name, level, defaultExpanded, isRoot = false, searchTerm = '', path = '' }: JSONNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  // Build current path
  const currentPath = useMemo(() => {
    if (isRoot) return String(name);
    return path ? `${path}.${name}` : String(name);
  }, [isRoot, name, path]);
  
  // Determine if this node or any of its children match the search term
  const hasMatch = useMemo(() => {
    if (!searchTerm) return false;
    
    // Check if the current path matches
    const pathMatch = currentPath.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if data value matches (for primitive values)
    let valueMatch = false;
    if (typeof data === 'string') {
      valueMatch = data.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (typeof data === 'number' || typeof data === 'boolean') {
      valueMatch = String(data).toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    return pathMatch || valueMatch;
  }, [searchTerm, currentPath, data]);
  
  // Expand node automatically if it has a match and search term is provided
  useEffect(() => {
    if (searchTerm && hasMatch && !isExpanded) {
      setIsExpanded(true);
    }
  }, [searchTerm, hasMatch, isExpanded]);
  
  const isObject = data !== null && typeof data === 'object';
  const isArray = Array.isArray(data);
  const isExpandable = isObject || isArray;

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const renderValue = (value: JSONValue) => {
    if (value === null) return <span className="text-gray-600 dark:text-gray-400">null</span>;
    
    if (typeof value === 'boolean') {
      const strValue = value.toString();
      return <span className={cn(
        "text-purple-700 dark:text-purple-400 font-medium",
        searchTerm && strValue.toLowerCase().includes(searchTerm.toLowerCase()) && 
        "bg-yellow-200 dark:bg-yellow-900 px-0.5 rounded"
      )}>{strValue}</span>;
    }
    
    if (typeof value === 'number') {
      const strValue = String(value);
      return <span className={cn(
        "text-blue-700 dark:text-blue-400 font-medium",
        searchTerm && strValue.toLowerCase().includes(searchTerm.toLowerCase()) && 
        "bg-yellow-200 dark:bg-yellow-900 px-0.5 rounded"
      )}>{value}</span>;
    }
    
    if (typeof value === 'string') {
      return <span className={cn(
        "text-emerald-700 dark:text-emerald-400 font-medium",
        searchTerm && value.toLowerCase().includes(searchTerm.toLowerCase()) && 
        "bg-yellow-200 dark:bg-yellow-900 px-0.5 rounded"
      )}>{"\""+value+"\""}</span>;
    }
    
    return <span className="text-gray-400 dark:text-gray-400">...</span>;
  };

  return (
    <div className={cn(
      "transition-all py-1.5", 
      isRoot ? 'mt-0' : '',
      level > 0 && "hover:bg-gray-100/50 dark:hover:bg-gray-800/30 rounded",
      hasMatch && searchTerm && "bg-yellow-50/50 dark:bg-yellow-900/20 rounded border-l-2 border-yellow-300 dark:border-yellow-700 -ml-[2px]"
    )}>
      <div className="flex items-start gap-1">
        {isExpandable ? (
          <button
            onClick={handleToggle}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center justify-center"
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        
        <div className="flex-grow">
          <div className="flex items-center gap-1">
            {typeof name === 'string' ? (
              <span className={cn(
                "text-violet-700 dark:text-violet-400 font-semibold",
                searchTerm && name.toString().toLowerCase().includes(searchTerm.toLowerCase()) && 
                "bg-yellow-200 dark:bg-yellow-900 px-0.5 rounded"
              )}>{name}</span>
            ) : (
              <span className={cn(
                "text-gray-700 dark:text-gray-300 font-medium",
                searchTerm && name.toString().toLowerCase().includes(searchTerm.toLowerCase()) && 
                "bg-yellow-200 dark:bg-yellow-900 px-0.5 rounded"
              )}>{name}</span>
            )}
            <span className="mx-0.5">:</span>
            
            {!isExpandable && renderValue(data)}
          </div>

          {isExpandable && isExpanded && (
            <div className={cn("pl-5 border-l-2 border-indigo-200 dark:border-indigo-800/60 ml-1 mt-1.5")}>
              {isArray ? (
                // Render array items
                Object.entries(data).map(([index, value]) => (
                  <JSONNode
                    key={index}
                    data={value}
                    name={parseInt(index)}
                    level={level + 1}
                    defaultExpanded={level < 2}
                    searchTerm={searchTerm}
                    path={currentPath}
                  />
                ))
              ) : (
                // Render object properties
                Object.entries(data as JSONObject).map(([key, value]) => (
                  <JSONNode
                    key={key}
                    data={value}
                    name={key}
                    level={level + 1}
                    defaultExpanded={level < 2}
                    searchTerm={searchTerm}
                    path={currentPath}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
