<template>
    <v-container class="fill-height align-start">
        <v-row align="start" justify="center" width="100%">
            <v-col>
                <v-card>
                    <v-card-title>Отправить сообщение</v-card-title>
                    <v-card-text>
                        <v-autocomplete
                                v-model="groups"
                                :items="allGroups"
                                chips
                                deletable-chips
                                clearable
                                label="Кому"
                                multiple
                                no-data-text="Групп не найдено"
                        >
                        </v-autocomplete>
                        <v-textarea v-model="text" label="Сообщение"></v-textarea>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn @click="sendMessage" color="green" :disabled="text.length === 0"><v-icon>mdi-telegram</v-icon>Отправить</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    export default {
        name: "MessageForm",
        data() {
            return {
                groups: [],
                text: '',
            }
        },
        methods: {
            async sendMessage() {
                let chats = [];
                for (const groupId of this.groups) {
                    let members = this.$store.getters.members(groupId);
                    chats = chats.concat(members);
                }

                await this.$store.dispatch('sendMessage', {chats, text: this.text});
                this.resetForm();
            },
            resetForm() {
                this.groups = [];
                this.text = '';
            }
        },
        computed: {
            allGroups() {
                let stateGroups = this.$store.state.group.allGroups || [];
                return stateGroups.map((group) => {
                    return {
                        text: group.name,
                        value: group.id,
                    };
                });
            }
        }
    }
</script>

<style scoped>

</style>