<template>
  <q-page class="anim-gradient-bg window-height window-width row justify-center items-center">
    <AgreeTerms v-if="show_terms_agree" @agree="clickAgree" />
    <q-card v-else square bordered class="q-pa-lg shadow-1 login_result">
      <!-- <q-card-section>
        <h3 class="text-center">{{ $t('login') }}</h3>
      </q-card-section> -->
      <q-card-section v-if="success" class="text-center">
        <h6>{{ $t('success') }}</h6>
      </q-card-section>
      <q-card-section v-if="loginError != null" class="text-center">
        <h6>{{ $t('error') + ' : ' + loginError }}</h6>
      </q-card-section>
      <q-card-actions v-if="loginError != null" align="center">
        <q-btn icon="home" :label="$t('Back')" @click="goHome" color="primary" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import AgreeTerms from '../components/AgreeTerms.vue'
import { LocalStorage } from 'quasar'
import { useUserStore } from 'src/stores/user-store'
const userStore = useUserStore()

import { useRoute, useRouter } from 'vue-router'
const $route = useRoute()
const $router = useRouter()

import { $jkutil, $api, $t } from 'boot/jkutil'

const loginError = ref(null)
const token = ref('')
const email = ref('')
const mobile = ref('')
const socialType = ref('')
const count = ref(0)
const success = ref(false)
const show_terms_agree = ref(false)
const login_result = ref(null)

onMounted(async () => {
  console.log('$route.query', $route.query)
  await login()
  // setTimeout(async () => {
  //   await login()
  // }, 5000)
})

const goHome = () => {
  window.location.href = '/'
}

const login = async () => {
  try {
    console.log('login', $route.query.tempToken)
    let result = await $api.login({
      temp_token: $route.query.tempToken,
      email: $route.query.email,
      login_code: $route.query.login_code,
      type: $route.query.type,
      host: $route.query.host,
    })
    console.log('result', result)
    if (result.error != null) {
      $jkutil.showError($t(result.error))
      $router.replace('/')
    } else {
      login_result.value = result
      console.log('login_result', login_result.value)
      if (result != null && result.agree_terms_and_privacy !== true) {
        show_terms_agree.value = true
      } else {
        await onLoginResult()
      }
    }
  } catch (e) {
    console.error('login', e.message)
    loginError.value = e.message
  }
}
const clickAgree = async (agree_push) => {
  await $api.agreeTerms(login_result.value.user_id, true, agree_push)
  await onLoginResult()
}

const onLoginResult = async () => {
  if (login_result.value == null) return
  if (login_result.value.token == null || login_result.value.token.length == 0) {
    $jkutil.showError('no_token_returned')
    success.value = false
    return
  }

  const data = {
    user_id: login_result.value.user_id,
    token: login_result.value.token,
    email: login_result.value.email,
    mobile: login_result.value.mobile,
    socialType: login_result.value.socialType,
    name: login_result.value.name,
    nickname: login_result.value.nickname,
    photo: login_result.value.photo,
    role: login_result.value.role,
    plan: login_result.value.plan,
    preview_level: login_result.value.preview_level,
  }

  userStore.setLoginData(data)
  if (login_result.value.nickname == null || login_result.value.nickname.length == 0) {
    $router.replace('/my')
  } else {
    let url_before_login = LocalStorage.getItem('url_before_login')
    if (url_before_login != null && url_before_login.length > 0) {
      LocalStorage.remove('url_before_register')
      $router.replace(url_before_login)
    } else {
      $router.replace('/')
    }
  }
}
</script>

<style>
.login_result {
  width: 360px
}
</style>
