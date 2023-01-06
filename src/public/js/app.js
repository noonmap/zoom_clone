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
    const input = room.querySelector("#msg input");
    const value = input.value; // 이벤트의 콜백함수가 실행되는 시점까지 저장되어 있어야 하므로
    // 메세지 전송 이벤트
    // 서버에서 new_message이벤트를 listen하면 addMessage를 실행
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    input.value = "";
}

/** 닉네임 작성 */
function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname", input.value);
}

/** room에 입장했을 때 room form을 숨김 */
function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3"); // 방의 이름을 h3에 표시
    h3.innerText = `Room ${roomName}`;

    // 채팅 메세지 입력
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit);
    nameForm.addEventListener("submit", handleNicknameSubmit);
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
socket.on("welcome", (user) => {
    console.log("Receive Welcome!");
    addMessage(`${user} Joined!`);
});
// 방 퇴장 이벤트 listener
socket.on("bye", (user) => {
    addMessage(`${user} Left`);
});
// 새로운 메세지 수신 listener
socket.on("new_message", addMessage); // (msg) => addMessage(msg)와 같다
// 방의 상태 변경시 마다 public room의 list를 update
// => 방에 들어가기 전 기다릴 때, 열려있는 모든 방의 list를 볼 수 있음
socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    // 다시 실행할 때 rooms 배열이 비어있으면 render를 안하기 때문에
    // 리스트를 만들지 않도록 처리해줌
    if (rooms.length === 0) {
        roomList.innerHTML = "";
        return;
    }
    rooms.forEach((room) => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
}); // 반 변경사항 생김 event
