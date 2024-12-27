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

      <div v-if="note.context" class="context-section">
        <!-- <h3>Context</h3> -->
        <div v-if="contextContent.content" class="context" v-html="contextContent.content"></div>
        <YouTubeEmbed v-if="contextContent.hasYouTube" :video-url="contextContent.videoUrl" />
      </div>

      <div v-if="note.hebrewInterlinear" class="hebrew-link-section">
        <h3>原文對照</h3>
        <a :href="note.hebrewInterlinear" target="_blank" rel="noopener noreferrer">{{ note.hebrewInterlinear }}</a>
      </div>

      <div v-if="note.crossReferences && note.crossReferences.length" class="cross-references-section">
        <h3>參考經文</h3>
        <div class="cross-references">
          <div v-for="(ref, index) in note.crossReferences" :key="index" class="cross-reference">
            <span class="reference" :style="{ color: '#ff69b4' }">{{ ref.book }} {{ ref.chapter }}:{{ ref.verse }}</span>
            <span class="text">{{ ref.text }}</span>
          </div>
        </div>
      </div>

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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vitepress'
import { useNotesStore } from '../store/notesStore.js'
import { getNoteById } from '../../api/getNoteById.js'
import YouTubeEmbed from '../components/YouTubeEmbed.vue'

const router = useRouter()
const store = useNotesStore()
const note = ref(null)
const loading = ref(true)
const error = ref(null)

const contextContent = computed(() => {
  if (!note.value?.context) return { hasYouTube: false, content: '' }
  
  // Find YouTube URL with all its parameters
  const youtubeMatch = note.value.context.match(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^\s<>"']+/g)
  if (!youtubeMatch) return { hasYouTube: false, content: note.value.context }
  
  const videoUrl = decodeURIComponent(youtubeMatch[0])
  const contentWithoutVideo = note.value.context.replace(youtubeMatch[0], '')
  
  return {
    hasYouTube: true,
    videoUrl,
    content: contentWithoutVideo
  }
})

async function loadNote() {
  try {
    // Get the note data from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search)
    const base64 = urlParams.get('data')
    
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
    
    note.value = JSON.parse(jsonStr)
    console.log(note.value)
    // check if note object has 'id' field
    if (!note.value || !note.value.id) {
      error.value = 'Invalid note data'
    } else {
      // fetch note from api endpoint
      const data = await getNoteById(note.value.id)
      note.value = data
      console.log(note.value)
      loading.value = false
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

.context-section {
  margin-bottom: 2rem;
}

.context {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #2c3e50;
}

.hebrew-link-section {
  margin-bottom: 2rem;
}

.hebrew-link-section a {
  text-decoration: none;
  color: #1976d2;
}

.hebrew-link-section a:hover {
  color: #2c3e50;
}

.cross-references-section {
  margin-bottom: 2rem;
}

.cross-references {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #2c3e50;
}

.cross-reference {
  margin-bottom: 1rem;
}

.cross-reference .reference {
  /* font-weight: bold; */
  font-size: 1.2rem;
  margin-right: 0.5rem;
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
