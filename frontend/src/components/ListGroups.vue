<template>
    <v-container class="fill-height" :class="{'align-start': !isEmpty && !isLoading}">
        <v-row :align="isEmpty || isLoading ? 'center' : 'start'" :justify="isEmpty || isLoading ? 'center' : 'start'">
            <v-progress-circular v-if="isLoading"
                :size="70"
                :width="7"
                indeterminate
            ></v-progress-circular>

            <v-col cols="12" class="text-center" v-if="isEmpty && !isLoading">Групп не найдено</v-col>
            <v-col cols="12" md="6" lg="4" v-for="group in groups" :key="'group'+group.id+group.lastUpdated">
                <view-group :input-group="group"></view-group>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import ViewGroup from "@/components/ViewGroup";
    import groupParams from "@/mixins/groupParams";

    export default {
        name: "ListGroups",
        components: {ViewGroup},
        mixins: [groupParams],
        data() {
            return {
                isLoading: false,
            }
        },
        async mounted() {
            await this.loadAllGroups();
        },
        methods: {
            async loadAllGroups() {
                this.isLoading = true;
                await this.$store.dispatch('loadGroups', {});
                this.isLoading = false;
            }
        },
        computed: {
            groups() {
                return this.isLoading ? [] : this.$store.state.group.groups;
            },
            isEmpty() {
                return this.groups.length === 0 && this.isLoading === false;
            }
        }
    }
</script>

<style scoped>

</style>