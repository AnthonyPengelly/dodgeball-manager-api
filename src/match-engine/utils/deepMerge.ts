/**
 * Utility type that makes all properties and nested properties optional
 * This is useful for state updates where you only want to specify the properties that changed
 */
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * Deep merges source objects into target object
 * Recursively merges the properties of source objects into the target object
 * Arrays are replaced, not merged
 * 
 * @param target The target object to merge into
 * @param sources The source objects to merge from
 * @returns The merged object (same as target)
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: DeepPartial<T>[]
): T {
  if (!sources.length) return target;
  
  const source = sources.shift();
  if (!source) return target;

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      
      if (sourceValue === undefined) continue;
      
      const targetValue = target[key];
      
      // If both values are objects, recursively merge
      if (
        sourceValue && 
        typeof sourceValue === 'object' && 
        !Array.isArray(sourceValue) &&
        targetValue && 
        typeof targetValue === 'object' && 
        !Array.isArray(targetValue)
      ) {
        // Type assertion here to help TypeScript understand our runtime checks
        deepMerge(targetValue as Record<string, any>, sourceValue as Record<string, any>);
      } else {
        // For arrays and primitive values, replace
        // Using type assertion because we've done the proper runtime checks
        target[key] = sourceValue as any;
      }
    }
  }

  // Continue with the next source if any
  return deepMerge(target, ...sources);
}

/**
 * Updates state with changes
 * A convenience wrapper around deepMerge
 * 
 * @param state The state to update
 * @param changes The changes to apply to the state
 * @returns The updated state (same as state)
 */
export function updateState<T extends Record<string, any>>(
  state: T,
  changes: DeepPartial<T>
): T {
  return deepMerge(state, changes);
}
