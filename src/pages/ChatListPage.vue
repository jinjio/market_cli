<template>
  <q-page class="bg-black" padding>
    <!-- <pre>{{ chat_rooms }}</pre>
    <pre>{{ $jkutil.user }}</pre> -->
    <!-- <q-toolbar>
      <q-toolbar-title>{{ $t('chat') }}</q-toolbar-title>
    </q-toolbar> -->
    <!-- <pre>{{ chat_rooms.length }}</pre> -->
    <q-list separator bordered v-if="chat_rooms?.length > 0">
      <q-item v-for="(chat_room, index) in chat_rooms" :key="index" clickable @click="onClickTalk(chat_room)">
        <q-item-section avatar>
          <q-avatar class="bg-grey-2">
            <q-img fit='contain' :src='chat_room.icon || "/chat_room_cover.svg"' />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label overline>{{ chat_room.host }}</q-item-label>
          <q-item-label>{{ chat_room.name }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-chip dense>
            {{ chat_room.member_count }}명
          </q-chip>
        </q-item-section>
      </q-item>
    </q-list>
    <div v-else>
      <q-banner class=" text-center">{{ $t('nothing') }}</q-banner>
    </div>
  </q-page>
</template>

<script setup>

import { ref, onMounted, computed, watch } from "vue"
import { $jkutil, $t, $api, $q, $router } from 'boot/jkutil'

const chat_rooms = ref([])
onMounted(async () => {
  $jkutil.navbar.show()
  $jkutil.navbar.right_bar_button = {
    icon: 'add',
    handler: onClickCreateChatRoom
  }

  let response = await $api.listChats({ type: 'joined' })
  chat_rooms.value = response?.chat_rooms || []


})

const onClickTalk = (talk) => {
  $router.push(`/chat_room/${talk.id}`)
}

const onClickCreateChatRoom = async () => {
  let chat_name = await $jkutil.getUserInput($t('new_chat'), null, ``)
  if (chat_name == null || chat_name.length == 0) return
  let response = await $api.createChatRoom(chat_name)
  if (response?.chat != null) {
    chat_rooms.value.push(response.chat)
    console.log('chat_rooms', chat_rooms.value)
    $router.push(`/chat_room/${response.chat.id}`)
  }
}

</script>
