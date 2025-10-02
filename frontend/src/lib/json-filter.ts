import { JSONValue } from "@/components/JSONViewer";

// Helper function to filter JSON data based on a filter term
export function filterJSONData(data: JSONValue, filterTerm: string, currentPath = ''): JSONValue | null {
  // If filterTerm is empty, return the original data
  if (!filterTerm) return data;
  
  // Case-insensitive search
  const lowerFilterTerm = filterTerm.toLowerCase();
  
  // For primitive values, check if they match the filter
  if (typeof data === 'string') {
    return data.toLowerCase().includes(lowerFilterTerm) ? data : undefined;
  } else if (typeof data === 'number' || typeof data === 'boolean') {
    const strValue = String(data).toLowerCase();
    return strValue.includes(lowerFilterTerm) ? data : undefined;
  } else if (data === null) {
    return 'null'.includes(lowerFilterTerm) ? null : undefined;
  }
  
  // For arrays, filter each item and keep the array if any item matches
  if (Array.isArray(data)) {
    const filteredArray = data
      .map((item, index) => {
        const itemPath = currentPath ? `${currentPath}.${index}` : `${index}`;
        return filterJSONData(item, filterTerm, itemPath);
      })
      .filter(item => item !== undefined);
    
    return filteredArray.length > 0 ? filteredArray : undefined;
  }
  
  // For objects, filter properties and keep the object if any property matches
  if (data !== null && typeof data === 'object') {
    const result: Record<string, JSONValue> = {};
    let hasMatch = false;
    
    for (const [key, value] of Object.entries(data)) {
      // Check if key matches
      const keyMatches = key.toLowerCase().includes(lowerFilterTerm);
      
      // Build the path for this property
      const propPath = currentPath ? `${currentPath}.${key}` : key;
      
      // Check if value or its descendants match
      const filteredValue = filterJSONData(value, filterTerm, propPath);
      
      // If key matches, include just that key with its value
      if (keyMatches) {
        result[key] = value;
        hasMatch = true;
      }
      // If a descendant value matches, include the key with its filtered value
      else if (filteredValue !== undefined) {
        result[key] = filteredValue;
        hasMatch = true;
      }
    }
    
    return hasMatch ? result : undefined;
  }
  
  return undefined;
}
