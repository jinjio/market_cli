<template>
  <q-page padding>
    <div>인재들의 목록이 여기에 오게 됩니다.</div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue"
import { $jkutil, $t, $api, $q } from 'boot/jkutil'
import { useNavBarStore } from 'src/stores/navbar-store'
const navbar = useNavBarStore()


onMounted(() => {
  navbar.hidden = false
})
</script>
