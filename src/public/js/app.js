const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
room.hidden = true;

let roomName = "";

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

/** 방에 입장한 후, 메세지 작성 */
function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("input");
    const value = input.value; // 이벤트의 콜백함수가 실행되는 시점까지 저장되어 있어야 하므로
    // 메세지 전송 이벤트
    // 서버에서 new_message이벤트를 listen하면 addMessage를 실행
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    input.value = "";
}
/** room에 입장했을 때 room form을 숨김 */
function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3"); // 방의 이름을 h3에 표시
    h3.innerText = `Room ${roomName}`;

    // 채팅 메세지 입력
    const form = room.querySelector("form");
    form.addEventListener("submit", handleMessageSubmit);
}
function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    // 방 입장 이벤트 emit
    socket.emit("enter_room", input.value, showRoom); // send()대신 room이라는 event를 emit ->
    roomName = input.value;
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

// 모든 이벤트 catch
socket.onAny((event) => {
    console.log(`Front Listen ${event}`);
});
// 방 입장 이벤트 listener
socket.on("welcome", () => {
    console.log("Receive Welcome!");
    addMessage("Someone Joined!");
});
// 방 퇴장 이벤트 listener
socket.on("bye", () => {
    addMessage("Someone Left");
});
// 새로운 메세지 수신 listener
socket.on("new_message", addMessage); // (msg) => addMessage(msg)와 같다
