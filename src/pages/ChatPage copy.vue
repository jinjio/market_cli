<template>
  <q-page class="relative" style="">
    <div class="bg-red-3 fullsize column">
      <q-scroll-area ref="chat_scroll_ref" class="col">
        <q-chat-message v-for="(item, chat_index) in chats" dark :text="item.text" :name="item.sender"
          :stamp="$jkutil.timeFromNow(item.stamp)" :sent="item.user_id == $jkutil.user.user_id"
          :avatar="item.avatar || '/user.svg'" text-html v-touch-hold.mouse="(event) => {
            handleHold(chat_index)
          }">
          <div v-for="text in   item.text  ">
            <div v-if="text == '⌛'">
              <q-spinner-dots size="1rem" />
            </div>
            <div v-else v-html="text">
            </div>
          </div>
          <div class="row" v-if="item.images != null && item.images.length > 0">
            <q-img :class="getImageClass(item.images.length, image_index)" v-for="(image, image_index) in item.images"
              :src="image" contain></q-img>
          </div>
        </q-chat-message>
      </q-scroll-area>
      <div class="col-auto">
        <div v-if="meeting_started == true" class="bg-white">
          <q-btn dense flat icon="stop" color="red-3" :label="$t('stop_meeting')" />
          <q-btn dense flat icon="videocam" color="grey" />
        </div>
        <q-input :dark="true" class="q-pa-xs bg-grey-9" style="width:100% !important;" v-model="chat_input" dense
          placeholder="메시지를 입력하세요." @keypress.enter.prevent="chatSend"
          :autofocus="$q.platform.is.mobile ? false : true">
          <template v-slot:before>
            <q-btn flat icon="add" @click="show_extra = true" />
          </template>
          <template v-slot:after>
            <q-btn class="" dense flat :icon="can_send_chat == true ? 'send' : 'stop_circle'"
              :color="chat_input.length > 0 ? 'primary' : 'grey'" @click="chatSend">
            </q-btn>
          </template>
        </q-input>
      </div>
    </div>
    <q-dialog v-model="show_extra" position="bottom">
      <div class="full-width bg-grey-9 q-pa-xs row q-pa-md" style="max-width:580px;">
        <div class="col text-center" v-for="extra in extra_menu">
          <q-btn style="min-width:80px;" dense stack outline no-caps :label="extra.name" :icon="extra.icon"
            @click="extra.handler" class="" />
        </div>
      </div>
    </q-dialog>
    <q-dialog v-model="show_file_dialog">
      <q-card style="min-width: 320px; width:'90vw'">
        <q-card-section>
          <q-list dense separator bordered>
            <q-separator spaced />
            <q-item-label header>{{ $t('installed') }} <q-chip dense color="grey-5">{{ chat_room.plugins.ai?.length
                }}</q-chip></q-item-label>
            <q-separator spaced />
          </q-list>
        </q-card-section>
        <q-card-section>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-uploader ref="uploader_ref" style="max-width: 300px" :url="getUploadURL" :headers="upload_headers"
      accept="image/*, video/*" :max-file-size="5 * 1024 * 1024" :form-fields="upload_form_fields"
      @uploaded="onUploaded" @rejected="onRejected" multiple batch auto-upload class="out_of_screen" />
    <q-dialog v-model="show_edit_chat_menu">
      <q-card style="min-width: 320x; min-height:200px">
        <q-card-section>
          <q-list dense class='bg-grey-1'>
            <q-item>
              <q-item-section>
                <q-btn dense flat icon="delete" :label="$t('delete')" color="negative" @click="onClickDeleteChat" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="show_create_challenge">
      <CreateChallenge/>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed, watch } from "vue"
import { $jkutil, $t, $api, $q, $router } from 'boot/jkutil'
import UploadButton from 'components/UploadButton.vue'
import ChallengeList from '../components/ChallengeList.vue'
import CreateChallenge from '../components/CreateChallenge.vue'

const props = defineProps({
  user_id: String,
  chat_room_id: String,
})

