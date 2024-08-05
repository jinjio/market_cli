<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <!-- <q-btn icon="arrow_back" flat round @click="$router.back()" /> -->
      <div class="text-h6 q-ml-sm">상품 등록</div>
    </div>

    <q-form @submit="onSubmit" class="q-gutter-md">
      <div class="row justify-center q-mb-md">
        <q-uploader
          url=""
          @added="handleImageUpload"
          label="이미지를 여기에 드래그하거나 클릭하여 업로드"
          auto-upload
          accept="image/*"
        />
        <!-- <q-uploader
          v-model="photos"
          label="사진 추가"
          multiple
          accept=".jpg, .jpeg, .png"
          :max-files="5"
          style="max-width: 300px"
        >
          <template v-slot:header="scope">
            <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
              <q-btn
                v-if="scope.queuedFiles.length > 0"
                icon="clear_all"
                @click="scope.removeQueuedFiles"
                flat
                round
                dense
              />
              <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
              <div class="col">
                <div class="q-uploader__title">사진 업로드</div>
                <div class="q-uploader__subtitle">
                  {{ scope.uploadSizeLabel }}
                </div>
              </div>
              <q-btn
                v-if="scope.canAddFiles"
                icon="add_box"
                @click="scope.pickFiles"
                flat
                round
                dense
              />
            </div>
          </template>
        </q-uploader> -->
      </div>

      <!-- 제목 입력 -->
      <q-input
        v-model="title"
        label="제목"
        :rules="[(val) => !!val || '제목을 입력해주세요']"
      />

      <!-- 가격 입력 -->
      <q-input
        v-model.number="price"
        label="가격"
        type="number"
        prefix="₩"
        :rules="[
          (val) => !!val || '가격을 입력해주세요',
          (val) => val > 0 || '유효한 가격을 입력해주세요',
        ]"
      />

      <!-- 카테고리 선택 -->
      <q-select
        v-model="category"
        :options="categoryOptions"
        label="카테고리"
        :rules="[(val) => !!val || '카테고리를 선택해주세요']"
      />

      <!-- 설명 입력 -->
      <q-input
        v-model="description"
        label="설명"
        type="textarea"
        :rules="[(val) => !!val || '설명을 입력해주세요']"
      />

      <!-- 등록 버튼 -->
      <q-btn
        label="등록하기"
        type="submit"
        color="primary"
        class="full-width q-mt-lg"
      />
    </q-form>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "ProductRegistrationPage",
  setup() {
    const $q = useQuasar();
    const photos = ref([]);
    const title = ref("");
    const price = ref(null);
    const category = ref(null);
    const description = ref("");

    const categoryOptions = [
      "Clothing",
      "Furniture",
      "Electronics",
      "Book",
      "Toy",
    ];

    const onSubmit = () => {
      // 여기에 실제 등록 로직을 구현합니다.
      // API 호출 등을 통해 서버에 데이터를 전송합니다.
      console.log("Submitting:", {
        photos: photos.value,
        title: title.value,
        price: price.value,
        category: category.value,
        description: description.value,
      });

      $q.notify({
        color: "positive",
        message: "상품이 등록되었습니다.",
        icon: "check",
      });

      // 등록 후 목록 페이지로 이동
      // $router.push('/') // 실제 라우팅 설정에 따라 조정 필요
    };

    return {
      photos,
      title,
      price,
      category,
      categoryOptions,
      description,
      onSubmit,
    };
  },
});
</script>
