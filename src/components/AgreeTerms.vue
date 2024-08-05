<template>
  <q-card style="min-width: 420px">
    <q-list>
      <q-item>
        <q-item-section>
          <q-checkbox class="text-primary" keep-color color="primary" :label="`${$t('agree_terms')} (${$t('required')})`"
            v-model="agree_terms_and_privacy" />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <div class="q-ml-md">{{ `${$t('agree_terms')} (${$t('required')})` }}</div>
        </q-item-section>
        <q-item-section side>
          <q-btn :label="$t('view')" outline @click="viewTerms" />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <div class="q-ml-md">{{ `${$t('agree_privacy')} (${$t('required')})` }}</div>
        </q-item-section>
        <q-item-section side>
          <q-btn :label="$t('view')" outline @click="viewPrivacy" />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-checkbox class="text-secondary" keep-color color="secondary"
            :label="`${$t('agree_push')} (${$t('optional')})`" v-model="agree_push" />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-btn outline color="primary" :label="$t('ok')" icon="check" @click="clickAgree"
            :disable="agree_terms_and_privacy == false" />
        </q-item-section>
      </q-item>
    </q-list>
    <q-dialog v-model="viewDocument" full-width full-height>
      <q-card>
        <q-card-section class="row items-center q-py-none">
          <!-- <div class="text-h6">Close icon</div> -->
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup class="" />
        </q-card-section>
        <q-card-section>
          <q-markdown class="">{{ viewDocumentContent }}</q-markdown>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
// import test_txt from '../markdown/test.txt?raw'
import terms_markdown_file from '../markdown/terms.md?raw'
import privacy_markdown_file from '../markdown/privacy.md?raw'
const viewDocument = ref(false)
const viewDocumentContent = ref(null)
const agree_terms_and_privacy = ref(false)
const agree_push = ref(false)
const emit = defineEmits(['agree'])
import { $jkutil, $api, $t } from 'boot/jkutil'

const clickAgree = async () => {
  if (agree_terms_and_privacy.value == false) return
  emit('agree', agree_push.value)
}

const viewTerms = () => {
  viewDocument.value = true
  viewDocumentContent.value = terms_markdown_file
}

const viewPrivacy = () => {
  viewDocument.value = true
  viewDocumentContent.value = privacy_markdown_file
}
</script>
