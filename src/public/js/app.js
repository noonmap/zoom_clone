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
    socket.send("hello from the browser!");
}, 10000);
