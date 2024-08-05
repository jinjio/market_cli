<template>
  <q-page class="bg-blue-3" padding>
    <div class="q-mx-auto">
      <q-card v-for="(notice, notice_index) in notices" :key="notice_index" class="q-my-sm">
        <q-card-section>
          <div class="row items-center q-gutter-sm">
            <q-avatar class="col-auto" size="sm">
              <img src="notice.svg" />
            </q-avatar>
            <div class="text-h5 text-bold col">{{ notice.title }}</div>
          </div>
        </q-card-section>
        <q-card-section>
          <div v-html="notice.content"></div>
        </q-card-section>
      </q-card>
    </div>
    <!-- <img alt="Quasar logo" src="~assets/quasar-logo-vertical.svg" style="width: 200px; height: 200px">
     -->
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue"
import { $jkutil, $t, $api, $q, $router } from 'boot/jkutil'
import { useNavBarStore } from 'src/stores/navbar-store'
const navbar = useNavBarStore()

const notices = ref([
  {
    title: '미팅 시간 안내',
    content: '화요일 오후 3시에 중앙회의실에 제품 미팅이 있습니다. 늦지 않게 오시기 바랍니다.'
  },
  {
    title: '교통편 안내',
    content: '통근 버스는 00시 00분에 출발합니다. 늦지 않게 오시기 바랍니다.'
  },
  {
    title: '식사시간 안내',
    content: '조식 시간 00시 00분 ~ 00시 00분 <br>중식 시간 00시 00분 ~ 00시 00분<br>석식 시간 00시 00분 ~ 00시 00분 입니다.'
  },
  {
    title: '간식시간 안내',
    content: '조식 시간 00시 00분 ~ 00시 00분 <br>중식 시간 00시 00분 ~ 00시 00분<br>석식 시간 00시 00분 ~ 00시 00분 입니다.'
  },
  {
    title: '취침시간 안내',
    content: '00시 00분 ~ 00시 00분 입니다.'
  },
  {
    title: '식수 안내',
    content: '식수는 A동 1층에 있습니다.'
  },
])
onMounted(() => {
  // $router.replace('/work_list')
  $jkutil.navbar.show()
})
</script>
