const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");

let myStream; // stream = video + audio
let muted = false;
let cameraOff = false;

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
