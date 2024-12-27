<template>
  <div class="youtube-embed">
    <iframe
      :src="embedUrl"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  videoUrl: {
    type: String,
    required: true
  }
})

const embedUrl = computed(() => {
  const url = props.videoUrl.replace(/&amp;/g, '&')
  
  // For youtu.be format
  const shortUrlMatch = url.match(/youtu\.be\/([^?]+)/)
  if (shortUrlMatch) {
    const videoId = shortUrlMatch[1]
    const timeMatch = url.match(/[?&]t=(\d+)/)
    const startTime = timeMatch ? timeMatch[1] : null
    return `https://www.youtube.com/embed/${videoId}${startTime ? `?start=${startTime}` : ''}`
  }
  
  // For youtube.com format (fallback)
  const videoId = url.match(/(?:youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^?&]+)/)?.[1]
  if (!videoId) return ''
  
  const timeMatch = url.match(/[?&]t=(\d+)/)
  const startTime = timeMatch ? timeMatch[1] : null
  
  return `https://www.youtube.com/embed/${videoId}${startTime ? `?start=${startTime}` : ''}`
})
</script>

<style scoped>
.youtube-embed {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  height: 0;
  overflow: hidden;
  margin: 1rem 0;
}

.youtube-embed iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
</style>
