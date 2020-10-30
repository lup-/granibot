<template>
    <div>
        <v-card @click.native.self="gotoGroupDetails">
            <v-card-title>
                {{group.name}}
                <v-spacer></v-spacer>
                Участников: {{group.members ? group.members.length : 0}}
            </v-card-title>
            <v-card-text>
                <v-chip v-for="member in groupMembers(group)" :key="member.id"
                        class="mr-1"
                        :x-small="!isStandalone">
                    {{member.first_name}} {{member.last_name}}
                </v-chip>
            </v-card-text>
            <v-card-text>
                <v-btn text :href="groupLink(group)" target="_blank" prepend-inner-icon="mdi-link">{{groupLink(group)}}</v-btn>
            </v-card-text>

            <v-card-actions>
                <v-btn color="red" outlined small @click.prevent.stop="deleteGroup">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn color="green" @click.prevent.stop="gotoGroupEdit" :loading="isLoading">
                    <v-icon>mdi-pencil-outline</v-icon>
                    Редактировать
                </v-btn>
                <v-btn @click.stop.prevent="gotoGroupList" small v-if="isStandalone">К списку групп</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script>
    import groupParams from "@/mixins/groupParams";
    import clone from "lodash.clone";

    export default {
        name: "ViewGroup",
        props: ['inputGroup'],
        mixins: [groupParams],
        data() {
            return {
            }
        },
        async mounted() {
            await this.updateLocalGroupData();
        },
        watch: {
            inputVacancy() {
                this.updateLocalGroupData();
            }
        },
        methods: {
            async updateLocalGroupData() {
                if (this.inputGroup) {
                    this.group = clone(this.inputGroup);
                }
                else if (this.groupId) {
                    await this.loadGroup();
                }
            },
            updateGroupState() {
                if (this.isStandalone) {
                    this.group = this.$store.state.group.group;
                    this.savedGroup = clone(this.group);
                }
            },
            groupLink(group) {
                let botLink = 'https://t.me/GraniSlovBot';
                return botLink + '?start='+group.id;
            },
            groupMembers(group) {
                return this.$store.getters.groupChats(group.id)
            }
        },
        computed: {
            groupId() {
                return this.$route.params.groupId;
            },
            isStandalone() {
                return !this.inputGroup;
            },
        }
    }
</script>

<style scoped>

</style>