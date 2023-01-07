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
    // p2p연결했을 시, peer connection에도 카메라 변경사항을 적용하기 위함.
    if (myPeerConnection) {
        const videoTrack = myStream.getVideoTracks()[0]; // 내 변경된 track을 찾음
        const videoSender = myPeerConnection // 내 video track을 전송하는 RTCSender를 찾음
            .getSenders()
            .find((sender) => sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack); // 상대에게 보내진 track을 변경함
    }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (join a room)

const welcome = document.getElementById("welcome"); // room 입장 block
const welcomeForm = welcome.querySelector("form");

/** 방 입장 후, 미디어 장치 시작 & 표시 */
async function initCall() {
    welcome.hidden = true; // room name 입력 block 가림
    call.hidden = false; // 카메라 block을 보이게 함
    await getMedia(); // 미디어 장치 시작시킴
    makeConnection();
}
/** 방 입장 */
async function handleWelcomeSubmit(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    // Websocket 속도(상대가 offer를 보내는 속도) < media 가져오는 속도나 연결 만드는 속도
    //  => 내 peerConnection이 생성된 후에 join_room이벤트가 실행되도록 순서를 정해줘야 함
    await initCall();
    socket.emit("join_room", input.value); // 서버로 room name 전달
    roomName = input.value;
    input.value = "";
}
welcomeForm.addEventListener("submit", handleWelcomeSubmit);

/** [1] Room 선입장한 유저 : offer를 생성 & Local에 등록 & 전달 (서버 경유) */
socket.on("welcome", async () => {
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("Sent");
    socket.emit("offer", offer, roomName); // 방(roomName)의 초대장(offer)를 보냄(emit)
});

/** [2] Room 후입장하는 유저 : offer를 받고 Remote에 등록, answer를 생성 & Local에 등록 & 전달 (서버 경유) */
socket.on("offer", async (offer) => {
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
});

/** [3] Room 선입장한 유저 : answer를 받고 Remote에 등록 */
socket.on("answer", (answer) => {
    myPeerConnection.setRemoteDescription(answer);
});

/** [5] 받은 ice candidate를 등록함 (서버 경유) */
socket.on("ice", (ice) => {
    myPeerConnection.addIceCandidate(ice);
});
// RTC Code

/** 유저 간 P2P 연결 */
function makeConnection() {
    myPeerConnection = new RTCPeerConnection(); // P2P 연결 (전역으로 저장)
    myPeerConnection.addEventListener("icecandidate", handleIce); // offer, answer 교환 과정 끝나면 발생하는 icecandidate 이벤트를 listen해야 함.
    myPeerConnection.addEventListener("addstream", handleAddStream); // candidate 정보 교환 후, stream data를 주고받음
    myStream.getTracks().forEach((track) => myPeerConnection.addTrack(track, myStream)); // 카메라, 마이크의 데이터 stream을 받아서 connection안에 넣음
}

/** [4] ice candidate를 상대 브라우저로 보냄 (서버 경유) */
function handleIce(data) {
    socket.emit("ice", data.candidate, roomName);
}

/** [6] 상대의 stream 데이터(비디오)를 받아서 띄워줌 */
function handleAddStream(data) {
    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream; // remote stream을 세팅함.
}
