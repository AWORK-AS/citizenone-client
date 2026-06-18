<template>
    <section
        class="bg-white ring-1 ring-gray-200 rounded-2xl shadow-sm flex flex-col"
        style="height: 600px"
    >
        <!-- Chat header -->
        <div
            class="flex items-center justify-between px-4 md:px-5 py-3.5 border-b border-gray-100 bg-white gap-2"
        >
            <div class="flex items-center gap-3 flex-1 min-w-0">
                <img
                    :src="'/img/avatars/user.svg'"
                    alt="avatar"
                    class="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
                <div>
                    <h4 class="font-semibold text-sm text-gray-900">
                        {{ headerName }}
                    </h4>
                    <p class="text-xs text-gray-400">{{ companyName }}</p>
                </div>
            </div>
            <button
                type="button"
                class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                :title="$t('guestPortal.refresh')"
                @click="emit('refresh')"
            >
                <Icon
                    name="ph:arrows-clockwise"
                    class="w-4 h-4 text-gray-500"
                />
            </button>
        </div>

        <!-- Message list -->
        <div
            ref="messagesContainer"
            class="flex-1 overflow-y-auto px-3 md:px-5 py-4 space-y-1"
        >
            <template v-if="messages?.length">
                <div
                    v-for="(message, index) in messages"
                    :key="message.uuid || message.id"
                >
                    <!-- Date divider -->
                    <div
                        v-if="shouldShowDateDivider(index)"
                        class="flex items-center gap-3 py-2 my-1"
                    >
                        <div class="flex-1 h-px bg-gray-200"></div>
                        <span
                            class="text-xs text-gray-400 font-medium flex-shrink-0"
                        >
                            {{ getMessageDateLabel(message?.created_at) }}
                        </span>
                        <div class="flex-1 h-px bg-gray-200"></div>
                    </div>

                    <!-- Own message (right) -->
                    <div
                        v-if="isOwnMessage(message)"
                        class="flex flex-col items-end mb-3"
                    >
                        <div class="flex items-center gap-2 mb-1">
                            <p class="text-xs text-gray-500 font-medium">
                                {{ $t('guestPortal.you') }}
                                <span class="text-gray-400 font-normal">{{
                                    formatMessageTime(message?.created_at)
                                }}</span>
                            </p>
                            <img
                                :src="'/img/avatars/user.svg'"
                                alt="You"
                                class="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                        </div>
                        <div class="mr-10 max-w-[85%] md:max-w-[70%]">
                            <div
                                class="bg-secondary text-white px-4 py-2.5 rounded-2xl rounded-br-sm shadow-sm space-y-2"
                            >
                                <div
                                    v-if="
                                        message?.chat_message_attachments
                                            ?.length
                                    "
                                    class="space-y-2"
                                >
                                    <div
                                        v-for="(
                                            att, ai
                                        ) in message.chat_message_attachments"
                                        :key="ai"
                                    >
                                        <img
                                            v-if="isImageFile(att.file_name)"
                                            :src="att.file_url"
                                            :alt="att.file_name"
                                            class="w-44 rounded-lg cursor-pointer hover:opacity-90"
                                            @click="downloadAttachment(att)"
                                        />
                                        <button
                                            v-else
                                            type="button"
                                            class="flex items-center gap-2 hover:opacity-80"
                                            @click="downloadAttachment(att)"
                                        >
                                            <Icon
                                                name="ph:file"
                                                class="h-5 w-5 flex-shrink-0"
                                            />
                                            <span
                                                class="text-sm truncate max-w-[180px]"
                                                >{{ att.file_name }}</span
                                            >
                                        </button>
                                    </div>
                                </div>
                                <p
                                    v-if="message?.message"
                                    class="text-sm leading-relaxed"
                                    v-html="
                                        message.message.replace(/\n/g, '<br>')
                                    "
                                ></p>
                            </div>
                        </div>
                    </div>

                    <!-- Received message (left) -->
                    <div v-else class="flex flex-col items-start mb-3">
                        <div class="flex items-center gap-2 mb-1">
                            <img
                                :src="senderAvatar(message)"
                                alt="Sender"
                                class="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                            <p class="text-xs text-gray-500 font-medium">
                                {{ senderDisplayName(message) || $t('guestPortal.admin') }}
                                <span class="text-gray-400 font-normal">{{
                                    formatMessageTime(message?.created_at)
                                }}</span>
                            </p>
                        </div>
                        <div class="max-w-[85%] md:max-w-[70%] ml-10">
                            <div
                                class="bg-gray-100 text-gray-800 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm space-y-2"
                            >
                                <div
                                    v-if="
                                        message?.chat_message_attachments
                                            ?.length
                                    "
                                    class="space-y-2"
                                >
                                    <div
                                        v-for="(
                                            att, ai
                                        ) in message.chat_message_attachments"
                                        :key="ai"
                                    >
                                        <img
                                            v-if="isImageFile(att.file_name)"
                                            :src="att.file_url"
                                            :alt="att.file_name"
                                            class="w-44 rounded-lg cursor-pointer hover:opacity-90"
                                            @click="downloadAttachment(att)"
                                        />
                                        <button
                                            v-else
                                            type="button"
                                            class="flex items-center gap-2 text-gray-600 hover:opacity-80"
                                            @click="downloadAttachment(att)"
                                        >
                                            <Icon
                                                name="ph:file"
                                                class="h-5 w-5 flex-shrink-0 text-gray-500"
                                            />
                                            <span
                                                class="text-sm truncate max-w-[180px]"
                                                >{{ att.file_name }}</span
                                            >
                                        </button>
                                    </div>
                                </div>
                                <p
                                    v-if="message?.message"
                                    class="text-sm leading-relaxed"
                                    v-html="
                                        message.message.replace(/\n/g, '<br>')
                                    "
                                ></p>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <div v-else class="h-full flex items-center justify-center">
                <div class="text-center">
                    <Icon
                        name="ph:chat-circle-dots"
                        class="h-10 w-10 text-gray-300 mx-auto"
                    />
                    <p class="mt-2 text-sm text-gray-500">
                        {{ $t('guestPortal.noMessagesYet') }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Compose bar -->
        <div
            class="flex-shrink-0 border-t border-gray-100 bg-white rounded-b-2xl"
        >
            <!-- Selected files preview -->
            <div
                v-if="selectedFiles.length"
                class="flex flex-wrap gap-2 px-4 pt-3"
            >
                <div
                    v-for="(file, i) in selectedFiles"
                    :key="i"
                    class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700"
                >
                    <Icon
                        :name="isImageFile(file.name) ? 'ph:image' : 'ph:file'"
                        class="w-3.5 h-3.5 text-gray-500"
                    />
                    <span class="max-w-[120px] truncate">{{ file.name }}</span>
                    <button
                        type="button"
                        class="text-gray-400 hover:text-red-500 transition"
                        @click="removeFile(i)"
                    >
                        <Icon name="ph:x" class="w-3 h-3" />
                    </button>
                </div>
            </div>

            <input
                ref="fileInput"
                type="file"
                multiple
                class="hidden"
                @change="handleFileChange"
            />

            <form
                class="flex items-stretch gap-2 px-4 py-3"
                @submit.prevent="sendMessage"
            >
                <button
                    type="button"
                    class="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
                    @click="triggerFileInput"
                >
                    <Icon name="ph:paperclip" class="w-5 h-5 text-gray-500" />
                </button>
                <textarea
                    rows="1"
                    class="flex-1 h-10 px-4 bg-gray-100 rounded-md text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-primary/20 border-0 leading-10"
                    :placeholder="$t('guestPortal.typeAMessage')"
                    v-model="messageText"
                    @keydown.enter.exact.prevent="sendMessage"
                />
                <button
                    type="submit"
                    :disabled="!messageText.trim() && !selectedFiles.length"
                    class="w-10 h-10 rounded-lg bg-secondary hover:bg-secondary/90 flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-50"
                >
                    <Icon
                        name="ph:paper-plane-tilt"
                        class="w-4 h-4 text-white"
                    />
                </button>
            </form>
        </div>
    </section>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import { caseworkerService } from "@/components/api/guest/CaseworkerService";
import { useI18n } from "vue-i18n";

defineOptions({ name: "ModulesGuestCaseworkerMessagesTab" });

const { t } = useI18n();

const props = defineProps({
    messages: {
        type: Array as PropType<any[]>,
        default: () => [],
    },
    caseworkerUuid: {
        type: String,
        required: true,
    },
    headerName: {
        type: String,
        default: "Caseworker",
    },
    companyName: {
        type: String,
        default: "",
    },
});

const emit = defineEmits<{
    (e: "refresh"): void;
    (e: "messageSent"): void;
}>();

const messagesContainer = ref<HTMLElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFiles = ref<File[]>([]);
const messageText = ref("");

watch(
    () => props.messages.length,
    () => scrollToBottom(),
);

onMounted(() => scrollToBottom());

function scrollToBottom() {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop =
                messagesContainer.value.scrollHeight;
        }
    });
}

