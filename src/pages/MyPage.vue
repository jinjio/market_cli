<template>
  <q-page padding>
    <!-- <pre>{{ me }}</pre> -->
    <q-list>
      <q-item>
        <q-item-section avatar>
          {{ $t('avatar') }}
        </q-item-section>
        <q-item-section>
          <q-avatar>
            <img :src="me.avatar == null ? '/user.svg' : me.avatar" />
          </q-avatar>
        </q-item-section>
        <q-item-section side>
          <!-- <q-btn outline :label="$t('update')" @click="onUpdateAvatar" /> -->
          <UploadButton :label="$t('update')" outline @uploaded="Uploaded">
          </UploadButton>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section avatar>
          {{ $t('email') }}
        </q-item-section>
        <q-item-section>
          <q-input v-model="me.email" filled readonly />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section avatar>
          {{ $t('name') }}
        </q-item-section>
        <q-item-section>
          <q-input v-model="nickname" filled />
        </q-item-section>
        <q-item-section side>
          <q-btn outline :label="$t('update')" @click="onUpdateMe('nickname', nickname)"
            :disable="nickname == me.nickname" />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section avatar>
          {{ $t('registered_at') }}
        </q-item-section>
        <q-item-section>
          <q-input v-model="me.created_at" filled readonly />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section avatar>
          {{ $t('language') }}
        </q-item-section>
        <q-item-section>
          <q-input v-model="lang_name" filled readonly />
        </q-item-section>
        <q-item-section side>
          <q-btn outline :label="$t('update')" @click="changeLang()" />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section avatar>
          {{ $t('push') }}
        </q-item-section>
        <q-item-section>
          <q-toggle v-model="me.push" @update:model-value="onPushChange" />
        </q-item-section>
      </q-item>
      <!-- <q-item>
        <q-item-section avatar>
          {{ $t('openai_api_key') }}
        </q-item-section>
        <q-item-section>
          <q-input v-model="api_key" filled />
        </q-item-section>
        <q-item-section side>
          <q-btn :label="$t('set')" color="green" @click="onSetAPIKey('openai')"
            :disable="api_key == null || api_key.length == 0" />
        </q-item-section>
      </q-item> -->
      <q-item>
        <q-item-section>
          <q-btn :label="$t('logout')" icon="logout" @click="logout()" color="info" class="q-mx-auto" />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-btn :label="$t('delete_account')" icon="waving_hand" @click="deleteAccount()" color="negative"
            class="q-mx-auto" />
        </q-item-section>
      </q-item>
    </q-list>

    <q-btn to="/debug" label="debug" />
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue"
import { $jkutil, $t, $api, $q, $router } from 'boot/jkutil'
import { useNavBarStore } from 'src/stores/navbar-store'
const navbar = useNavBarStore()

import UploadButton from 'components/UploadButton.vue'
// import Intl from 'intl'
const me = ref({})
const nickname = ref()
const lang_name = ref()
onMounted(async () => {
  $jkutil.tabBar.show()
  // $jkutil.navbar.setTitle(`${$t('my')}`)
  me.value = await $api.getMe()
  nickname.value = me.value.nickname
  const display_name = new Intl.DisplayNames([me.value.lang], { type: 'language' })
  lang_name.value = display_name.of(me.value.lang)
})

const logout = () => {
  $api.logout()
  $jkutil.user.logout()
  $router.push('/')
}

const deleteAccount = async () => {
  $q.dialog({
    title: $t('delete_account'),
    message: `${$t('delete_account_confirm')}`,
    cancel: true,
  }).onOk(async () => {
    $jkutil.user.logout()
    await $api.deleteAccount()
    $router.push('/')
  })

}

const onUpdateMe = async (key, value) => {
  let result = await $api.updateMe(key, value)
  if (result) {
    $q.notify({
      message: $t('update'),
      color: 'positive',
      icon: 'check'
    })
  }
}

const Uploaded = async (urls) => {
  console.log('Uploaded', urls)
  if (urls.length > 0) {
    await onUpdateMe('avatar', urls[0])
    me.value.avatar = urls[0]
  }
}

const onPushChange = async (value) => {
  console.log('onPushChange', value)
  if (value == false) {
    await $api.deleteWebPush()
  } else {
    await $api.setWebPush()
  }
}

const changeLang = () => {
  $jkutil.showInfo($t('change_lang_help'))
}

</script>
