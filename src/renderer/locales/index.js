import ruBase from './ru.json';
import enBase from './en.json';

// Namespaced translations are split by feature so that large areas of the
// application (rules, generators, trials, ...) can be translated independently.
const ruNamespaces = import.meta.glob('./namespaces/*.ru.json', { eager: true, import: 'default' });
const enNamespaces = import.meta.glob('./namespaces/*.en.json', { eager: true, import: 'default' });

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source || {})) {
    const sourceValue = source[key];
    if (isPlainObject(sourceValue) && isPlainObject(result[key])) {
      result[key] = deepMerge(result[key], sourceValue);
    } else {
      result[key] = sourceValue;
    }
  }
  return result;
}

function collectNamespaces(modules) {
  return Object.keys(modules)
    .sort()
    .reduce((acc, path) => deepMerge(acc, modules[path]), {});
}

export const dictionaries = {
  ru: deepMerge(ruBase, collectNamespaces(ruNamespaces)),
  en: deepMerge(enBase, collectNamespaces(enNamespaces))
};
