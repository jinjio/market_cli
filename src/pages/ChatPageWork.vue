<template>
  <q-page class="chat_bg relative" style="">
    <div class="work_info">
      <q-toolbar class="bg-blue-4">
        <q-btn icon="arrow_back" flat color="black" @click="$router.back()" />
        <q-toolbar-title class="text-bold  text-white">일자리 채팅(Work Chatting)</q-toolbar-title>
      </q-toolbar>
      <!-- <div class="col-12 text-white text-bold text-center text-h5 bg-blue-4">일자리 </div> -->
      <div class="row q-pa-xs" v-if="work != null">
        <div class="col-12">
          <span class="text-bold">{{ work.location }}</span> | <span>{{ work.employer }}</span>
        </div>
        <div class="col-12">
          <q-chip v-if="work.closed === true">모집마감</q-chip> <span class="text-bold">{{ work.title }}</span>
        </div>
        <div class="col-12">
          <span class="text-bold  q-mr-xs">모집기간</span><span>{{ work.recruitment_period_start }} ~ {{
            work.recruitment_period_end }}</span>
        </div>
        <div class="col-12">
          <span class="text-bold  q-mr-xs">작업기간</span><span> {{ work.working_period_start }} ~ {{
            work.working_period_end
          }}</span>
        </div>
        <div class="col-12 row">
          <span class="text-bold q-mr-xs">작업품목</span><span>{{ work.work_item }}</span>
        </div>
      </div>
    </div>
    <q-scroll-area class="chat_container absolute" ref="chat_scroll_ref">
      <q-chat-message v-for="(chat, chat_index) in chats" :key="chat_index" :text="chat.text" :sent="chat.is_me"
        :name="chat.sender" :avatar="chat.avatar != null ? chat.avatar : 'user.svg'" />
    </q-scroll-area>
    <q-page-sticky position="bottom" class="input_container">
      <q-input class="q-pa-xs" style="width:100% !important;" v-model="chat_input" dense outlined
        placeholder="메시지를 입력하세요." @keypress.enter.prevent="chatSend">
        <template v-slot:after>
          <q-btn class="" dense flat icon="send" :color="chat_input.length > 0 ? 'primary' : 'grey'" @click="chatSend" />
        </template>
      </q-input>
      <!-- <div class="full-width bg-orange">
        <q-btn label="red" />
      </div> -->
      <!-- <div class="full-width bg-blue">sticky</div> -->
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue"
import { $jkutil, $t, $api, $q } from 'boot/jkutil'

const props = defineProps({
  user_id: String,
  work_id: String,
})

const chat_scroll_ref = ref()
let original_text = '안녕하세요 AI 업무챗 다리챗에 들어오신 것을 환영합니다.'
let translated = 'Hello and welcome to LoveTalk, the place to meet new people.'
const chats = ref([
  {
    original_text: original_text,
    translate: translated,
    // text: [original_text, translated],
    text: [original_text],
    sender: '관리자 / Admin',
    is_me: false,
    avatar: 'admin.svg'
  },
])


import { useNavBarStore } from 'src/stores/navbar-store'
const navbar = useNavBarStore()

const chat_input = ref("Nice to meet you.I've been working in Korea for about a year.")
const work = ref()
onMounted(() => {
  let works = $jkutil.getWorks()
  work.value = works.find(w => w.id == props.work_id)
  navbar.hidden = true
})

const chatSend = async () => {
  if (chat_input.value?.length == 0) return
  // props.websocket.sendCommand('chat', {
  //   text: chat_input.value,
  // })
  $jkutil.showLoading('번역중입니다.')
  let translated = await $api.translate(chat_input.value)
  console.log('translated', translated)
  let message = {
    original_text: chat_input.value,
    text: [chat_input.value, translated],
    sender: '관리자',
    is_me: true,
    avatar: 'user.svg',

  }
  chats.value.push(message)
  chat_input.value = ''
  chat_scroll_ref.value.setScrollPercentage('vertical', 100, 50)
  $jkutil.hideLoading()
  // setTimeout(() => {
  //   //
  //   // chat_scroll_ref.value.scrollTop = chat_scroll_ref.value.scrollHeight + 10
  // }, 50)
}
// https://rapidapi.com/splintPRO/api/deepl-translator/
</script>

<style>
.work_info {
  position: sticky;
  top: 0px;
  border: 1px solid green;
  z-index: 1;
  background-color: white;
  /* top: 0px; */
}

.chat_bg {
  background-color: #b2c7da;
}

.chat_container {
  top: 165px;
  bottom: 49px;
  left: 0px;
  right: 0px;
  padding: 6px;
}

.input_container>div {
  /* background-color: brown; */
  background-color: white;
  width: 100%;
}
</style>
