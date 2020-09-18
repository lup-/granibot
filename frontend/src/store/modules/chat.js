import axios from "axios";

export default {
    state: {
        chat: false,
        filter: false,
        chats: [],
        allChats: [],
    },
    actions: {
        async loadChat({commit}, chatId) {
            let response = await axios.post(`/api/chat/${chatId}`, {});

            return commit('setChat', response.data.chat);
        },
        async loadChats({commit}, filter) {
            commit('setChatFilter', filter);
            let response = await axios.post(`/api/chat/list`, {filter});
            return commit('setChats', response.data.chats);
        },
        async loadAllChats({commit}) {
            let response = await axios.post(`/api/chat/list`, {});
            return commit('setAllChats', response.data.chats);
        },
        async reloadChats({dispatch, state}) {
            if (state.chats) {
                await dispatch('loadChats', state.filter);
            }

            if (state.chat) {
                await dispatch('loadChat', state.chat.id);
            }
        },
        async deleteUser({dispatch}, chat) {
            let emptyChat = !chat || (chat && Object.keys(chat).length === 0);
            if (emptyChat) {
                return;
            }

            await axios.post(`/api/chat/delete`, {id: chat.id});

            return dispatch('reloadChats');
        },

    },
    mutations: {
        setChat(state, chat) {
            state.chat = chat;
        },
        setChats(state, chats) {
            state.chats = chats;
        },
        setAllChats(state, chats) {
            state.allChats = chats;
        },
        setChatFilter(state, filter) {
            state.filter = filter;
        },
    }
}