<template>
  <q-page class="anim-gradient-bg window-height window-width row justify-center items-center non-selectable">
    <div class="column">
      <div class="row">
        <q-avatar class="col q-mb-sm" rounded size="48px">
          <img src="/logo.svg" />
          <div class="q-ml-sm">{{ $t('AppName') }}</div>
        </q-avatar>
      </div>
      <div class="row">
        <q-card bordered class="q-pa-lg shadow-1 text-center register">
          <q-card-section v-if="$jkutil.user.isLoggedIn" class="q-mt-sm row q-gutter-sm">
            <div class="col-12">{{ $t('already_logged') }}</div>
            <q-btn icon="home" to="/" unelevated color="light-green-7" size="lg" class="col-12">{{ $t('home') }}</q-btn>
          </q-card-section>
          <q-card-section v-if="!$jkutil.user.isLoggedIn" class="q-mt-sm">
            <div class="text-h6">{{ $t('register_result_title') }}</div>
            <q-img src="~assets/check_your_email.svg" style="height: 140px; max-width: 200px"></q-img>
            <div v-if="success" class="row q-gutter-xs q-mt-sm">
              <div class="col-12" v-html="$t('register_result_body_after_mail')"></div>
              <q-input class="col-12" outlined dense v-model="login_code" :label="$t('login_code')"
                @keypress.enter.prevent="onClickEnterCode" />
              <q-btn class="col-12" unelevated color="green-6" icon="vpn_key" @click="onClickEnterCode()"
                :label="$t('enter_code')" />
              <q-btn class="col-12" unelevated color="orange-10" icon="arrow_back" @click="success = false"
                :label="$t('cancel')" />
            </div>
            <div v-else class="q-mt-sm row q-gutter-xs">
              <div class="col-12 text-subtitle1" v-html="$t('register_result_body_before_mail')"></div>
              <q-input class="col-12" outlined clearable dense v-model="contact" type="email" :label="$t('email')"
                :disable="success" @keypress.enter.prevent="onClickLoginByEmail" />
              <q-btn class="col-12" v-if="success == false" type="submit" unelevated color="orange-10" icon="email"
                @click="onClickLoginByEmail()" :label="$t('login_by_email')" />
              <div class="column q-mt-sm q-ml-auto q-mr-auto">
                <!-- <q-inner-loading :showing="loading" class>
								<q-spinner-facebook size="60px" color="primary" />
							</q-inner-loading> -->
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section v-if="!$jkutil.user.isLoggedIn">
            <div class="row q-mx-auto">
              <q-btn class="col-12" @click="onClickGoogleLogin" icon="img:/social/login_google.svg" outline>{{
            $t('google_login') }}</q-btn>

              <!-- <q-btn @click="onClickKakaoLogin" class="bg-yellow col" icon="img:/social/login_kakao@3x.png">
                {{ $t('kakao_login') }}
              </q-btn> -->
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>

import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from "vue"
import { useI18n } from 'vue-i18n'
const { locale } = useI18n({ useScope: 'global' })
import { $jkutil, $router, $t } from 'boot/jkutil'
import { $api } from 'boot/axios'
import { useNavBarStore } from 'src/stores/navbar-store'
const navbar = useNavBarStore()


const contact = ref('')
const type = ref('email')
const token = ref(null)
const lang = locale.value
const success = ref(false)
const login_code = ref(null)

onMounted(async () => {
  try {
    navbar.setTitle($t('register'))
    console.log(navbar.title)
  } catch (error) {
    console.error(error)
  }
})



const onClickLoginByEmail = async () => {
  console.log('onClickLoginByEmail')
  if ($jkutil.isValidEmail(contact.value) == false) {
    jkutil.showError(t('invalid_email'))
    return  
  }
  let result = await $api.requestLoginCode(contact.value)
  success.value = result.is_success
}

const onClickGoogleLogin = () => {
  // 참고 : https://developers.google.com/identity/protocols/oauth2/scopes
  let url = 'https://accounts.google.com/o/oauth2/v2/auth'
  let scope = 'email profile'
  // 구글 로그인은 # 이 붙으면 fragment error가 생긴다.
  // 그래서 authGoogle로 보내면 이게 / 로 가는데 여기서 window.location.href 을 이용해서 라우팅을 돌리자.
  // Invalid parameter value for redirect_uri: Fragment not allowed: http://localhost:8080/#/auth
  // redirect url 추가하는 곳: https://console.developers.google.com/apis/credentials/oauthclient/1017353774615-9jq1jmrvp07glgui60qd5slv4cd73n9t.apps.googleusercontent.com?project=1017353774615
  let redirect_uri = $api.google_redirect_url

  console.log('redirect_uri', redirect_uri)
  // let client_id = 'client_id=822221063607-mfg6cjqo1v3n8qiq32r4vvu7hnhgru21.apps.googleusercontent.com'
  let client_id = 'client_id=13088297217-nv5ntslqd7ah82tjq5vmtdga6b44g95b.apps.googleusercontent.com'
  console.log(
    'new href',
    `${url}?scope=${scope}&include_granted_scopes=true&state=profile&response_type=code&${client_id}&redirect_uri=${redirect_uri}`
  )
  location.href = `${url}?scope=${scope}&include_granted_scopes=true&state=profile&response_type=code&${client_id}&redirect_uri=${redirect_uri}`
  // console.log(`${url}?scope=${scope}&include_granted_scopes=true&state=profile&response_type=code&${client_id}&redirect_uri=${redirect_uri}`)
}

const onClickKakaoLogin = () => {
  let url = 'https://kauth.kakao.com/oauth/authorize'
  let client_id = 'fc19e1bd47d195f997dd8f891c0914f8'
  // let redirect_uri = `${window.location.origin}/oauth/kakao`
  // redirect_uri = redirect_uri.replace(':8080', ':9500')
  console.log('process.env.DEV', process.env.DEV)
  let redirect_uri
  if (process.env.DEV) {
    redirect_uri = `http://localhost:9500/oauth/kakao/${location.host.split(':')[0]}`
  } else {
    redirect_uri = `https://api.hanform.com:9500/oauth/kakao/${location.host.split(':')[0]}`
  }
  console.log('redirect_uri', redirect_uri)
  location.href = `${url}?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}&origin=${window.location.origin}`
}

const onClickEnterCode = async () => {
  console.log('redirect', `/#/login/?type=email&email=${contact.value}&login_code=${login_code.value}`)
  $router.replace(`/login/?type=email&email=${contact.value}&login_code=${login_code.value}`)
}

</script>

<style>
.register {
  width: 360px
}
</style>
