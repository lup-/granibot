<template>
    <v-container class="fill-height align-start content-container" fluid>
        <v-row class="fill-height">
            <v-col cols="12" md="3">
                <v-list>
                    <v-subheader>Список чатов</v-subheader>
                    <v-list-item-group
                        v-model="selectedChatIndex"
                        color="primary"
                        @change="loadChatHistory"
                    >
                        <v-list-item v-for="chat in unreadChats" :key="chat.id">
                            <v-list-item-content>
                                <v-list-item-title>{{getChatTitle(chat)}}</v-list-item-title>
                            </v-list-item-content>
                            <v-list-item-action>
                                <v-btn icon @click="markRead(chat)"><v-icon>mdi-eye-off</v-icon></v-btn>
                            </v-list-item-action>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-col>
            <v-col cols="12" md="9" class="d-flex flex-column" v-if="selectedChatId !== null">
                <v-card v-for="message in chatMessages" :key="message.id"
                        class="mb-2"
                        width="70%"
                        :class="{'my align-self-end': selectedChatId !== message.from.id}"
                        :color="selectedChatId === message.from.id ? 'white' : 'blue'"
                        :dark="selectedChatId !== message.from.id"
                >
                    <v-card-title>{{getChatTitle(message.from)}}</v-card-title>
                    <v-card-subtitle>{{getMessageTime(message)}}</v-card-subtitle>
                    <v-card-text v-html="message.text"></v-card-text>
                </v-card>
                <v-container class="footer p-0" fluid>
                    <v-sheet class="p-2">
                        <v-row>
                            <v-col cols="12">
                                <v-textarea v-model="reply[selectedChatId]" label="Сообщение"></v-textarea>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <v-btn @click="sendReply">Отправить ответ <v-icon>mdi-telegram</v-icon></v-btn>
                            </v-col>
                        </v-row>
                    </v-sheet>
                </v-container>
            </v-col>
            <v-col cols="12" md="9" class="d-flex flex-column pt-4 text-center" v-else>
                Чат не выбран
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import moment from "moment";

    export default {
        name: "DirectChat",
        async mounted() {
            await this.loadUnreadChats();
            this.startHistoryPolling();
        },
        beforeDestroy () {
            this.stopHistoryPolling();
        },
        data() {
            return {
                selectedChatIndex: null,
                reply: {},
                pollIntervalId: false,
                pollMs: 10000,
            }
        },
        methods: {
            loadUnreadChats() {
                return this.$store.dispatch('loadUnreadChats');
            },
            startHistoryPolling() {
                this.pollIntervalId = setInterval(() => {
                    this.loadChatHistory();
                    this.loadUnreadChats();
                }, this.pollMs);
            },
            stopHistoryPolling() {
                if (this.pollIntervalId) {
                    clearInterval(this.pollIntervalId);
                }
            },
            loadChatHistory() {
                if (!this.selectedChatId) {
                    return;
                }

                return this.$store.dispatch('loadChatHistory', this.selectedChatId);
            },
            getChatTitle(chat) {
                return chat.first_name
                    ? chat.first_name+(chat.last_name ? ' '+chat.last_name : '')
                    : '@'+(chat.username || chat.id)
            },
            getMessageTime(message) {
                let time = moment.unix(message.date);
                return time.fromNow();
            },
            sendReply() {
                let text = this.reply[this.selectedChatId];
                this.reply[this.selectedChatId] = '';

                this.$store.dispatch('reply', {chatId: this.selectedChatId, text})
            },
            markRead(chat) {
                this.selectedChatId = null;
                this.$store.dispatch('markRead', chat.id);
            }
        },
        computed: {
            unreadChats() {
                return this.$store.state.chat.unread;
            },
            selectedChatId() {
                return this.selectedChatIndex !== null ? this.$store.state.chat.unread[this.selectedChatIndex].id : null;
            },
            chatMessages() {
                return this.$store.state.chat.chatHistory;
            }
        }
    }
</script>

<style scoped>
    .footer {
        position: fixed;
        height: 300px;
        bottom: 0;
        padding: 0!important;
    }

    .content-container {
        padding-bottom: 300px;
    }
</style>