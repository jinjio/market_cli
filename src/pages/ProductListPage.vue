<template>
  <q-page class="q-pa-sm">
    <div class="row q-mb-md">
      <q-btn
        flat
        round
        icon="place"
        class="q-mr-sm"
        @click="$router.push('/my_location')"
      ></q-btn>
      <q-input
        v-model="search"
        placeholder="Search listings..."
        class="col"
        dense
        outlined
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-btn flat round icon="notifications_none" class="q-ml-sm" />
    </div>

    <div class="row q-mb-md items-center">
      <q-scroll-area horizontal style="height: 90px; width: 100%">
        <div class="row no-wrap q-gutter-sm">
          <div
            v-for="category in categories"
            :key="category.name"
            class="column items-center"
          >
            <q-avatar size="50px">
              <img :src="category.icon" />
            </q-avatar>
            <div class="text-caption">{{ category.name }}</div>
          </div>
        </div>
      </q-scroll-area>
    </div>

    <!-- 상품 목록 -->
    <div class="row q-col-gutter-sm">
      <div v-for="product in products" :key="product.id" class="col-6">
        <q-card flat class="my-card" @click="goToProductDetail(product.id)">
          <q-img :src="product.image" :ratio="1" />
          <q-card-section class="q-pa-sm">
            <div class="text-subtitle1 text-weight-bold">
              {{ product.price }}
            </div>
            <div class="text-caption">{{ product.name }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-footer elevated>
      <q-tabs
        class="text-white"
        active-color="primary"
        indicator-color="transparent"
      >
        <q-tab name="home" icon="home" label="Home" />
        <q-tab name="saved" icon="bookmark_border" label="Saved" />
        <q-tab
          name="add"
          icon="add_circle_outline"
          label="Sell"
          @click="$router.push('/product_upload')"
        />
        <q-tab name="chat" icon="chat_bubble_outline" label="Chat" />
        <q-tab name="account" icon="person_outline" label="Me" />
      </q-tabs>
    </q-footer>
    <q-dialog v-model="location_dialog">
      <q-card style="max-width: 90vw; max-height: 90vh">
        <CurrentLocationMap />
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import CurrentLocationMap from "../components/Map.vue";

export default defineComponent({
  name: "ProductListPage",
  components: {
    CurrentLocationMap,
  },

  setup() {
    const router = useRouter();
    const search = ref("");
    const location_dialog = ref(false);
    const categories = [
      { name: "Clothing", icon: "https://cdn.quasar.dev/img/mountains.jpg" },
      { name: "Furniture", icon: "https://cdn.quasar.dev/img/parallax1.jpg" },
      { name: "Electronics", icon: "https://cdn.quasar.dev/img/parallax2.jpg" },
      { name: "Book", icon: "https://cdn.quasar.dev/img/quasar.jpg" },
      { name: "Toy", icon: "https://cdn.quasar.dev/img/linux-avatar.png" },
    ];
    const products = [
      {
        id: 1,
        name: "블랙 플랫슈즈",
        price: "₩ 2,000",
        image: "https://cdn.quasar.dev/img/mountains.jpg",
      },
      {
        id: 2,
        name: "티셔츠",
        price: "₩ 10,000",
        image: "https://cdn.quasar.dev/img/parallax1.jpg",
      },
      {
        id: 3,
        name: "아이폰 케이스",
        price: "₩ 2,000",
        image: "https://cdn.quasar.dev/img/parallax2.jpg",
      },
      {
        id: 4,
        name: "스니커즈",
        price: "₩ 3,000",
        image: "https://cdn.quasar.dev/img/quasar.jpg",
      },
    ];

    const goToProductDetail = (productId) => {
      router.push(`/product/${productId}`);
    };

    return {
      search,
      categories,
      products,
      location_dialog,
      goToProductDetail,
    };
  },
});
</script>
