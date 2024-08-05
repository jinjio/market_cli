<template>
  <q-btn :color="color" :disable="disable" @click="onClick">
    <!-- <slot>multiple : {{ multiple }}</slot> -->
    <q-uploader ref="uploader_ref" style="max-width: 300px" :url="getUploadURL" :headers="upload_headers"
      accept="image/*, video/*" :max-file-size="5 * 1024 * 1024" :form-fields="upload_form_fields" @uploaded="onUploaded"
      @rejected="onRejected" :multiple="multiple" batch auto-upload class="out_of_screen" />
  </q-btn>
</template>

<script setup>
import { QBtn } from 'quasar'
import { ref, defineComponent, computed } from 'vue'
import { $jkutil, $t, $api, $q, $router } from 'boot/jkutil'

defineComponent({
  extends: QBtn,
})

const props = defineProps({
  color: {
    type: String,
    default: 'primary'
  },
  disable: Boolean,
  multiple: Boolean,
})

const emit = defineEmits(['click', 'uploaded'])


const onClick = () => {
  uploader_ref.value.reset()
  uploader_ref.value.pickFiles(event)
}

const uploader_ref = ref()
const onUpdateAvatar = async (event) => {

}

const onUploaded = async (info) => {
  console.log('uploaded:', info.xhr.response)
  let response = JSON.parse(info.xhr.response)
  if (response != null && response.urls.length > 0) {
    $jkutil.showInfo($t(`${$t('uploaded')} ${response.urls}`))
    emit('uploaded', response.urls)
    uploader_ref.value.reset()
  }
}

const getUploadURL = (files) => {
  console.log('getUploadURL', files)
  return `${$api.upload_url}?count = ${files.length} `
}

const onRejected = (rejectedEntries) => {
  $jkutil.showError(`${rejectedEntries.length} file(s) did not pass validation constraints`)

  for (let fail of rejectedEntries) {
    $jkutil.showError(`Failed because: ${fail.failedPropValidation}`)
  }
}

const upload_headers = computed(() => {
  return [{
    name: 'authorization', value: `bearer ${$jkutil.user.token} `,
    charset: "utf-8",
  }]
})

const upload_form_fields = computed(() => {
  return [
    { name: 'content_type', value: 'avatar' },
  ]
})

</script>