function triggerFileInput() {
    fileInput.value?.click();
}

function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files) {
        selectedFiles.value = [
            ...selectedFiles.value,
            ...Array.from(target.files),
        ];
    }
    if (fileInput.value) fileInput.value.value = "";
}

function removeFile(index: number) {
    selectedFiles.value.splice(index, 1);
}

function isImageFile(fileName: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName ?? "");
}

async function downloadAttachment(attachment: any) {
    const url = attachment?.file_url;
    if (!url) return;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = attachment.file_name || "download";
    anchor.target = "_blank";
    anchor.click();
}

async function sendMessage() {
    if (!messageText.value.trim() && !selectedFiles.value.length) return;

    try {
        if (selectedFiles.value.length) {
            const formData = new FormData();
            if (messageText.value.trim())
                formData.append("message", messageText.value);
            selectedFiles.value.forEach((file) =>
                formData.append("file[]", file),
            );
            await caseworkerService.sendMessageWithFiles(
                props.caseworkerUuid,
                formData,
            );
            selectedFiles.value = [];
        } else {
            await caseworkerService.sendMessage(props.caseworkerUuid, {
                message: messageText.value,
            });
        }
        messageText.value = "";
        emit("messageSent");
    } catch (_) {
        // parent handles errors
    }
}

