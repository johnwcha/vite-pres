<template>
  <div v-if="loading" class="loading">Loading note...</div>
  <div v-else-if="error" class="error">{{ error }}</div>
  <div v-else-if="note" class="note-detail">
    <div class="header">
      <h1 class="reference">{{ note.book }} {{ note.chapter }}:{{ note.verse }}</h1>
      <a @click.prevent="goBack" href="/notes/" class="back-link">← Back to Notes</a>
    </div>

    <div class="note-content">
      <div class="text" v-html="note.text"></div>
      
      <div class="meta-section">
        <div class="authors" v-if="Array.isArray(note.selectedAuthors) && note.selectedAuthors.length">
          <h3>Authors</h3>
          <div class="chip-container">
            <span v-for="author in note.selectedAuthors" 
                  :key="author" 
                  class="chip author">
              {{ author }}
            </span>
          </div>
        </div>
        
        <div class="tags" v-if="Array.isArray(note.tags) && note.tags.length">
          <h3>Tags</h3>
          <div class="chip-container">
            <span v-for="tag in note.tags" 
                  :key="tag" 
                  class="chip tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vitepress'

const router = useRouter()
const note = ref(null)
const loading = ref(true)
const error = ref(null)

function loadNote() {
  try {
    // Get the note data from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search)
    const base64 = urlParams.get('data')
    console.log('Raw base64:', base64)
    
    if (!base64) {
      error.value = 'Note data not provided'
      return
    }

    // Restore base64 padding
    const base64Padded = base64.replace(/-/g, '+').replace(/_/g, '/')
    const padding = 4 - (base64Padded.length % 4)
    const normalizedBase64 = base64Padded + ('='.repeat(padding % 4))

    // Decode base64 and handle UTF-8
    const jsonStr = decodeURIComponent(escape(atob(normalizedBase64)))
    console.log('Decoded JSON:', jsonStr)
    
    note.value = JSON.parse(jsonStr)
    console.log('Parsed note:', note.value)
    if (!note.value) {
      error.value = 'Invalid note data'
    }
  } catch (err) {
    console.error('Error:', err)
    error.value = 'Failed to load note'
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.go('/notes/')
}

onMounted(() => {
  loadNote()
})
</script>

<style scoped>
.loading, .error { 
  padding: 2rem; 
  text-align: center; 
}

.error { 
  color: #dc3545; 
}

.note-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.reference {
  margin: 0;
  font-size: 1.8rem;
  color: #2c3e50;
}

.back-link {
  color: #666;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: color 0.2s;
}

.back-link:hover {
  color: #1976d2;
}

.note-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.meta-section {
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}

.meta-section h3 {
  color: #666;
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
}

.chip-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.9rem;
}

.chip.author {
  background-color: #f3e5f5;
  color: #9c27b0;
}

.chip.tag {
  background-color: #e8f5e9;
  color: #2e7d32;
}
</style>
