<template>
  <div class="giscus-wrapper">
    <ClientOnly>
      <div id="giscus" />
    </ClientOnly>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useData } from 'vitepress'

const { isDark } = useData()

const GISCUS_CONFIG = {
  src: 'https://giscus.app/client.js',
  'data-repo': '', // TODO: Replace with your repo
  'data-repo-id': '', // TODO: Replace with your repo ID
  'data-category': 'Comments',
  'data-category-id': '', // TODO: Replace with your category ID
  'data-mapping': 'pathname',
  'data-strict': '0',
  'data-reactions-enabled': '1',
  'data-emit-metadata': '0',
  'data-input-position': 'bottom',
  'data-lang': 'en',
  'data-loading': 'lazy',
  crossorigin: 'anonymous',
  async: true,
}

const updateGiscusTheme = (theme) => {
  const iframe = document.querySelector('iframe.giscus-frame')
  if (!iframe) return
  iframe.contentWindow.postMessage(
    { giscus: { setConfig: { theme } } },
    'https://giscus.app'
  )
}

const loadGiscus = () => {
  const script = document.createElement('script')
  Object.entries(GISCUS_CONFIG).forEach(([key, value]) => {
    script.setAttribute(key, value)
  })
  script.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  const giscusDiv = document.getElementById('giscus')
  if (giscusDiv) {
    giscusDiv.innerHTML = ''
    giscusDiv.appendChild(script)
  }
}

let themeObserver = null

onMounted(() => {
  loadGiscus()
  themeObserver = watch(isDark, (newValue) => {
    updateGiscusTheme(newValue ? 'dark' : 'light')
  })
})

onBeforeUnmount(() => {
  if (themeObserver) {
    themeObserver()
  }
})
</script>

<style scoped>
.giscus-wrapper {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-divider);
}
</style>
