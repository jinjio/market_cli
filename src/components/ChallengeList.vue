<template>
      <div class="scroll">
      <q-list separator bordered v-if="challenge_list?.length > 0">
        <div v-for="(challenge, index) in challenge_list" :key="index" >
          <q-item >
            <q-item-section>
              <q-item-label overline>{{ challenge.id }}</q-item-label>
              <q-item-label>{{ challenge.name }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn @click="onClickShowRanking()">순위 보기</q-btn>
            </q-item-section>      
            <q-item-section side>
              <q-chip dense>
                  명
              </q-chip>
            </q-item-section>
          </q-item>
        <q-item v-for="index in challenge.day_diff+1" :key="index" clickable @click="onClickTalk(challenge.id, index - 1)">
          <q-item-section>
            <q-item-label>
              {{index}}일차: {{challenge.daily_word}} 단어 {{challenge.day_diff+1 == index?'(진행중)': '(완료)'}}
            </q-item-label>
          </q-item-section>
          <q-item-section avatar="">
            <q-chip v-if="challenge.day_diff+1 == index" icon="star">오늘의 단어</q-chip>
          </q-item-section>
          <q-item-section avatar>
            <q-btn color="green" @click="type='multipleChoice'">객관식</q-btn>
          </q-item-section>
          <q-item-section avatar>
            <q-btn color="primary" @click="type='answer'">주관식</q-btn>
          </q-item-section>
        </q-item>
        </div>
      </q-list>
      <div v-else>
        <q-banner class=" text-center"> 없음 </q-banner>
      </div>
      <q-dialog v-model="ranking_dialog">
        <q-card class="custom-card">
          <q-card-section class="half-height">
            <MissionGraph />
          </q-card-section>
          <q-card-section>
            순위
          </q-card-section>
          <q-card-section>
            <q-list>
              <q-item v-for="(rank, index) in ranking" :key="index">
                <q-item-section avatar>
                  <q-item-label>{{rank.user_id}}</q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{rank.score}}점</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn label="닫기" color="primary" @click="ranking_dialog=false"/>
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </template>
  
  <script setup>
  
  const props = defineProps({
    chat_room_id: String
  })


  import { ref, onMounted, computed, watch, nextTick } from "vue"
  import { $jkutil, $t, $api, $q, $router } from 'boot/jkutil'
  import { Chart } from 'chart.js/auto';
  import MissionGraph from './MissionGraph.vue'

  const challenge_list = ref([])
  const deck_list = ref([])
  const ranking_dialog = ref(false)
  const ranking = ref([])
  const type = ref('multipleChoice')

  
  onMounted(async () => {
  
    console.log('chat_room_id',props.chat_room_id)
    let response = await $api.getChallengeList(props.chat_room_id)
    deck_list.value = await $api.getDeckList()
    challenge_list.value = response

    ranking.value = await $api.getRanking(challenge_list.value[0].id)
    // for (let i = 0; i < user_list.length; i++) {
    //   // let response = await $api.getRanking(challenge_list.value[i].id)
    //   challenge_list.value[i].ranking = response
    // }
    console.log(ranking.value,'ranking')
  })
  
  const onClickTalk = (challenge, day_diff) => {
    $router.push(`/challenge/${challenge}/${day_diff}/${type.value}`)
  }
    
  const onClickShowRanking = async () => {
    ranking.value = await $api.getRanking(challenge_list.value[0].id)
    ranking_dialog.value = true
  }



  </script>

<style>
.scroll {
  max-height: 70vh;
  overflow-y: auto;
}
.custom-card {
  width: 80vw;
  height: 80vh;
  max-width: 600px;
  margin: 0 auto;
  font-size: 1.2em;
  overflow: hidden;
}
.q-dialog__inner {
  display: flex;
  align-items: center;
  justify-content: center;
}
.half-height {
  height: 50%;
}
</style>
  