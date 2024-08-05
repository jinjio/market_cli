<template>
  <q-page class="relative">
    <div class="bg-red-3 fullsize column">
      <q-scroll-area ref="chat_scroll_ref" class="col" style="background-color: white;">
        <q-chat-message
          v-for="(item, chat_index) in chats"
          dark
          :text="item.text"
          :name="item.sender"
          :stamp="$jkutil.timeFromNow(item.stamp)"
          :sent="item.user_id == $jkutil.user.user_id"
          :avatar="item.avatar || '/user.svg'"
          text-html
          :key="chat_index"
          v-touch-hold.mouse="
            (event) => {
              handleHold(chat_index);
            }
          "
        >
          <div v-for="(text, text_index) in item.text" :key="text_index" >
            <div v-if="text == '⌛'">
              <q-spinner-dots size="1rem" />
            </div>
            <div v-else v-html="text"></div>
          </div>
          <div class="row" v-if="item.images != null && item.images.length > 0">
            <q-img
              :class="getImageClass(item.images.length, image_index)"
              v-for="(image, image_index) in item.images"
              :src="image"
              :key="image_index"
              contain
            ></q-img>
          </div>
        </q-chat-message>
      </q-scroll-area>
      <div class="col-auto">
        <q-input
          :dark="true"
          class="q-pa-xs bg-grey-9"
          style="width: 100% !important"
          v-model="chat_input"
          dense
          placeholder="메시지를 입력하세요."
          @keypress.enter.prevent="chatSend"
          :autofocus="$q.platform.is.mobile ? false : true"
        >
          <template v-slot:before>
            <q-btn flat icon="add" @click="show_extra = true" />
          </template>
          <template v-slot:after>
            <q-btn
              class=""
              dense
              flat
              :icon="can_send_chat == true ? 'send' : 'stop_circle'"
              :color="chat_input.length > 0 ? 'primary' : 'grey'"
              @click="chatSend"
            >
            </q-btn>
          </template>
        </q-input>
      </div>
    </div>
  </q-page>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from "vue";
import { $jkutil, $api, $router } from "boot/jkutil";

const props = defineProps({
  user_id: String,
  chat_room_id: String,
});

const show_right_menu = ref(false);
const chat_scroll_ref = ref();
const chats = ref([]);
const chat_input = ref("");
const chat_room = ref({ name: "" });
const can_send_chat = ref(true);

onMounted(async () => {
  // let response = await $api.getChat(props.chat_room_id);
  let response = await $api.getChat('c4XZn-WBTmvn2QqzPXad3k');
  if (response == "not_joined") {
    $router.replace("/my_chat");
  }

  chat_room.value = response?.chat_room || {};
  chats.value = response?.chats || [];
  chats.value.forEach((chat) => {
    if (chat.text != null)
      chat.text = chat.text.map((text) => text?.replace(/\n/g, "<br>"));
  });

  if (response == null) {
    return;
  }

  $api.addWebsocketListner(
    onWebsocketMessage,
    `/chat_room/${props.chat_room_id}`
  );

  nextTick(() => {
    scrollToBottom(0);
  });
});

onBeforeUnmount(() => {
  $api.removeWebsocketListner(onWebsocketMessage);
});

const onWebsocketMessage = async (message) => {
  if (message.command == "delete_chat") {
    let index = chats.value.findIndex(
      (item) => item.chat_id == message.options.chat_id
    );
    chats.value.splice(index, 1);
  } else if (message.command == "chat") {
    if (message.options.is_finished) {
      can_send_chat.value = true;
      return;
    }
    if (message.options.text != null && message.options.text.length > 0) {
      message.options.text = message.options.text.map((str) =>
        str.replace(/\n/g, "<br>")
      );
    }
    if (message.options.option == "stream") {
      let existing = chats.value.find((item) => {
        return item.chat_id == message.options.chat_id;
      });
      if (existing != null) {
        can_send_chat.value = false;
        existing.text[0] += message.options.text[0];
      } else {
        chats.value.push(message.options);
      }
      scrollToBottom();
    } else if (message.options.option == "append") {
      let existing = chats.value.find((item) => {
        return item.chat_id == message.options.chat_id;
      });
      if (existing != null) {
        let index = existing.text.indexOf("⌛");
        if (index !== -1) {
          existing.text.splice(index, 1, ...message.options.text);
        } else {
          existing.text.push(message.options.text[0]);
        }
        return;
      } else {
        chats.value.push(message.options);
      }
    } else {
      chats.value.push(message.options);
    }
    scrollToBottom();
    if (message.options.user_id == $jkutil.user.user_id) chat_input.value = "";
  } else if (message.command == "exit") {
    $router.replace("/my_chat");
  } else if (message.command == "error") {
    $jkutil.showError($t(message.options.error_message));
    $router.replace("/my_chat");
  }
};

const chatSend = async () => {
  if (chat_input.value?.length == 0 || can_send_chat.value == false) return;
  $api.sendCommand("chat", {
    text: chat_input.value,
  });
};

const scrollToBottom = (duration = 300) => {
  setTimeout(() => {
    chat_scroll_ref.value?.setScrollPercentage("vertical", 1.1, duration);
  }, 300);
};

const getImageClass = (length, index) => {
  if (length % 2 == 1) {
    if (index == length - 1) return "col-12";
    return "col-6";
  } else {
    return "col-6";
  }
};

const handleHold = (chat_index) => {
  // Handle long press event
};
</script>

<style>
.fullsize {
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
}

</style>
