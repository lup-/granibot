import ListGroups from "@/components/ListGroups";
import EditGroup from "@/components/EditGroup";
import ViewGroup from "@/components/ViewGroup";
import ListChats from "@/components/ListChats";
import MessageForm from "@/components/MessageForm";
import EditSettings from "@/components/EditSettings";
import DirectChat from "@/components/DirectChat";

export default [
    { name: 'home', path: '/', component: ListGroups },

    { name: 'newGroup', path: '/group/new', component: EditGroup },
    { name: 'editGroup', path: '/group/edit/:groupId', component: EditGroup },
    { name: 'viewGroup', path: '/group/view/:groupId', component: ViewGroup },
    { name: 'listGroups', path: '/group/list', component: ListGroups },

    { name: 'listChats', path: '/chat/list', component: ListChats },

    { name: 'sendMessage', path: '/message/new', component: MessageForm },
    { name: 'editSettings', path: '/settings/edit', component: EditSettings },

    { name: 'directChat', path: '/direct', component: DirectChat}
]