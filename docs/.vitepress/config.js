import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "My Faith Notes",
  description: "A VitePress Site",
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'Notes', link: '/notes/' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/guide/introduction' },
        ]
      },
      {
        text: 'API',
        items: [
          { text: 'example', link: '/notes/api-example' },
        ]
      }
    ]
  }
})
// * admin -> firebase deploy --only hosting:faith-notes
// * user  -> firebase deploy --only hosting:faithnotes