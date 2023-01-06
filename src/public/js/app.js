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

/** room에 입장했을 때 room form을 숨김 */
function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3"); // 방의 이름을 h3에 표시
    h3.innerText = `Room ${roomName}`;
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
