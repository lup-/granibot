import Vue from 'vue';
import Vuex from "vuex";
import chat from "./modules/chat";
import group from "./modules/group";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        chat,
        group,
    },
    state: {
        appError: false
    },
    actions: {
    }
});