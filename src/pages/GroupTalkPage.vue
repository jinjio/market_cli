<template>
  <q-page class="chat_bg relative" style="">
    <div class="chat_header bg-grey-4 row items-center" style="min-height:50px;">
      <div class="col-12 q-ml-sm">발표자</div>
      <div v-if="speakers.length == 0" class="text-center col-12">
        발표자 없음
      </div>
      <div v-else class="col-12">
        <q-chip v-for="(speaker, speaker_index) in speakers" :key="speaker_index" removable
          @remove="removeSpeaker(speaker_index)" color="blue-3">
          <q-avatar>
            <img :src="speaker.avatar">
          </q-avatar>
          {{ speaker.name }}
        </q-chip>
      </div>
    </div>
    <q-scroll-area class="chat_container absolute" ref="chat_scroll_ref">
      <q-chat-message v-for="(chat, chat_index) in chats" :key="chat_index" :text="chat.text" :sent="chat.is_me"
        :name="chat.sender" :avatar="chat.avatar != null ? chat.avatar : 'user.svg'" />
    </q-scroll-area>
    <q-page-sticky position="bottom" class="input_container">
      <q-toolbar v-if="am_i_an_speaker == false">
        <q-space />
        <q-btn flat icon="img:/hand.png" label="손들기(발언권요청)" outline @click="onClickRaiseHand" />
        <q-space />
      </q-toolbar>
      <q-input v-else class="q-pa-xs" style="width:100% !important;" v-model="chat_input" dense outlined
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
import { useNavBarStore } from 'src/stores/navbar-store'
const navbar = useNavBarStore()

const props = defineProps({
  user_id: String,
  work_id: String,
})

const speakers = ref([
  {
    name: '당근',
    avatar: 'carrot.jpg'
  },
  {
    name: '양파',
    avatar: 'onion.jpg'
  },
  {
    name: '양배추',
    avatar: 'cabbage.jpg'
  }
])

const chat_scroll_ref = ref()
const chats = ref([
  {
    text: ['안녕하세요 AI 업무챗 다리챗에 들어오신 것을 환영합니다.'],
    sender: '관리자',
    is_me: false,
    avatar: 'admin.svg'
  },
  {
    text: ['책 좋아하는 사람?'],
    sender: '당근',
    is_me: false,
    avatar: 'carrot.jpg'
  },
  {
    text: ['요즘 읽은 책중에 좋은 게 있나요?'],
    sender: '브로콜리',
    is_me: true,
    avatar: 'brocolli.jpg'
  },
  {
    text: ['크래프톤웨이를 재밌게 읽었습니다.'],
    sender: '양파',
    is_me: false,
    avatar: 'onion.jpg'
  },
  {
    text: ['우와 공유 감사합니다!'],
    sender: '양배추',
    is_me: false,
    avatar: 'cabbage.jpg'
  },
])



const chat_input = ref('')
//const am_i_an_speaker = ref(false) // 내가 발표자인가?

const am_i_an_speaker = computed(() => {
  return speakers.value.findIndex(speaker => speaker.name == '브로콜리') != -1
})

onMounted(() => {
  navbar.hidden = false
  navbar.title = '단체톡1'
})

const chatSend = async () => {
  if (chat_input.value?.length == 0) return
  // props.websocket.sendCommand('chat', {
  //   text: chat_input.value,
  // })
  $jkutil.showLoading('.')
  // let translated = await $api.translate(chat_input.value)
  // console.log('translated', translated)
  let message = {
    // original_text: chat_input.value,
    text: [chat_input.value],
    sender: '브로콜리',
    is_me: true,
    avatar: 'brocolli.jpg',

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

const onClickRaiseHand = () => {
  $jkutil.showInfo("손을 들고 발표자가 되는 것을 요청했습니다. 관리자가 승인하면 발표하실 수 있습니다.", 2500)
  setTimeout(() => {
    $q.notify({
      message: '브로콜리님이 발언하기 원합니다.',
      color: 'white',
      textColor: 'black',
      avatar: 'brocolli.jpg',
      position: 'top',
      timeout: 10000, // default 5000
      actions: [
        {
          label: '거부', color: 'red', handler: () => {
            $jkutil.showInfo("발언권을 얻지 못했습니다.", 3000)
          }
        },
        { label: '허가', color: 'green', handler: () => { speakers.value.push({ name: '브로콜리', avatar: 'brocolli.jpg' }) } }
      ]
    })
  }, 3000)
}

const removeSpeaker = (index) => {
  $q.dialog({
    title: '발언권 끄기',
    message: `${speakers.value[index].name}님의 발언권을 끄시겠습니까?`,
    cancel: true,
  }).onOk(async () => {
    speakers.value.splice(index, 1)
  })
}

</script>

<style>
.chat_header {
  position: sticky;
  top: 0px;
  z-index: 1;
  /* top: 0px; */
}

.chat_bg {
  background-color: #b2c7da;
}

.chat_container {
  top: 52px;
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
