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

wsServer.on("connection", (socket) => {
    socket.onAny((event) => {
        // event : listen한 event의 이름
        console.log(`Socket Event: ${event}`);
    });
    socket.on("enter_room", (roomName, done) => {
        // roomName : event emit한 쪽에서 받아온 payload
        // done : event emit한 쪽에서 받아온 function
        console.log(socket.id);
        console.log(socket.rooms); // default room : socket.id가 들어있다.
        socket.join(roomName); // room에 입장
        console.log(socket.rooms);
        setTimeout(() => {
            done();
        }, 1000);
    }); // 사용자 정의 이벤트로 message 수신
});

// http 서버에 접근 access
httpServer.listen(3000, handleListen);
