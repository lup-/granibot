export default {
    data() {
        return {
            isLoading: false,
            chat: {},
        }
    },
    methods: {
        gotoChatList() {
            this.$router.push({name: 'listChats'});
        },
        async loadChat() {
            if (!this.chatId) {
                return;
            }

            this.isLoading = true;
            await this.$store.dispatch('loadChat', this.chatId);
            this.isLoading = false;
            this.updateViewChatState();
        },
        async deleteUser() {
            this.isLoading = true;
            await this.$store.dispatch('deleteChat', this.chat);
            this.isLoading = false;
            this.updateViewChatState();
        },
        updateViewChatState() {
            this.chat = this.$store.state.chat.chat;
        },
    },
}