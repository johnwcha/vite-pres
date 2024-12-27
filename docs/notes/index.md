# Notes

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vitepress'
import { getNotes } from '../.vitepress/api/notes'
import { useNotesStore } from '../.vitepress/theme/store/notesStore'

const router = useRouter()
const { activeFilters, currentPage, notes, setFilter, clearFilter, setPage, setNotes } = useNotesStore()

const loading = ref(true)
const error = ref(null)
const itemsPerPage = 10
const searchText = ref('')

const filteredNotes = computed(() => {
  let result = notes.value
  
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase()
    result = result.filter(note => 
      note.text.toLowerCase().includes(searchLower)
    )
  }
  
  if (activeFilters.value.book) {
    result = result.filter(note => note.book === activeFilters.value.book)
  }
  
  if (activeFilters.value.author) {
    result = result.filter(note => 
      Array.isArray(note.selectedAuthors) && 
      note.selectedAuthors.includes(activeFilters.value.author)
    )
  }
  
  if (activeFilters.value.tag) {
    result = result.filter(note => 
      Array.isArray(note.tags) && 
      note.tags.includes(activeFilters.value.tag)
    )
  }
  
  return result
})

const paginatedNotes = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return filteredNotes.value.slice(startIndex, endIndex)
})

const totalPages = computed(() => Math.ceil(filteredNotes.value.length / itemsPerPage))

const hasActiveFilters = computed(() => {
  return Object.values(activeFilters.value).some(value => value !== null) || searchText.value !== ''
})

function goToPage(newPage) {
  if (newPage >= 1 && newPage <= totalPages.value) {
    setPage(newPage)
  }
}

function toggleFilter(type, value) {
  if (activeFilters.value[type] === value) {
    clearFilter(type)
  } else {
    setFilter(type, value)
  }
}

function isFilterActive(type, value) {
  return activeFilters.value[type] === value
}

function goToNote(note) {
  const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(note))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  router.go(`/notes/detail?data=${base64}`)
}

onMounted(async () => {
  try {
    const response = await getNotes()
    setNotes(response)
  } catch (err) {
    error.value = 'Failed to load notes'
  } finally {
    loading.value = false
  }
})
</script>

<div v-if="loading" class="loading">Loading notes...</div>
<div v-else-if="error" class="error">{{ error }}</div>
<div v-else class="notes-container">
  <div class="filters">
    <div class="search-box">
      <input 
        type="text" 
        v-model="searchText" 
        placeholder="Search in notes..." 
        class="search-input"
      />
    </div>
    <div v-if="hasActiveFilters" class="active-filters">
      <div v-if="activeFilters.book" class="filter-group">
        <span class="filter-label">Book:</span>
        <span class="chip book active" @click="clearFilter('book')">
          {{ activeFilters.book }} ×
        </span>
      </div>
      <div v-if="activeFilters.author" class="filter-group">
        <span class="filter-label">Author:</span>
        <span class="chip author active" @click="clearFilter('author')">
          {{ activeFilters.author }} ×
        </span>
      </div>
      <div v-if="activeFilters.tag" class="filter-group">
        <span class="filter-label">Tag:</span>
        <span class="chip tag active" @click="clearFilter('tag')">
          {{ activeFilters.tag }} ×
        </span>
      </div>
    </div>
  </div>

  <div class="results-info">
    Showing {{ paginatedNotes.length }} of {{ filteredNotes.length }} results
  </div>

  <div v-for="note in paginatedNotes" 
       :key="note.id" 
       class="note-item"
       @click="goToNote(note)"
       role="link"
       tabindex="0">
    <div class="content-row">
      <span class="chip book" 
            :class="{ active: isFilterActive('book', note.book) }" 
            @click.stop="toggleFilter('book', note.book)">
        {{ note.book }} {{ note.chapter }}:{{ note.verse }}
      </span>
      <div class="text" v-html="note.text"></div>
    </div>
    <div class="authors">
      <span class="label">Authors:</span>
      <span v-for="author in (Array.isArray(note.selectedAuthors) ? note.selectedAuthors : [])" 
            :key="author" 
            class="chip author"
            :class="{ active: isFilterActive('author', author) }"
            @click.stop="toggleFilter('author', author)">
        {{ author }}
      </span>
    </div>
    <div class="tags">
      <span class="label">Tags:</span>
      <span v-for="tag in (Array.isArray(note.tags) ? note.tags : [])" 
            :key="tag" 
            class="chip tag"
            :class="{ active: isFilterActive('tag', tag) }"
            @click.stop="toggleFilter('tag', tag)">
        {{ tag }}
      </span>
    </div>
  </div>
  
  <div v-if="totalPages > 1" class="pagination">
    <button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)" class="page-button">Previous</button>
    <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
    <button :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)" class="page-button">Next</button>
  </div>
</div>

<style scoped>
.notes-container { margin: 2rem 0; }
.loading, .error { padding: 1rem; text-align: center; }
.error { color: #dc3545; }

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
}

.results-info {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.note-item { 
  background: #ffffff; 
  border-radius: 8px; 
  padding: 1.5rem; 
  margin-bottom: 1rem; 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.note-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.note-item:focus {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

.content-row { display: flex; gap: 1rem; align-items: baseline; margin-bottom: 1rem; }
.text { line-height: 1.6; color: #333; flex: 1; }
.authors, .tags { font-size: 0.9rem; color: #666; margin-bottom: 0.5rem; }
.authors { margin-bottom: 0.5rem; }
.label { font-weight: 600; margin-right: 0.5rem; }

.chip {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-right: 0.5rem;
  transition: all 0.2s ease;
}

.chip.book {
  background-color: #e3f2fd;
  color: #1976d2;
}

.chip.book:hover, .chip.book.active {
  background-color: #1976d2;
  color: white;
}

.chip.author {
  background-color: #f3e5f5;
  color: #9c27b0;
}

.chip.author:hover, .chip.author.active {
  background-color: #9c27b0;
  color: white;
}

.chip.tag {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.chip.tag:hover, .chip.tag.active {
  background-color: #2e7d32;
  color: white;
}

.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 2rem; padding: 1rem; }
.page-info { font-size: 0.9rem; color: #666; }
.page-button { padding: 0.5rem 1rem; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; color: #666; font-size: 0.9rem; }
.page-button:hover:not(:disabled) { background: #f5f5f5; }
.page-button:disabled { opacity: 0.5; cursor: not-allowed; }

.search-box {
  margin-bottom: 1rem;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  font-size: 1rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.search-input:focus {
  outline: none;
  border-color: var(--vp-c-brand);
}
</style>
