import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

// 환경 설정
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
// static 설정
app.use("/public", express.static(__dirname + "/public"));
// route 설정
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app); // express app으로부터 http 서버 생성
const wsServer = SocketIO(httpServer); // http 서버 위에 ws 서버 올림 (SocketIO 사용)

/**
 * socketid === room name인 경우, default로 생성된 private room이다.
 * socketid에 포함되지 않는 이름인 경우, public room이다.
 */
function publicRooms() {
    // Adapter : 다른 서버들 사이에 실시간 어플리케이션을 동기화하는 일을 해줌
    const {
        sockets: {
            adapter: { sids, rooms },
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}
wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anonymous";
    socket.onAny((event) => {
        // event : listen한 event의 이름
        console.log(`Socket Event: ${event}`);
    });
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName); // room에 입장
        done();
        socket.to(roomName).emit("welcome", socket.nickname); // 방 입장 event emit
    });
    socket.on("disconnecting", () => {
        // 클라이언트가 서버와 연결이 끊어지기 전에,
        // 현재 유저가 접속한 방에게 "bye" 이벤트를 날릴 수 있음
        socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname));
    });
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
    socket.on("nickname", (nickname) => (socket["nickname"] = nickname)); // 닉네임을 socket에 저장
});

// http 서버에 접근 access
httpServer.listen(3000, handleListen);
