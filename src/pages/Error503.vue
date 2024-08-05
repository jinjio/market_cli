<template>
  <div class="fixed-center text-center">
    <p>
      <img src="~assets/sad.svg" style="width: 30vw; max-width: 150px" />
    </p>
    <p class="text-faded">
      {{ $t('server_down') }}
      <strong>(503)</strong>
    </p>
    <!-- <p>ver.{{ version }}</p> -->
    <!-- <p>origin: {{ $route.query.origin }}</p> -->
    <q-btn color="secondary" style="width: 200px" :label="$t('refresh')" icon="refresh" @click="onClickRefresh" />
  </div>
</template>

<script setup>
import { $jkutil, $t } from 'boot/jkutil'
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const $router = useRouter()
const $route = useRoute()

// export default {
//   name: 'Error503',
//   mounted() {
//     setTimeout(() => {
//       // this.$router.replace(this.$route.query.origin)
//       this.$router.replace('/')
//     }, 5000)
//   },
//   data() {
//     return {
//       version: packagejson.version,
//     }
//   },
// }

onMounted(() => {
})
const onClickRefresh = () => {
  $router.replace($route.query.origin)
}
</script>
