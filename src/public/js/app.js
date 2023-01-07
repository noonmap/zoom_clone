const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let myStream; // stream = video + audio
let muted = false;
let cameraOff = false;

async function getCameras() {
    try {
        /** 유저의 모든 장치와 미디어 장치들의 목록을 얻음 */
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((devices) => devices.kind === "videoinput");
        // 카메라를 선택할 수 있는 option창 추가
        cameras.forEach((camera) => {
            const option = document.createElement("option");
            option.value = camera.deviceId; // 선택한 카메라의 id
            option.innerText = camera.label; // 선택한 카메라의 이름
            camerasSelect.appendChild(option);
        });
    } catch (e) {
        console.log(e);
    }
}

async function getMedia() {
    try {
        /**
         * 유저의 유저미디어 string을 줌
         * @param constraints : 우리가 무엇을 얻고싶은지 -> audio, video 둘 다 얻고싶음
         * */
        myStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        myFace.srcObject = myStream; // 브라우저에 stream 렌더링
        await getCameras();
    } catch (e) {
        console.log(e);
    }
}

getMedia();

function handleMuteClick() {
    // Audio track을 mute/unmute
    myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    // 버튼 토글
    if (muted) {
        muteBtn.innerText = "Mute";
        muted = false;
    } else {
        muteBtn.innerText = "Unmute";
        muted = true;
    }
}
function handleCameraClick() {
    // Video track을 on/off
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    // 버튼 토글
    if (cameraOff) {
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
