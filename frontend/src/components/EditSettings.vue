<template>
    <v-container class="fill-height align-start">
        <v-row align="start" justify="center" width="100%">
            <v-col>
                <v-card>
                    <v-card-title>Настройки</v-card-title>
                    <v-card-text>
                        <div v-for="setting in settings" :key="setting.code">
                            <v-textarea v-if="setting.type === 'text'"
                                    v-model="settingValues[setting.code]"
                                    :label="setting.title"
                                    :hint="setting.hint || ''"
                            ></v-textarea>
                            <v-text-field v-else
                                    v-model="settingValues[setting.code]"
                                    :label="setting.title"
                                    :hint="setting.hint || ''"
                            ></v-text-field>
                        </div>
                        <div v-for="message in messages" :key="message.code">
                            <v-textarea
                                    v-model="settingValues['messages'][message.code]"
                                    :label="message.title"
                                    :hint="message.hint || ''"
                            ></v-textarea>
                        </div>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn text small @click="resetForm">Сбросить</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn @click="saveSettings" color="green"><v-icon>mdi-save</v-icon>Сохранить</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    export default {
        name: "EditSettings",
        data() {
            return {
                settingValues: {
                    messages:{}
                },
                settings: [],
                messages: [
                    {title: 'Приветствие', code: 'greetings'},
                    {title: 'Сообщеие о запреде доступа к админке', code: 'admin_deny'},
                    {title: 'Приветствие администратора', code: 'admin_hello'},
                    {title: 'Требование авторизации', code: 'admin_need_auth'},
                    {title: 'Сообщение о готовности принять пост', code: 'admin_message_listen'},
                    {title: 'Ошибка при получении неизвестного поста', code: 'admin_message_unknown'},
                    {title: 'Сообщение о том, что пост принят', code: 'admin_message_accepted'},
                    {title: 'Сообщение со списком групп', code: 'admin_group_list'},
                    {title: 'Сообщение об успешном выборе группы', code: 'admin_group_accepted'},
                    {title: 'Ошибка выбора группы', code: 'admin_group_error'},
                    {title: 'Сообщение о сбросе настроек', code: 'admin_reset'},
                    {title: 'Сообщение о нехватке параметров для отправки', code: 'admin_missing_params'},
                    {title: 'Сообщение с результатами отправки', code: 'admin_send_info'},
                    {title: 'Сообщение о перезагрузке настроек бота', code: 'admin_reloaded'},
                ]
            }
        },
        async mounted() {
            await this.loadSettings();
        },
        methods: {
            resetForm() {
                this.settingValues = this.storedSettings;
            },
            async saveSettings() {
                await this.$store.dispatch('saveSettings', this.settingValues);
                this.resetForm();
            },
            async loadSettings() {
                await this.$store.dispatch('loadSettings');
                this.resetForm();
            },
        },
        computed: {
            storedSettings() {
                return this.$store.state.settings.settings;
            }
        }
    }
</script>

<style scoped>

</style>