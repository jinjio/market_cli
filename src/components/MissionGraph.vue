<template>
    <!-- <q-btn @click="toggleGraphView">{{ isCumulative ? 'Show Individual Scores' : 'Show Cumulative Scores' }}</q-btn> -->
    <q-toggle
        v-model="isCumulative"
        checked-icon="check"
        color="green"
        unchecked-icon="clear"
        :label="isCumulative ? '일별 점수 보기' : '누적 점수 보기'"
        @update:model-value="(value) => { isCumulative = value; toggleGraphView(); }"
    />      
    <Line
        id="my-chart-id"
        :options="chartOptions"
        :data="chartData"
    />
</template>

<script setup>
    import { Line } from 'vue-chartjs'
    import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
    import { $jkutil, $t, $api, $q, $router } from 'boot/jkutil'
    import { ref, onMounted } from 'vue';

    ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

    const chartData = ref({
        labels: [],
        datasets: []
    })
    const chartOptions = ref({
        responsive: true
    })
    const ranking = ref([])
    const isCumulative = ref(false);
    const newLabels = ref([])
    const aggregatedData = ref({})

    onMounted(async () => {
        try {
            let response = await $api.getChallengeList('c4XZn-WBTmvn2QqzPXad3k')
            ranking.value = await $api.getRanking(1)

            const startDate = new Date(response[0].start_date)
            newLabels.value = generateDateLabels(startDate, new Date())

            aggregatedData.value = {}
            ranking.value.forEach((rank) => {
                if (!aggregatedData.value[rank.user_id]) {
                    aggregatedData.value[rank.user_id] = new Array(newLabels.value.length).fill(0)
                }
                if (rank.mission_index < aggregatedData.value[rank.user_id].length) {
                    aggregatedData.value[rank.user_id][rank.mission_index] += rank.score
                }
            })

            const newDatasets = Object.keys(aggregatedData.value).map((user_id) => {
                return {
                    label: user_id,
                    data: aggregatedData.value[user_id],
                    fill: false,
                    borderColor: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`,
                    tension: 0.1
                }
            })

            chartData.value = {
                labels: newLabels.value,
                datasets: newDatasets
            }
        } catch (e) {
            console.error(e)
        }
    })

    const toggleGraphView = () => {
        updateGraph();
    };

    const updateGraph = () => {
        const data = {
            labels: newLabels.value,
            datasets: Object.keys(aggregatedData.value).map((user_id) => ({
                label: user_id,
                data: isCumulative.value ? getCumulativeScores(aggregatedData.value[user_id]) : aggregatedData.value[user_id],
                fill: false,
                borderColor: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`,
                tension: 0.1
            }))
        };
        chartData.value = data;
    };

    const getCumulativeScores = (scores) => {
        console.log(scores, 'scores')
        let cumulative = [];
        scores.reduce((a, b, i) => cumulative[i] = a + b, 0);
        return cumulative;
    };

    const generateDateLabels = (startDate, endDate) => {
        const dateArray = [];
        while (startDate <= endDate) {
            dateArray.push(startDate.toISOString().split('T')[0]);
            startDate.setDate(startDate.getDate() + 1);
        }
        return dateArray;
    };
</script>