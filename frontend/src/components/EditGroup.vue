<template>
    <v-container class="fill-height align-start">
        <v-row align="start" justify="center" width="100%">
            <v-col>
                <v-card>
                    <v-card-title>{{isNew ? 'Новая группа' : 'Редактирование группы'}}</v-card-title>
                    <v-card-text>
                        <v-form>
                            <v-text-field v-model="group.name" label="Название группы"></v-text-field>
                            <v-text-field v-model.number="group.price" label="Стоимость вступления"></v-text-field>
                            <v-autocomplete
                                    v-model="group.members"
                                    :items="allChats"
                                    chips
                                    deletable-chips
                                    clearable
                                    label="Участники"
                                    multiple
                                    no-data-text="Участников не найдено"
                            >
                            </v-autocomplete>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn text small @click="resetGroup">Сбросить</v-btn>
                        <v-btn color="success" :loading="isSaving" @click="saveGroup">Сохранить</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn @click="gotoGroupList">К списку групп</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import groupParams from "@/mixins/groupParams";

    export default {
        name: "EditGroup",
        mixins: [groupParams],
        data() {
            return {
            }
        },
        async mounted() {
            if (this.groupId) {
                await this.loadGroup();
            }
        },
        watch: {
            async groupId() {
                if (this.groupId) {
                    await this.loadGroup();
                }
                else {
                    this.group = {};
                    this.savedGroup = {};
                }
            }
        },
        computed: {
            groupId() {
                return this.$route.params.groupId || false;
            },
            isNew() {
                return !this.groupId;
            },
            allChats() {
                let stateChats = this.$store.state.chat.allChats || [];
                return stateChats.map((chat) => {
                    let fullname = (chat.first_name || '') + ' ' + (chat.last_name || '');

                    return {
                        text: fullname,
                        value: chat.id,
                    };
                });
            }
        }
    }
</script>

<style scoped>

</style>