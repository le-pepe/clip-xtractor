<script setup lang="ts">
import {onMounted, ref} from "vue";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import Slider from "@vueform/slider";



const showVideo = ref(false)
const isVideoLoaded = ref(false)
const videoPath = ref('')
let videoSize = {width: 0, height: 0}
const ratio = ref('default')
const clip = ref<HTMLElement>()
const clipName = ref('')
const clipTime = ref([0, 0])
const duration = ref(0)
const showToast = ref(false)
const toastText = ref('')
const {openDialog, on, send} = window.api

let crop: Cropper
const cropCanvas = ref()
const resetOptions = () => {
    clipTime.value = [0, 0]
    duration.value = 0
    showVideo.value = false
    isVideoLoaded.value = false
    videoPath.value = ''

    if (crop) {
        crop.reset()
    }
}

const openFileDialog = () => {
    showVideo.value = false
    isVideoLoaded.value = false
    clipTime.value = [0, 0]
    duration.value = 0

    openDialog()
    on('on-file-select', (path) => {
        videoPath.value = path
        showVideo.value = true
    })
}

const videoLoaded = (e) => {
    window.URL.revokeObjectURL(e.target.src)
    isVideoLoaded.value = true
    duration.value = e.target.duration
    clipTime.value = [0, e.target.duration]
    videoSize = {width: e.target.videoWidth, height: e.target.videoHeight}
    clipName.value = 'clip_' + videoPath.value.split(/[\\/]/).pop()

}

const update = (v) => {
    if (!clip.value) return
    clip.value.currentTime = v[0]
}

const extract = () => {
    // console.log(crop.getData())
    send('extract', {
        path: videoPath.value,
        start: clipTime.value[0],
        end: clipTime.value[1],
        name: clipName.value,
        originalSize: {...videoSize},
        cropData: {...crop.getData()}
    })
}

const selectRatio = () => {
    if (ratio.value === 'default') {
        crop.setAspectRatio(NaN)
    } else if (ratio.value === 'social') {
        crop.setAspectRatio(9/16)
    }
}

onMounted(() => {
    on('clip-exists', () => {
        toastText.value = 'Clip name already exists'
        showToast.value = true
        setTimeout(() => {
            showToast.value = false
        }, 3000)
    })
    on('extracted', () => {
        toastText.value = 'Clip extracted successfully'
        showToast.value = true
        setTimeout(() => {
            showToast.value = false
        }, 3000)
    })
    on('clip-error', (err) => {
        toastText.value = err
        showToast.value = true
        setTimeout(() => {
            showToast.value = false
        }, 3000)

    })
    crop = new Cropper(cropCanvas.value, {
        background: false,
        modal: false,
        highlight: false,
        viewMode: 1,
        autoCropArea: 1,
    })
})
</script>

<template>

    <div id="toast-top-right" v-show="showToast"
         class="fixed flex border border-gray-800 dark:border-white items-center max-w-xs p-4 space-x-4 text-gray-500 bg-white divide-x rtl:divide-x-reverse divide-gray-200 rounded-lg shadow top-5 right-5 dark:text-gray-400 dark:divide-gray-700 space-x dark:bg-gray-800 animate-fade"
         role="alert">
        <div class="text-sm font-normal">
            {{ toastText }}
        </div>
        <div class="flex items-center ms-auto space-x-2 rtl:space-x-reverse">
            <button @click="showToast = false" type="button"
                    class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
                    data-dismiss-target="#toast-undo" aria-label="Close">
                <span class="sr-only">Close</span>
                <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                     viewBox="0 0 14 14">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
            </button>
        </div>
    </div>


    <div class="min-h-screen w-full bg-gray-50 dark:bg-gray-800 p-3">
        <div class="grid grid-cols-1 gap-5">
            <div class="text-center w-full">
                <h1 class="text-5xl text-gray-800 dark:text-white">Clip Xtractor</h1>
            </div>
            <div class="text-center">
                <button type="button" @click="openFileDialog"
                        class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
                    Load source
                </button>
                <button type="button" @click="resetOptions" :disabled="!isVideoLoaded"
                        class="disabled:cursor-not-allowed text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
                    Reset
                </button>
                <select v-if="showVideo" v-model="ratio" @change="selectRatio" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option value="default">Personalized aspect</option>
                    <option value="social">Social media aspect</option>
                </select>
            </div>
            <div class="w-[828px] h-[466px] mx-auto relative" :class="{'invisible': !showVideo}">
                <div class="relative">
                    <video :src="videoPath" ref="clip"
                           class="rounded border border-gray-800 dark:border-gray-300 mb-4 w-[828px] h-[466px] absolute top-0 left-0 right-0 bottom-0"
                           @loadedmetadata="(event) => videoLoaded(event)" />
                </div>

                <div class="absolute top-0 bottom-0 left-0 right-0">
                    <canvas ref="cropCanvas" :width="828" :height="466"></canvas>
                </div>
            </div>
            <div class="w-full px-5" v-if="showVideo">
                <Slider v-model="clipTime" :min="0" :max="duration" :step="-1" :tooltips="false" @slide="update"/>
            </div>
            <div class="text-center" v-if="showVideo">
                <span class="text-gray-800 dark:text-gray-400 mx-3">Start:
                    {{ new Date(clipTime[0] * 1000).toISOString().slice(11, 19) }}</span>
                <span class="text-gray-800 dark:text-gray-400 mx-3">End:
                    {{ new Date(clipTime[1] * 1000).toISOString().slice(11, 19) }}</span>
                <span class="text-gray-800 dark:text-gray-400 mx-3">Clip Time:
                    {{ new Date((clipTime[1] - clipTime[0]) * 1000).toISOString().slice(11, 19) }}</span>

            </div>
            <div class="flex col-auto w-full gap-3 px-5" v-if="showVideo">
                <div class="w-full">
                    <input type="text" v-model="clipName"
                           class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                </div>
                <div>
                    <button type="button" @click="extract" :disabled="!isVideoLoaded || clipTime[0] === clipTime[1]"
                            class="disabled:cursor-not-allowed text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                        Extract
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>
<style src="@vueform/slider/themes/default.css"></style>
<style scoped>
.cropper-face {
    background-color: transparent;
}

.cropper-crop-box {
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}
</style>

