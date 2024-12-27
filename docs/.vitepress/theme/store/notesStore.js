import { ref } from 'vue'

// Create a reactive state that persists between route changes
const state = {
  activeFilters: ref({
    book: null,
    author: null,
    tag: null
  }),
  currentPage: ref(1),
  notes: ref([])
}

// Store actions
export function setFilter(type, value) {
  state.activeFilters.value[type] = value
  state.currentPage.value = 1 // Reset to first page when filter changes
}

export function clearFilter(type) {
  state.activeFilters.value[type] = null
  state.currentPage.value = 1
}

export function setPage(page) {
  state.currentPage.value = page
}

export function setNotes(newNotes) {
  state.notes.value = newNotes
}

// Store getters
export function useNotesStore() {
  return {
    activeFilters: state.activeFilters,
    currentPage: state.currentPage,
    notes: state.notes,
    setFilter,
    clearFilter,
    setPage,
    setNotes
  }
}
