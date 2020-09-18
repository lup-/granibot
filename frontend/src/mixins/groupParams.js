import clone from "lodash.clone";

export default {
    data() {
        return {
            isSaving: false,
            isLoading: false,
            savedGroup: {},
            group: {},
        }
    },
    methods: {
        gotoGroupList() {
            this.$router.push({name: 'listGroups'});
        },
        gotoGroupDetails() {
            this.$router.push({name: 'viewGroups', params: {groupId: this.group.id}});
        },
        gotoGroupEdit() {
            this.$router.push({name: 'editGroup', params: {groupId: this.group.id}});
        },
        resetGroup() {
            if (this.isNew) {
                this.group = {};
            }
            else {
                this.group = clone(this.savedGroup);
            }
        },
        async saveGroup() {
            this.isSaving = true;
            await this.$store.dispatch('saveGroup', this.group);
            this.updateGroupState();
            this.isSaving = false;
            if (this.isNew) {
                let groupId = this.$store.state.group.group.id;
                this.$router.push({name: 'editGroup', params: {groupId}});
            }
        },
        updateGroupState() {
            this.group = this.$store.state.group.group;
            this.savedGroup = clone(this.group);
        },
        async loadGroup() {
            if (!this.groupId) {
                return;
            }
            this.isLoading = true;
            await this.$store.dispatch('loadGroup', this.groupId);
            this.isLoading = false;
            this.updateGroupState();
        },
        async deleteGroup() {
            this.isLoading = true;
            await this.$store.dispatch('deleteGroup', this.group);
            this.isLoading = false;
            this.updateGroupState();
        }
    },
}