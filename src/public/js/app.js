const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
room.hidden = true;

let roomName = "";
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
    socket.emit("enter_room", { payload: input.value }, showRoom); // send()대신 room이라는 event를 emit ->
    roomName = input.value;
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