const show_right_menu = ref(false)
const show_photo_dialog = ref(false)
const show_file_dialog = ref(false)
const chat_scroll_ref = ref()
const photo_file = ref()
const file_picker_ref = ref()
const is_host = ref(false)
const isExpanded = ref(false)
const show_create_challenge = ref(false)

const extra_menu = [
  {
    name: $t('photo'),
    icon: 'photo',
    handler: (event) => {
      show_extra.value = false
      uploader_ref.value.reset()
      uploader_ref.value.pickFiles(event)
    }
  },
  {
    name: $t('file'),
    icon: 'description',
    handler: () => {
      show_extra.value = false
      show_file_dialog.value = true
    }
  },
  {
    name: $t('summarize'),
    icon: 'summarize',
    handler: () => {
      show_extra.value = false
      meeting_started.value = true
    }
  },
  {
    name: $t('separator'),
    icon: 'safety_divider',
    handler: () => {
      show_extra.value = false
      meeting_started.value = true
    }
  },
  {
    name: '암기',
    icon: 'book',
    handler: () => {
      show_extra.value = false
      $router.push('/anki_room/1')
    }
  },
  {
    name: '챌린지 만들기',
    icon: 'book',
    handler: () => {
      show_extra.value = false
      show_create_challenge.value = true
    }
  },
]

const meeting_started = ref(false)
const uploader_ref = ref()
const show_extra = ref(false)
const chats = ref([])
const chat_input = ref("")
const chat_room = ref({ plugins: [] })
onMounted(async () => {
  let response = await $api.getChat(props.chat_room_id)
  if (response == 'not_joined') {
    $router.replace('/my_chat')
  }

  chat_room.value = response?.chat_room || {}
  $jkutil.navbar.setTitle(`${chat_room.value.name}`)
  $jkutil.navbar.hide()
  if (chat_room.value.host_id == $jkutil.user.user_id) {
    is_host.value = true
  }

  chats.value = response?.chats || []
  chats.value.forEach(chat => {
    if (chat.text != null)
      chat.text = chat.text.map(text => text?.replace(/\n/g, '<br>'))
    // chat.text.forEach(texts => {
    //   console.log('texts', texts)
    //   // texts.forEach(text => {
    //   //   console.log(text)
    //   //   //   text = text.replace(/\n/g, '<br>')
    //   // })
    // })
  })

  // chats.value.forEach(chat => {

  //   chat.text = chat.text.map(texts => texts.map(text => text.replace(/\n/g, '<br>')))

  //   // chat.text = chat.text.map(texts => TextDecoderStream.map(str=> str.replace(/\n/g, "<br>"))
  // })
  if (response == null) {
    // setTimeout(() => { $router.replace('/#/chat_room') }, 1000)
    return
  }
  $api.addWebsocketListner(onWebsocketMessage, `/chat_room/${props.chat_room_id}`)
  nextTick(() => {
    scrollToBottom(0)
  })
})

onBeforeUnmount(() => {
  $api.removeWebsocketListner(onWebsocketMessage)
})

