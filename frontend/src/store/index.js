import Vue from 'vue';
import Vuex from "vuex";

import chat from "./modules/chat";
import group from "./modules/group";
import settings from "./modules/settings";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        chat,
        group,
        settings,
    },
    state: {
        appError: false
    },
    actions: {
    }
});