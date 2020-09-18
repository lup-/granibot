<template>
    <v-container class="fill-height" :class="{'align-start': !isEmpty && !isLoading}">
        <v-row :align="isEmpty || isLoading ? 'center' : 'start'" :justify="isEmpty || isLoading ? 'center' : 'start'">
            <v-progress-circular v-if="isLoading"
                :size="70"
                :width="7"
                indeterminate
            ></v-progress-circular>

            <v-col cols="12" class="text-center" v-if="isEmpty && !isLoading">Участников не найдено</v-col>
            <v-col cols="12" md="6" lg="4" v-for="chat in chats" :key="'chat'+chat.id">
                <chat-form :chat="chat"></chat-form>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import chatParams from "@/mixins/chatParams";
    import ChatForm from "@/components/ChatForm";

    export default {
        name: "ListChats",
        mixins: [chatParams],
        components: {ChatForm},
        data() {
            return {
                isLoading: false,
            }
        },
        async mounted() {
            await this.loadAllChats();
        },
        methods: {
            async loadAllChats() {
                this.isLoading = true;
                await this.$store.dispatch('loadChats', {});
                this.isLoading = false;
            }
        },
        computed: {
            chats() {
                return this.isLoading ? [] : this.$store.state.chat.chats;
            },
            isEmpty() {
                return this.chats.length === 0 && this.isLoading === false;
            }
        }
    }
</script>

<style scoped>

</style>