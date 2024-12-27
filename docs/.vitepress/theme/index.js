// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import NoteDetail from '../components/NoteDetail.vue'
import NoteDetailPage from './pages/NoteDetailPage.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('NoteDetail', NoteDetail)
    app.component('NoteDetailPage', NoteDetailPage)
  }
}
