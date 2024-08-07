<template>
  <q-page padding>
    <h3>Welcome to ...</h3>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue"
import { $jkutil, $t, $api, $q, $router } from 'boot/jkutil'

onMounted(async () => {
  // $router.replace(`/my_chat`)
})
</script>
