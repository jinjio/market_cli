<template>
  <q-page padding>
    <div>
      <q-card v-for="(feed, feed_index) in feeds" :key="`fi_${feed_index}`" class="">
        <q-card-section>
          {{ feed.content }}
        </q-card-section>
        <q-card-section>
          <q-carousel animated v-model="slide" arrows navigation infinite>
            <q-carousel-slide v-for="(photo, photo_index) in feed.photos" :key="`pi_${photo_index}`" :name="photo_index"
              :img-src="photo" />
          </q-carousel>
          <q-toolbar class="bg-green-4">
            <q-btn flat icon="favorite" @click="" color="red" />
            <span>좋아요{{ feed.likes }}</span>
            <q-space />
            <q-btn flat dense :icon-right="feed.expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
              @click="feed.expanded = !feed.expanded" :label="`댓글(${feed.comments.length})`" />
          </q-toolbar>
          <q-slide-transition>
            <div v-show="feed.expanded" class="bg-green-4">
              <q-separator />
              <div class="text-subitle2" v-for="(comment, comment_index) in feed.comments" :key="`ci_${comment_index}`">
                <q-chip>
                  <q-avatar>
                    <img :src="comment.photo">
                  </q-avatar>
                  {{ comment.user }}
                </q-chip>
                {{ comment.text }}
              </div>
            </div>
          </q-slide-transition>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue"
import { $jkutil, $t, $api, $q, $router } from 'boot/jkutil'
import { useNavBarStore } from 'src/stores/navbar-store'
const navbar = useNavBarStore()

onMounted(() => {
  navbar.hidden = false
  navbar.title = '피드'
  navbar.right_bar_button = {
    icon: 'add',
    // 펑션 포인터
    handler: () => {
      // 피드 추가
    }
  }
})

const feeds = ref([
  {
    content: '경치가 아름다운 곳을 방문했습니다.',
    photos: [
      'https://cdn.quasar.dev/img/mountains.jpg',
      'https://cdn.quasar.dev/img/parallax1.jpg',
      'https://cdn.quasar.dev/img/parallax2.jpg',
    ],
    i_like: true,
    likes: 10,
    comments: [
      {
        text: '좋아요',
        user: '양파',
        photo: 'onion.jpg',
      },
      {
        text: '멋져요',
        user: '양배추',
        photo: 'cabbage.jpg',
      },
      {
        text: '훌륭해요',
        user: '당근',
        photo: 'carrot.jpg',
      }
    ],
    expanded: false,
  }
])

feeds.value.push(JSON.parse(JSON.stringify(feeds.value[0])))
feeds.value.push(JSON.parse(JSON.stringify(feeds.value[0])))
feeds.value.push(JSON.parse(JSON.stringify(feeds.value[0])))
feeds.value.push(JSON.parse(JSON.stringify(feeds.value[0])))
feeds.value.push(JSON.parse(JSON.stringify(feeds.value[0])))
feeds.value.push(JSON.parse(JSON.stringify(feeds.value[0])))

const slide = ref(0)

</script>
