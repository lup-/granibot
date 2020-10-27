<template>
    <v-app id="granibot">
        <v-navigation-drawer v-model="drawer" app clipped>
            <v-list dense>
                <v-list-item link @click="$router.push({name: 'newGroup'})" :disabled="$route.name === 'newGroup'">
                    <v-list-item-action>
                        <v-icon>mdi-account-multiple-plus</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Новая группа</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link @click="$router.push({name: 'sendMessage'})" :disabled="$route.name === 'sendMessage'">
                    <v-list-item-action>
                        <v-icon>mdi-telegram</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Новое сообщение</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item  @click="$router.push({name: 'listGroups'})" :disabled="$route.name === 'listGroups'">
                    <v-list-item-action>
                        <v-icon>mdi-account-multiple</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Список групп</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item  @click="$router.push({name: 'listChats'})" :disabled="$route.name === 'listChats'">
                    <v-list-item-action>
                        <v-icon>mdi-account</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Список участников</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-app-bar app clipped-left>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
            <v-toolbar-title>Фреза v0.1</v-toolbar-title>
        </v-app-bar>

        <v-main>
            <router-view></router-view>
        </v-main>

        <v-footer app>
        </v-footer>
    </v-app>
</template>

<script>
    export default {
        name: 'App',
        data: () => ({
            drawer: null,
        }),
        mounted() {
            this.$store.dispatch('loadAllGroups');
            this.$store.dispatch('loadAllChats');
        }
    };
</script>

<style>
    .theme--light.v-btn.red,
    .theme--light.v-btn.green {
        color: white;
    }
</style>
