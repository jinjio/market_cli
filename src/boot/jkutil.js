import { boot } from 'quasar/wrappers'
import { Loading, QSpinnerGrid } from 'quasar'
import { Notify, Dialog, copyToClipboard } from 'quasar'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
import { useUserStore } from 'src/stores/user-store'
import { useNavBarStore } from 'src/stores/navbar-store'
import { useTabBarStore } from 'src/stores/tabbar-store'

import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/zh'
import 'dayjs/locale/ja'
import 'dayjs/locale/vi'

import { nanoid } from 'nanoid'

// import duration from 'dayjs/plugin/duration'
// dayjs.extend(duration)

import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

class JKUtil {
  constructor(vue, router, store) {
    this.user = useUserStore(store)
    this.navbar = useNavBarStore()
    this.tabBar = useTabBarStore()
  }

  showLoading(message) {
    Loading.show({
      message,
      spinner: QSpinnerGrid,
    })
  }

  hideLoading() {
    Loading.hide()
  }

  showError(message, callback) {
    console.log('showError', message)
    if (callback != null) {
      Dialog.create({
        title: $t('error'),
        message: message,
        persistent: true,
      }).onOk((input) => {
        callback()
      })
    } else {
      Notify.create({
        message,
        icon: 'error',
        type: 'negative',
        timeout: 1000 // default 5000
      })
    }
  }

  showWarning(message) {
    Notify.create({
      message,
      icon: 'error',
      type: 'negative',
      timeout: 1000 // default 5000
    })
  }

  showInfo(message, timeout = 3000) {
    Notify.create({
      message,
      icon: 'info',
      type: 'info',
      timeout // default 5000
    })
  }

  isValidEmail(email) {
    const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
    return emailPattern.test(email)
  }

  isValidPhone(phone) {
    const phonePattern = /^(?=[0-9]{3}$)[0-9]{4}@(?:[0-9]{4}\.)$/
    return phonePattern.test(phone)
  }

  currentLanguage() {
    return $q.lang.getLocale().substring(0, 2)
  }
  getUserInput(title, message, placeholder) {
    return new Promise((resolve, reject) => {
      Dialog.create({
        title: title,
        message: message,
        prompt: {
          model: placeholder,
          type: 'text',
          isValid: val => val?.length > 0, // << here is the magic
        },
        cancel: true,
        persistent: true,
      }).onOk((input) => {
        resolve(input)
      }).onCancel(() => {
        resolve(null)
      })
    })
  }

  getSortedTranslateLangOptions() {
    let options = [
      {
        value: 'ko',
        label: $t('ko')
      },
      {
        value: 'en',
        label: $t('en')
      },
      {
        value: 'zh',
        label: $t('zh')
      },
      {
        value: 'ja',
        label: $t('ja')
      },
      {
        value: 'vn',
        label: $t('vn')
      },
      {
        value: 'es',
        label: $t('es')
      },
      {
        value: 'fr',
        label: $t('fr')
      },
      {
        value: 'de',
        label: $t('de')
      },
      {
        value: 'it',
        label: $t('it')
      },
      {
        value: 'bg',
        label: $t('bg')
      },
      {
        value: 'cs',
        label: $t('cs')
      },
      {
        value: 'da',
        label: $t('da')
      },
      {
        value: 'el',
        label: $t('el')
      },
      {
        value: 'et',
        label: $t('et')
      },
      {
        value: 'fi',
        label: $t('fi')
      },
      {
        value: 'hu',
        label: $t('hu')
      },
      {
        value: 'id',
        label: $t('id')
      },
      {
        value: 'lt',
        label: $t('lt')
      },
      {
        value: 'lv',
        label: $t('lv')
      },
      {
        value: 'nb',
        label: $t('nb')
      },
      {
        value: 'nl',
        label: $t('nl')
      },
      {
        value: 'pl',
        label: $t('pl')
      },
      {
        value: 'pt',
        label: $t('pt')
      },
      {
        value: 'ro',
        label: $t('ro')
      },
      {
        value: 'pl',
        label: $t('ru')
      },
      {
        value: 'sk',
        label: $t('sk')
      },
      {
        value: 'sl',
        label: $t('sl')
      },
      {
        value: 'sv',
        label: $t('sv')
      },
      {
        value: 'tr',
        label: $t('tr')
      },
      {
        value: 'uk',
        label: $t('uk')
      },
    ]

    return options.sort((a, b) => a.label.localeCompare(b.label))
  }

  timeFromNow(val) {
    // console.log('locale', locale)'
    return dayjs(val).locale($q.lang.getLocale()).fromNow()
  }

}

let $jkutil, $t, $router, $api, $q

export default boot(async ({ app, router, store, urlPath }) => {
  // something to do
  $jkutil = new JKUtil(app, router, store)
  app.config.globalProperties.$jkutil = $jkutil
  $t = app.config.globalProperties.$t
  $api = app.config.globalProperties.$api
  $q = app.config.globalProperties.$q
  $router = router
})

export {
  $jkutil, $t, $router, $api, $q
}
