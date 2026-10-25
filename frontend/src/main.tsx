import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './app/App'
import { loadMotionFeatures } from './app/providers/loadMotionFeatures'
import { preloadCurrentPage, preloadOnFirstAction } from './app/router'
import { initOnboarding } from './features/onboarding'
import { initAnimations } from './shared/lib/animations'
import { loadFonts } from './shared/lib/fonts'
import { initI18n, warmUpNumberFormat } from './shared/lib/i18n'
import { initInstallPrompt } from './shared/lib/pwa'
import { hideSplashWhen } from './shared/lib/splash'
import { loadTelegram } from './shared/lib/telegram'
import { initTheme } from './shared/lib/theme'
import { firstPageShown } from './shared/ui/PageWrapper'
import { preloadLoader } from './shared/ui/Spinner'

import '@fontsource-variable/literata/wght.css'
import '@fontsource-variable/literata/wght-italic.css'
import '@fontsource-variable/noto-sans/wght.css'
import '@fontsource-variable/noto-sans/wght-italic.css'
import '@fontsource-variable/noto-serif/wght.css'
import '@fontsource-variable/noto-serif/wght-italic.css'
import './app/styles/index.scss'

// Код открытой страницы качается параллельно со шрифтами и словарями, к рендеру он уже готов
preloadCurrentPage()
initAnimations()
initInstallPrompt()

// Заставка с печатью из index.html закрывает загрузку целиком: интерфейс появляется сразу весь, а не по частям
const loaderReady = preloadLoader()
hideSplashWhen(firstPageShown)
firstPageShown.then(preloadOnFirstAction)
firstPageShown.then(warmUpNumberFormat)
initOnboarding()

// Тема и язык могут браться из Telegram, поэтому определяем их после его SDK (на сайте он не качается)
const settingsReady = loadTelegram().then(() => {
  initTheme()
  return initI18n()
})

// Рендерим после загрузки словарей выбранного языка, шрифтов, постера котика и движка анимаций,
// чтобы не мелькали ключи, текст не перескакивал, котик был виден с первой же загрузки данных и страница сразу проявлялась
Promise.all([settingsReady, loadFonts(), loaderReady, loadMotionFeatures()]).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
