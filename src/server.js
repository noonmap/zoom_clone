import http from "http";
import WebSocket from "ws";
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

// express app으로부터 http 서버 생성
const server = http.createServer(app);
// http 서버 위에 ws 서버 생성
const wss = new WebSocket.Server({ server });

// websocket event 등록
wss.on("connection", (socket) => {
    // websocket이 연결됐을 때 실행되는 callback func
    // socket : 브라우저와 서버 간의 연결
    console.log("Connected to Browser 👍");

    // wss 서버가 아니라 socket에 있는 메소드 사용
    // close 이벤트 listen 등록 -> 브라우저와 연결이 끊기면 수행됨 (브라우저 창 닫기)
    socket.on("close", () => {
        console.log("Disconnected from Browser ❌");
    });
    // 브라우저 -> 서버로 메세지 보냈을 때
    socket.on("message", (message) => {
        console.log(message.toString("utf-8"));
    });
    // 서버 -> 브라우저로 data 전송
    socket.send("hello world!!");
});

// http 서버에 접근 access
server.listen(3000, handleListen);