function isOwnMessage(message: any): boolean {
    const t = message?.sender_type || "";
    return (
        t.includes("CaseworkerLicenseConfig") ||
        t.toLowerCase().includes("caseworker")
    );
}

function formatMessageTime(datetime: string): string {
    if (!datetime) return "";
    return new Date(datetime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getMessageDateLabel(datetime: string): string {
    if (!datetime) return "";
    const date = new Date(datetime);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const same = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
    if (same(date, today)) return t("guestPortal.today");
    if (same(date, yesterday)) return t("guestPortal.yesterday");
    return date.toLocaleDateString();
}

function shouldShowDateDivider(index: number): boolean {
    if (index === 0) return true;
    const cur = new Date(props.messages[index]?.created_at);
    const prev = new Date(props.messages[index - 1]?.created_at);
    return cur.toDateString() !== prev.toDateString();
}

function senderDisplayName(message: any): string {
    if (!message) return "";
    const sender = message.sender || {};
    const t = message.sender_type || "";
    if (
        t.includes("CaseworkerLicenseConfig") ||
        t.toLowerCase().includes("caseworker")
    ) {
        return (
            sender.name ||
            `${sender.firstname ?? ""} ${sender.lastname ?? ""}`.trim()
        );
    }
    return (
        `${sender.firstname ?? ""} ${sender.lastname ?? ""}`.trim() ||
        sender.name ||
        ""
    );
}

function senderAvatar(message: any): string {
    if (!message) return "/img/avatars/user.svg";
    const sender = message.sender || {};
    const t = message.sender_type || "";
    if (
        t.includes("CaseworkerLicenseConfig") ||
        t.toLowerCase().includes("caseworker")
    ) {
        return sender.profile_image ?? sender.logo ?? "/img/avatars/user.svg";
    }
    return sender.profile_image ?? "/img/avatars/user.svg";
}
</script>
