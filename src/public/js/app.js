const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call"); // 카메라 나타나는 block
call.hidden = true;

let myStream; // stream = video + audio
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras() {
    try {
        /** 유저의 모든 장치와 미디어 장치들의 목록을 얻음 */
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((devices) => devices.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0]; // 현재 사용중인 카메라
        // 카메라를 선택할 수 있는 option창 추가
        cameras.forEach((camera) => {
            const option = document.createElement("option");
            option.value = camera.deviceId; // 선택한 카메라의 id
            option.innerText = camera.label; // 선택한 카메라의 이름
            // 새로고침했을 때, 카메라 select form에 현재 사용하고 있는 카메라으로 나타남
            if (currentCamera.innerText === camera.label) {
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        });
    } catch (e) {
        console.log(e);
    }
}

/**
 * @param {string} deviceId : 연결할 미디어 장치
 */
async function getMedia(deviceId) {
    // deviceId 인자가 없는 경우 초기 설정
    const initialConstraints = {
        audio: true,
        video: { facingMode: "user" }, // 모바일이면 전면 카메라
    };
    const cameraConstraints = {
        audio: true,
        video: { deviceId: { exact: deviceId } }, // exact : 무조건 deviceId인 장치를 사용, 없으면 비디오 출력 X
    };
    try {
        /**
         * 유저의 유저미디어 string을 줌
         * @param constraints : 우리가 무엇을 얻고싶은지 -> audio, video 둘 다 얻고싶음
         * */
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstraints
        );
        myFace.srcObject = myStream; // 브라우저에 stream 렌더링
        // 카메라 목록은 초기 1번만 가져오면 된다.
        // 아니면 카메라 장치를 선택할 때마다 카메라 목록을 paint하기 때문에 카메라 리스트가 늘어남
        if (!deviceId) {
            await getCameras();
        }
    } catch (e) {
        console.log(e);
    }
}

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
async function handleCameraChange() {
    // 카메라 장치의 device id를 이용해서 비디오 stream을 강제로 다시 시작
    await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (join a room)

const welcome = document.getElementById("welcome"); // room 입장 block
const welcomeForm = welcome.querySelector("form");

/** 방 입장 후, 미디어 장치 시작 & 표시 */
async function startMedia() {
    welcome.hidden = true; // room name 입력 block 가림
    call.hidden = false; // 카메라 block을 보이게 함
    await getMedia(); // 미디어 장치 시작시킴
    makeConnection();
}
/** 방 입장 */
function handleWelcomeSubmit(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    socket.emit("join_room", input.value, startMedia); // 서버로 room name 전달
    roomName = input.value;
    input.value = "";
}
welcomeForm.addEventListener("submit", handleWelcomeSubmit);

/** 다른 사람이 방에 입장했을 때 */
socket.on("welcome", async () => {
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("Sent");
    // 이 emit은 Room에 먼저 입장한 유저가 실행함. offer를 생성하는 입장 -> 서버가 받음
    socket.emit("offer", offer, roomName); // 방(roomName)의 초대장(offer)를 보냄(emit)
});

// 이 on은 Room에 뒤에 입장하는 유저가 받음. offer를 받는 입장 <- 서버가 emit함
socket.on("offer", (offer) => {
    console.log(offer);
});

// RTC Code

/** 유저 간 P2P 연결 */
function makeConnection() {
    myPeerConnection = new RTCPeerConnection(); // P2P 연결 (전역으로 저장)
    myStream.getTracks().forEach((track) => myPeerConnection.addTrack(track, myStream)); // 카메라, 마이크의 데이터 stream을 받아서 connection안에 넣음
}
