<template>
  <q-page class="q-pa-md">
    <h5 class="q-mt-none q-mb-md">결제하기</h5>

    <!-- 상품 정보 -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">상품 정보</div>
        <q-item>
          <q-item-section avatar>
            <q-avatar>
              <img :src="product.image">
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ product.name }}</q-item-label>
            <q-item-label caption>{{ product.price.toLocaleString() }}원</q-item-label>
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>

    <!-- 배송 정보 -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">배송 정보</div>
        <q-input v-model="shippingInfo.name" label="이름" class="q-mb-sm" />
        <q-input v-model="shippingInfo.phone" label="전화번호" class="q-mb-sm" />
        <q-input v-model="shippingInfo.address" label="주소" type="textarea" />
      </q-card-section>
    </q-card>

    <!-- Stripe 카드 입력 폼 -->
    <q-card class="q-mb-md" v-if="stripeLoaded">
      <q-card-section>
        <div class="text-h6">카드 정보</div>
        <div id="card-element" ref="cardElementRef"></div>
        <div id="card-errors" role="alert" class="text-negative"></div>
      </q-card-section>
    </q-card>
    <q-card class="q-mb-md" v-else>
      <q-card-section>
        <div class="text-h6">카드 정보</div>
        <p>결제 시스템을 불러오는 중입니다... ({{ loadingStatus }})</p>
      </q-card-section>
    </q-card>

    <!-- 결제 금액 -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">결제 금액</div>
        <div class="row justify-between q-mt-sm">
          <span>상품 금액</span>
          <span>{{ product.price.toLocaleString() }}원</span>
        </div>
        <div class="row justify-between q-mt-sm">
          <span>배송비</span>
          <span>{{ shippingFee.toLocaleString() }}원</span>
        </div>
        <q-separator class="q-my-md" />
        <div class="row justify-between text-weight-bold">
          <span>총 결제 금액</span>
          <span>{{ totalAmount.toLocaleString() }}원</span>
        </div>
      </q-card-section>
    </q-card>

    <!-- 결제 버튼 -->
    <q-btn color="primary" class="full-width" size="lg" @click="processPayment" :loading="loading" :disable="!stripeLoaded">
      결제하기
    </q-btn>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js'
import { $jkutil, $api, $router } from "boot/jkutil";

export default defineComponent({
  name: 'PaymentPage',
  setup() {
    const $q = useQuasar()
    const cardElementRef = ref<HTMLElement | null>(null)
    const stripe = ref<Stripe | null>(null)
    const elements = ref<StripeElements | null>(null)
    const card = ref<StripeCardElement | null>(null)
    const loading = ref(false)
    const stripeLoaded = ref(false)
    const loadingStatus = ref('초기화 중')


    // Stripe 초기화
    const initStripe = async () => {
      try {
        loadingStatus.value = 'Stripe 라이브러리 로드 중'
        const stripeInstance = await loadStripe('pk_test_51PitHKAaXlTgGZfDjWSEgp7A6FMtCGceBvm7G4afv4IqsOi9uETXFqG4Fl3XgkgnrFx8InRaKpuZfbU2NjrQHiDQ0082PXLOd3')
        if (stripeInstance) {
          stripe.value = stripeInstance
          elements.value = stripe.value.elements()
          loadingStatus.value = 'Stripe 객체 생성 완료'
          stripeLoaded.value = true
        } else {
          throw new Error('Failed to load Stripe')
        }
      } catch (error) {
        loadingStatus.value = 'Stripe 초기화 오류'
        console.error('Error initializing Stripe:', error)
        $q.notify({
          color: 'negative',
          message: '결제 시스템을 불러오는 데 실패했습니다.'
        })
      }
    }

    const mountCardElement = () => {
      if (cardElementRef.value && elements.value && !card.value) {
        loadingStatus.value = '카드 엘리먼트 마운트 중'
        card.value = elements.value.create('card')
        card.value.mount(cardElementRef.value)
        loadingStatus.value = '카드 엘리먼트 마운트 완료'
      }
    }

    onMounted(() => {
      initStripe()
    })

    // cardElementRef가 업데이트될 때마다 카드 엘리먼트 마운트 시도
    watch(cardElementRef, (newVal) => {
      if (newVal && elements.value) {
        mountCardElement()
      }
    })

    // stripeLoaded가 true가 되면 카드 엘리먼트 마운트 시도
    watch(stripeLoaded, (newVal) => {
      if (newVal && cardElementRef.value) {
        mountCardElement()
      }
    })

    // 상품 정보 (실제로는 props나 store에서 가져올 수 있습니다)
    const product = ref({
      name: '블랙 플랫슈즈',
      price: 39000,
      image: 'https://cdn.quasar.dev/img/mountains.jpg'
    })

    // 배송 정보
    const shippingInfo = ref({
      name: '',
      phone: '',
      address: ''
    })

    // 배송비
    const shippingFee = ref(3000)

    // 총 결제 금액 계산
    const totalAmount = computed(() => {
      return product.value.price + shippingFee.value
    })

    const processPayment = async () => {
      if (!stripe.value || !card.value) {
        $q.notify({
          color: 'negative',
          message: '결제 시스템이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.'
        })
        return
      }

      loading.value = true
      try {
        // 결제 의도 생성
        const { clientSecret } = await $api.createPaymentIntent(totalAmount.value, 'KRW')

        // 카드로 결제 확인
        const result = await stripe.value.confirmCardPayment(clientSecret, {
          payment_method: {
            card: card.value,
            billing_details: {
              name: shippingInfo.value.name,
              phone: shippingInfo.value.phone,
              address: {
                line1: shippingInfo.value.address
              }
            }
          }
        })

        if (result.error) {
          throw new Error(result.error.message)
        }

        if (result.paymentIntent.status === 'succeeded') {
          // 결제 성공 확인
          const confirmResult = await $api.confirmPayment(result.paymentIntent.id)

          $q.dialog({
            title: '결제 완료',
            message: confirmResult.message,
            persistent: true
          }).onOk(() => {
            // 결제 완료 후 처리 (예: 홈 페이지로 이동)
            // $router.push('/') // 실제 라우팅 설정에 따라 조정 필요
          })
        }
      } catch (err) {
        $q.dialog({
          title: '결제 오류',
          message: err.message || '결제 처리 중 오류가 발생했습니다.',
          persistent: true
        })
      } finally {
        loading.value = false
      }
    }

    return {
      cardElementRef,
      product,
      shippingInfo,
      shippingFee,
      totalAmount,
      processPayment,
      loading,
      stripeLoaded,
      loadingStatus
    }
  }
})
</script>

<style>
#card-element {
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 4px;
}
#card-errors {
  margin-top: 10px;
  color: #ff0000;
}
</style>
