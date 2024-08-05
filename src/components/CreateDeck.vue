<template>
  <q-card class="deck-card">
    <q-card-section>
        <q-card-title>
          덱 생성
        </q-card-title>
    </q-card-section>
    <q-card-section>
        <div class="row justify-between">
        <q-input class="col-9" v-model="deck_name" label="덱 이름" />
        </div>
    </q-card-section>
    <q-card-section>
      <q-card-title>
        카드 추가
      </q-card-title>
    </q-card-section>
    <q-card-section>
      <div class="row">
        <div class="col-9">
          <q-input class="row-6" v-model="front" label="front" />
          <q-input class="row-6" v-model="back" label="back" />
        </div>
        <div class="col-3 q-px-md flex flex-end">  
          <q-btn dense color="primary" @click="createCard()">카드 추가</q-btn>
        </div>
      </div>
      <q-list>
        <q-item v-for="(card, index) in card_list" :key="index">
          <q-item-section>
            <q-item-label>{{ card.front }}</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ card.back }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn dense color="negative" @click="card_list.splice(index, 1)">삭제</q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <q-card-section>
      <q-card-title>
        파일 업로드
      </q-card-title>
      <q-uploader
        url=""
        @added="handleFileUpload"
        label="파일을 여기에 드래그하거나 클릭하여 업로드"
        auto-upload
      />
    </q-card-section>
    <q-card-section>
      <q-card-title>
        이미지 업로드
      </q-card-title>
      <q-uploader
        url=""
        @added="handleImageUpload"
        label="이미지를 여기에 드래그하거나 클릭하여 업로드"
        auto-upload
        accept="image/*"
      />
    </q-card-section>    
    <q-card-actions align="right">
      <q-btn flat label="닫기" v-close-popup />
      <q-btn color="primary" label="생성" @click="CreateDeck()" />
    </q-card-actions>
  </q-card>
</template>

<script setup>

import { ref, onMounted, computed, watch } from "vue"
import { $jkutil, $t, $api, $q, $router } from 'boot/jkutil'


const card_list = ref([])
const show_dialog = ref(false)
const card_dialog = ref(false)
const deck_name = ref('')
const card_name = ref('')
const front = ref('')
const back = ref('')
const file = ref(null)
const image = ref(null)

onMounted(async () => {
})

const CreateDeck = async () => {
  let response = await $api.createDeck(deck_name.value, card_list.value)
  if (response?.challenge != null) {
    show_dialog.value = false
  }
}

const createCard = async () => {
  card_list.value.push({front: front.value, back: back.value})
}
const handleFileUpload = async(files) => {
  file.value = files[0]
  card_list.value.push(await $api.uploadFile(file.value))
  console.log(card_list.value)
}

const handleImageUpload = async(files) => {
  image.value = files[0]
  let upload = await $api.extractImage(image.value)
  console.log(upload)
  card_list.value.push(...upload)
  console.log('card_list', card_list.value)
} 

</script>

<style>
.deck-card {
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