const can_send_chat = ref(true)
const onWebsocketMessage = async (message) => {
  console.log('ChatPage.vue onWebsocketMessage', message.command, message.options)
  if (message.command == 'hello') {
    // $api.sendCommand('join', {
    //   room_id: props.chat_id,
    //   // password: $jkutil.passwords[props.chat_id],
    //   room_type: 'chat_room'
    // })
  }
  else if (message.command == 'joined') {
    $jkutil.hideLoading()
  }
  else if (message.command == 'delete_chat') {
    show_edit_chat_menu.value = false
    let index = chats.value.findIndex(item => item.chat_id == message.options.chat_id)
    chats.value.splice(index, 1)
  }
  else if (message.command == 'chat') {
    console.log('---chat\n', message.options.text)
    if (message.options.is_finished) {
      can_send_chat.value = true
      return
    }
    if (message.options.text != null && message.options.text.length > 0) {
      message.options.text = message.options.text.map(str => str.replace(/\n/g, "<br>"))
    }
    // message.options.text[0] = message.options.text[0].replace(/\n/g, "<br>")
    if (message.options.option == 'stream') {
      let existing = chats.value.find((item) => {
        return item.chat_id == message.options.chat_id
      })
      if (existing != null) {
        can_send_chat.value = false
        existing.text[0] += message.options.text[0]
      } else {
        chats.value.push(message.options)
      }
      console.log('is_finised', message.options.is_finished)
      scrollToBottom()
    }
    else if (message.options.option == 'append') {
      let existing = chats.value.find((item) => {
        return item.chat_id == message.options.chat_id
      })
      if (existing != null) {
        let index = existing.text.indexOf('⌛')
        if (index !== -1) {
          existing.text.splice(index, 1, ...message.options.text)
          // existing.text[index] = message.options.text[0]
        } else {
          existing.text.push(message.options.text[0])
        }
        return
      } else {
        chats.value.push(message.options)
      }
      console.log('is_finised', message.options.is_finished)
    }
    else {
      chats.value.push(message.options)
    }
    scrollToBottom()
    if (message.options.user_id == $jkutil.user.user_id)
      chat_input.value = ''
  }
  else if (message.command == 'exit') {
    $router.replace('/my_chat')
  }
  else if (message.command == 'error') {
    $jkutil.showError($t(message.options.error_message))
    $router.replace('/my_chat')
  }

}

const chatSend = async () => {
  if (chat_input.value?.length == 0 || can_send_chat.value == false) return
  // props.websocket.sendCommand('chat', {
  //   text: chat_input.value,
  // })
  // $jkutil.showLoading('번역중입니다.')
  // let translated = await $api.translate(chat_input.value)
  // let translate = ''
  // let message = {
  //   text: [chat_input.value, translated],
  //   sender: $jkutil.user.name,
  //   is_me: true,
  //   // avatar: 'brocolli.svg',
  // }
  $api.sendCommand('chat', {
    text: chat_input.value,
  })
  // chat_input.value = ''
  // chat_scroll_ref.value.setScrollPercentage('vertical', 100, 50)

  // chats.value.push(message)
  // $jkutil.hideLoading()
}
// https://rapidapi.com/splintPRO/api/deepl-translator/

const scrollToBottom = (duration = 300) => {
  console.log('scrollToBottom=====>', chats.value.length - 1)
  // chat_scroll_ref.value.scrollTo(chats.value.length - 1, 'end-force')
  // nextTick(() => {
  // })
  setTimeout(() => {
    // 희안하게 1.1을 해야 끝까지 내려간다.
    chat_scroll_ref.value?.setScrollPercentage('vertical', 1.1, duration)
  }, 300)
}


const onUpdateRoom = async (key, value) => {
  await $api.updateChatRoom(props.chat_room_id, key, value)
}

const onClickDeleteRoom = async () => {
  $q.dialog({
    title: $t('delete'),
    message: $t('delete_confirm'),
    cancel: true,
  }).onOk(async () => {
    await $api.deleteChatRoom(props.chat_room_id)
    $router.push('/my_chat')
  })
}

const onClickLeaveRoom = async () => {
  $q.dialog({
    title: $t('leave'),
    message: $t('delete_confirm'),
    cancel: true,
  }).onOk(async () => {
    let response = await $api.deleteChatRoomMember(props.chat_room_id, $jkutil.user.user_id)
    if (response != null) {
      $router.push('/my_chat')
    }
  })
}

const onClickDeleteMember = async (member) => {
  $q.dialog({
    title: $t('delete'),
    message: `${$t('delete_confirm')} ${member.nickname}`,
    cancel: true,
  }).onOk(async () => {
    const result = await $api.deleteChatRoomMember(props.chat_room_id, member.user_id)
    if (result != null) {
      chat_room.value.members = chat_room.value.members.filter(item => item.user_id != member.user_id)
    }

  })
}

