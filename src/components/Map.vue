<template>
  <div class="map-container" style="height: 75vh; width: 100vw">
    <GoogleMap
      :api-key="apiKey"
      :center="center"
      :zoom="15"
      style="width: 100%; height: 100%"
      @click="updateMarkerPosition"
    >
      <GoogleMarker
        v-if="center"
        :options="{ position: center, draggable: true }"
        @dragend="handleMarkerDragEnd"
      />
    </GoogleMap>
  </div>
  <div class="bottom-bar">
    <div class="q-mb-lg">{{ address }}</div>
    <q-btn color="primary" label="위치 등록하기" @click="getCurrentLocation" />
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { GoogleMap, Marker as GoogleMarker } from "vue3-google-map";

export default defineComponent({
  name: "CurrentLocationMap",
  components: {
    GoogleMap,
    GoogleMarker,
  },
  setup() {
    const apiKey = "AIzaSyCTLGGpjKmvbQa1LZ3gHIHVjU2IHM_02zM";
    const center = ref(null);
    const address = ref("");

    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            center.value = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            getAddress(center.value);
          },
          (error) => {
            console.error("Error getting location:", error);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    };

    const getAddress = (position) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: position }, (results, status) => {
        if (status === "OK" && results[0]) {
          address.value = results[0].formatted_address;
        } else {
          console.error("Geocoder failed due to: " + status);
        }
      });
    };

    const handleMarkerDragEnd = (event) => {
      const newPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      center.value = newPosition;
      getAddress(newPosition);
    };

    const updateMarkerPosition = (event) => {
      const newPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      center.value = newPosition;
      getAddress(newPosition);
    };

    onMounted(() => {
      getCurrentLocation();
    });

    return {
      apiKey,
      center,
      address,
      handleMarkerDragEnd,
      updateMarkerPosition,
    };
  },
});
</script>

<style scoped>
.map-container {
  position: relative;
}

.bottom-bar {
  height: 15vh;
  width: 100vw;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column; /* 추가 */
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  border-top: 1px solid #e9ecef;
}
</style>
