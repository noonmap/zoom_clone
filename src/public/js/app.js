const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

// 서버와 연결된 socket
const socket = new WebSocket(`ws://${window.location.host}`);

// socket이 connection을 open했을 때 이벤트 추가
socket.addEventListener("open", () => {
    console.log("Connected to Server 👍");
});

// socket에 message 받는 이벤트 추가
socket.addEventListener("message", (message) => {
    console.log("New message: ", message.data, " from the server");
});

// 서버와의 connection 종료 이벤트 추가
socket.addEventListener("close", () => {
    console.log("Disconnected from Server ❌");
});

// 10초 후 동작
setTimeout(() => {
    socket.send("[after 10s] hello from the browser!");
}, 10000);

function handleSubmit(event) {
    event.preventDefault();
    // pug에서 입력한 form 메세지 값을 가져옴 -> submit
    const input = messageForm.querySelector("input");
    // input 메세지를 서버로 전송
    socket.send(input.value);
    // input 메세지를 비워줌
    input.value = "";
}
messageForm.addEventListener("submit", handleSubmit);
