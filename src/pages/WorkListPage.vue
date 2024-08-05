<template>
  <q-page padding>
    <q-list bordered separator>
      <q-item>
        <q-item-label>
          ※ 작업 정보와 위치는 임시데이터이며 번역해서 표시될 예정입니다.
        </q-item-label>
      </q-item>
      <q-item v-for="work in works" :key="work.id">
        <q-item-section>
          <div class="row">
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
        </q-item-section>
        <q-item-section side>
          <q-btn label="채팅하기" color="primary" icon="chat" @click="onClickChat(work)" />
        </q-item-section>
      </q-item>
    </q-list>
    <!-- <Chat ref="chat_ref" /> -->
  </q-page>
</template>

<script setup>
// import Chat from 'src/components/Chat.vue'

import { ref, onMounted, onUnmounted, nextTick, computed } from "vue"
import { $jkutil, $t, $api, $q } from 'boot/jkutil'

import { useRoute, useRouter } from 'vue-router'
const $route = useRoute()
const $router = useRouter()

import { useNavBarStore } from 'src/stores/navbar-store'
const navbar = useNavBarStore()


const works = ref($jkutil.getWorks())

const onClickChat = (work) => {
  $router.push(`/chat_room/${work.id}/${work.user_id}`)
}

onMounted(() => {
  navbar.hidden = false
})

</script>
