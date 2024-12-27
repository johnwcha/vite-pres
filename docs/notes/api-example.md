# API Example

<script setup>
import { ref, onMounted } from 'vue'

const posts = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
    posts.value = await response.json()
    console.log(posts.value)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

This page demonstrates fetching data from a fake API ([JSONPlaceholder](https://jsonplaceholder.typicode.com/)) and displaying it.

<div v-if="loading">Loading...</div>
<div v-else-if="error">Error: {{ error }}</div>
<div v-else>
  <div v-for="post in posts" :key="post.id" class="post">
    <h2>{{ post.title }}</h2>
    <p>{{ post.body }}</p>
  </div>
</div>

<style scoped>
.post {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.post h2 {
  margin-top: 0;
  color: #2c3e50;
}
</style>