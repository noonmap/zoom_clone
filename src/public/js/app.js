const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`); // 서버와 연결된 socket

function makeMessage(type, payload) {
    const msg = { type, payload };
    return JSON.stringify(msg);
}

// socket이 connection을 open했을 때 이벤트 추가
socket.addEventListener("open", () => {
    console.log("Connected to Server 👍");
});

// socket에 message 받는 이벤트 추가
socket.addEventListener("message", (message) => {
    // 받은 메세지를 화면에 표시
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

// 서버와의 connection 종료 이벤트 추가
socket.addEventListener("close", () => {
    console.log("Disconnected from Server ❌");
});

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input"); // pug에서 입력한 form 메세지 값을 가져옴 -> submit
    socket.send(input.value); // input 메세지를 서버로 전송
    input.value = ""; // input 메세지를 비워줌
}
messageForm.addEventListener("submit", handleSubmit);

function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value)); // JSON object를 직렬화해서 전송
}
nickForm.addEventListener("submit", handleNickSubmit);