const onClickDeleteInvitee = async (invitee) => {
  $q.dialog({
    title: $t('delete'),
    message: `${$t('delete_confirm')} ${invitee.id}`,
    cancel: true,
  }).onOk(async () => {
    const result = await $api.deleteChatRoomInvitee(props.chat_room_id, invitee.id)
    if (result != null) {
      chat_room.value.invitees = chat_room.value.invitees.filter(item => item.id != invitee.id)
    }

  })
}

const onClickResend = async (invitee) => {
  const result = await $api.inviteChatRoom(props.chat_room_id, invitee.email)
  if (result != null) {
    $jkutil.showInfo($t('resend'))
  }
  // $q.dialog({
  //   title: $t('delete'),
  //   message: `${$t('delete_confirm')} ${invitee.id}`,
  //   cancel: true,
  // }).onOk(async () => {
  // })
}

const onClickInvite = async () => {
  $q.dialog({
    title: $t('invite'),
    message: `${$t('invite_help')}`,
    cancel: true,
    prompt: {
      model: '',
      isValid: val => $jkutil.isValidEmail(val), // << here is the magic
      type: 'email' // optional
    },
  }).onOk(async (invitee_email_address) => {
    let result = await $api.inviteChatRoom(props.chat_room_id, invitee_email_address)
    if (result != null) {
      if (result.invitee?.user_id != null) {
        chat_room.value.members.push(result.invitee)
      }
      else if (result.invitee?.email != null) {
        if (chat_room.value.invitees == null)
          chat_room.value.invitees = []

        chat_room.value.invitees.push({
          id: result.invitee.invite_id,
          email: result.invitee.email
        })
      }
    }
    $jkutil.showInfo($t(result.message))
  })
}

const files = ref([])
const onUploaded = async (info) => {
  console.log('uploaded:', info.xhr.response)
  let response = JSON.parse(info.xhr.response)
  if (response != null && response.urls.length > 0) {
    // $jkutil.showInfo($t(`${$t('uploaded')} ${response.urls}`))
    $api.sendCommand('chat', {
      images: response.urls,
    })
    uploader_ref.value.reset()

    // onImageSelected(response.name, response.url)
    // show_upload_menu.value = false
  }
}

const onRejected = (rejectedEntries) => {
  $jkutil.showError(`${rejectedEntries.length} file(s) did not pass validation constraints`)

  for (let fail of rejectedEntries) {
    $jkutil.showError(`Failed because: ${fail.failedPropValidation}`)
  }
}

const onAdded = (files) => {
  console.log('onAdded', files)
}

const onRemoved = (files) => {
  console.log('onRemoved', files)
}

const getUploadURL = (files) => {
  console.log('getUploadURL', files)
  return `${$api.upload_url}?count = ${files.length} `
}
const upload_headers = computed(() => {
  return [{
    name: 'authorization', value: `bearer ${$jkutil.user.token} `,
    charset: "utf-8",
  }]
})

const upload_form_fields = computed(() => {
  return [
    { name: 'content_type', value: 'chat_room' },
    { name: 'content_id', value: props.chat_room_id }
  ]
})

const getImageClass = (length, index) => {
  // console.log('getImageClass', length, index)
  if (length % 2 == 1) {
    if (index == length - 1) return 'col-12'
    return 'col-6'
  }
  else {
    return 'col-6'
  }
}

const editing_chat_index = ref()
const show_edit_chat_menu = ref(false)
const handleHold = (chat_index) => {
  editing_chat_index.value = chat_index
  show_edit_chat_menu.value = true
}

const onClickDeleteChat = async () => {
  const chat = chats.value[editing_chat_index.value]
  $api.sendCommand('delete_chat', {
    chat_id: chat.chat_id,
  })
}
</script>

<style>
.fullsize {
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
}

.chat_header {
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
  /* top: 165px; */
  position: absolute;
  top: 53px;
  bottom: 49px;
  left: 0px;
  right: 0px;
  padding: 6px;
  /* border: 1px solid red; */
}

.input_container>div {
  /* background-color: brown; */
  background-color: white;
  width: 100%;
}

.right_menu,
.q-dialog__inner {
  padding: 0px !important;
}
</style>
