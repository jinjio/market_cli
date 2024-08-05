<template>
    <q-card>
    <q-card-section>
        <q-card-title>
          챌린지 생성
        </q-card-title>
    </q-card-section>
    <q-card-section>
        <div class="row justify-between">
        <q-input class="col-9" v-model="deck_name" label="덱 이름" />
        <q-btn class="col-3" color="primary" @click="deck_dialog=true">덱 선택</q-btn>
        </div>
    </q-card-section>
    <q-card-section>
        <q-input v-model="challenge_name" label="챌린지 이름" />
    </q-card-section>
    <q-card-section>
        <q-input v-model="daily_word" label="하루 단어 수" />
    </q-card-section>
    <q-card-section class="row">
        <q-input filled v-model="start_date" mask="date" :rules="['date']" class="q-px-md">
        <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="start_date">
                <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
                </q-date>
            </q-popup-proxy>
            </q-icon>
        </template>
        </q-input>          
        <q-input filled v-model="end_date" mask="date" :rules="['date']" class="q-px-md">
        <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="end_date">
                <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
                </q-date>
            </q-popup-proxy>
            </q-icon>
        </template>
        </q-input>          
    </q-card-section>
    <q-card-actions align="right">
        <q-btn flat label="닫기" v-close-popup />
        <q-btn color="primary" label="생성" @click="CreateChallenge()" />
    </q-card-actions>
    </q-card>
    <q-dialog v-model="deck_dialog">
      <q-card  class="deck-list" >
        <q-card-section>
          <q-card-title>
            덱 선택
          </q-card-title>
        </q-card-section>
        <q-card-section>
          <q-list>
            <q-item clickable v-for="(deck, index) in deck_list" :key="index" @click="deck_name=deck.name;deck_dialog=false">
              <q-item-section>
                <q-item-label>{{ deck.name }} ({{deck.card_count}}개의 카드 )</q-item-label>
              </q-item-section>
              <q-item-sectrion>
                <q-btn label="수정" @click="show_create_deck=true"/>
              </q-item-sectrion>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-section>
          <q-btn color="primary" label="덱 생성" @click="show_create_deck=true"/>
        </q-card-section>
        <q-card-actions class="absolute-bottom">
          <q-btn flat label="닫기" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="show_create_deck">
      <CreateDeck/>
    </q-dialog>
     
</template>

<script setup>

import { ref, onMounted, computed, watch } from "vue"
import { $jkutil, $t, $api, $q, $router } from 'boot/jkutil'
import CreateDeck from './CreateDeck.vue'


const challenge_list = ref([])
const deck_list = ref([])
const show_dialog = ref(false)
const deck_dialog = ref(false)
const deck_name = ref('')
const challenge_name = ref('')
const daily_word = ref('')
const start_date = ref('')
const end_date = ref('')
const show_create_deck = ref(false)

onMounted(async () => {
  // let response = await $api.getChallengeList()
  deck_list.value = await $api.getDeckList()
  // challenge_list.value = response
})

const CreateChallenge = async () => {
  let response = await $api.createChallenge(deck_name.value, challenge_name.value, daily_word.value, start_date.value, end_date.value)
  if (response?.challenge != null) {
    challenge_list.value.push(response.challenge)
    show_dialog.value = false
  }
}
</script>

<style>
.deck-list {
    position: relative;
    min-width: 420px;
    min-height: 420px;
}
.absolute-bottom {
  position: absolute;
  justify-content: flex-end;
  bottom: 0;
}
</style>
