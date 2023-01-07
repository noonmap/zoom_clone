const socket = io();

const myFace = document.getElementById("myFace");

let myStream; // stream = video + audio

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
