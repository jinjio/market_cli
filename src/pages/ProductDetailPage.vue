<template>
  <q-page class="q-pa-none">
    <q-img
      :src="product.image"
      class="q-mt-lg q-mx-md q-mb-md rounded-borders responsive-img"
    ></q-img>

    <div class="q-pa-md">
      <div class="text-h5 q-mb-sm">{{ product.name }}</div>
      <div class="text-h6 text-weight-bold q-mb-md">{{ product.price }}</div>
      <p>{{ product.description }}</p>
    </div>

    <q-item>
      <q-item-section avatar>
        <q-avatar>
          <q-icon name="person" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label>판매자 이름</q-item-label>
        <q-item-label caption>user_name</q-item-label>
      </q-item-section>
    </q-item>

    <q-page-sticky position="bottom" expand class="bg-white q-pa-sm">
      <div class="row q-col-gutter-sm">
        <div class="col">
          <q-btn
            color="grey"
            label="채팅하기"
            class="full-width"
            @click="$router.push('/chat')"
          />
        </div>
        <div class="col">
          <q-btn color="primary" label="구매하기" class="full-width" @click="$router.push('/payment')"/>
        </div>
      </div>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "ProductDetailPage",
  setup() {
    const route = useRoute();
    const productId = parseInt(route.params.id);

    const product = ref({
      id: productId,
      name: "블랙 플랫슈즈",
      price: "₩ 2,000",
      image: "https://cdn.quasar.dev/img/mountains.jpg",
      description:
        "편안한 착용감의 블랙 플랫슈즈입니다. 거의 새 상품이며, 1-2회 착용했습니다.",
    });

    return {
      product,
    };
  },
});
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}

.responsive-img {
  width: 100%;
  max-width: 600px; /* Adjust this value as needed */
  margin: 0 auto;
}
</style>
