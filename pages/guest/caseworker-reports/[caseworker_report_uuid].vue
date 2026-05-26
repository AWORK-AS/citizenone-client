<script setup lang="ts">
const route = useRoute()

await navigateTo(`/guest/caseworker/${route.params.caseworker_report_uuid}`, { redirectCode: 301 })
</script>