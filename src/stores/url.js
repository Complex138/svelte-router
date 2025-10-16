// Реактивный стор URL
import { writable } from 'svelte/store';

export const urlStore = writable({
  pathname: window.location.pathname,
  search: window.location.search
});

export function updateUrlStore() {
  urlStore.set({
    pathname: window.location.pathname,
    search: window.location.search
  });
}


