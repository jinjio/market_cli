import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'
import { Quasar } from 'quasar'

export default boot(({ app }) => {
  let localStr = Quasar.lang.getLocale()
  console.log('Quasar.lang.getLocale()', localStr)
  if (localStr === 'ko') {
    localStr = 'ko-KR'
    Quasar.lang.set(localStr)
  }
  console.log('>>> localStr', localStr)

  const i18n = createI18n({
    locale: localStr,
    // locale: 'en-US',
    globalInjection: true,
    messages
  })

  // Set i18n instance on app
  app.use(i18n)
})
