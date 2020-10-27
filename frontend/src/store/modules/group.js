import axios from "axios";

export default {
    state: {
        filter: false,
        group: false,
        groups: [],
        allGroups: [],
    },
    actions: {
        async loadGroup({commit}, groupId) {
            let response = await axios.get(`/api/group/${groupId}`);

            return commit('setGroup', response.data.group);
        },
        async loadGroups({commit}, filter) {
            commit('setFilter', filter);
            let response = await axios.post(`/api/group/list`, {filter});
            return commit('setGroups', response.data.groups);
        },
        async loadAllGroups({commit}) {
            let response = await axios.post(`/api/group/list`, {});
            return commit('setAllGroups', response.data.groups);
        },
        async reloadGroups({dispatch, state}) {
            if (state.groups) {
                await dispatch('loadGroups', state.filter);
            }

            if (state.group) {
                await dispatch('loadGroup', state.group.id);
            }
        },
        async saveGroup({commit, dispatch}, group) {
            let response = await axios.post(`/api/group`, {group});
            await commit('setGroup', response.data.group);
            return dispatch('loadAllGroups');
        },
        async deleteGroup({commit, state, dispatch}, group) {
            await axios.post(`/api/group/delete`, {id: group.id});

            if (state.group.id === group.id) {
                return commit('setGroup', false);
            }

            return dispatch('reloadGroups');
        },
        async sendMessage(_, {chats, text}) {
            return axios.post(`/api/group/message`, {chats, text});
        }
    },
    getters: {
        members(state) {
            return groupId => {
                let group = state.allGroups.find(group => group.id === groupId);
                return group ? group.members || [] : [];
            }
        },
        groupChats(state, getters, rootState) {
            return groupId => {
                let group = state.allGroups.find(group => group.id === groupId);
                let memberIds = group ? group.members || [] : [];

                return rootState.chat.allChats.filter(chat => memberIds.indexOf(chat.id) !== -1);
            }
        }
    },
    mutations: {
        setFilter(state, filter) {
            state.filter = filter || false;
        },
        setGroup(state, group) {
            state.group = group || false;
        },
        setGroups(state, groups) {
            state.groups = groups || [];
        },
        setAllGroups(state, groups) {
            state.allGroups = groups || [];
        },
    }
}