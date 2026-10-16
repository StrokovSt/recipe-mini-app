import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './app/App'
import { initAnimations } from './shared/lib/animations'
import { loadFonts } from './shared/lib/fonts'
import { initI18n } from './shared/lib/i18n'
import { initTheme } from './shared/lib/theme'
import { preloadLoader } from './shared/ui/Spinner'

import '@fontsource-variable/literata/opsz.css'
import '@fontsource-variable/literata/opsz-italic.css'
import '@fontsource-variable/noto-sans/wght.css'
import '@fontsource-variable/noto-sans/wght-italic.css'
import '@fontsource-variable/noto-serif/wght.css'
import '@fontsource-variable/noto-serif/wght-italic.css'
import './app/styles/index.scss'

initTheme()
initAnimations()

// Рендерим после загрузки словарей выбранного языка, шрифтов и постера котика,
// чтобы не мелькали ключи, текст не перескакивал и котик был виден с первой загрузки
Promise.all([initI18n(), loadFonts(), preloadLoader()]).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
