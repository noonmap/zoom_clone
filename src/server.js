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

const server = http.createServer(app); // express app으로부터 http 서버 생성
const wss = new WebSocket.Server({ server }); // http 서버 위에 ws 서버 생성

const sockets = []; // socket connection을 저장할 fake db

// websocket event : 브라우저가 연결될 때마다 실행
// 2nd param : websocket이 연결됐을 때 실행되는 callback func (socket : 브라우저와 서버 간의 연결)
wss.on("connection", (socket) => {
    sockets.push(socket); // socket이 연결되면 fake db(array)에 저장
    socket["nickname"] = "Anonymous"; // 닉네임을 socket 객체에 저장

    console.log("Connected to Browser 👍");

    // wss 서버가 아니라 socket에 있는 on 메소드 사용
    // 이벤트 listener 등록 : 브라우저와 연결이 끊기면 수행됨 (브라우저 창 닫기)
    socket.on("close", () => {
        console.log("Disconnected from Browser ❌");
    });
    // 이벤트 listener 등록 : 브라우저 -> 서버로 메세지 보냈을 때
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch (message.type) {
            case "new_message":
                sockets.forEach((aSocket) =>
                    aSocket.send(`${socket.nickname}: ${message.payload}`)
                ); // 각 브라우저에게 msg를 보냄
                break;
            case "nickname":
                socket["nickname"] = message.payload; // 닉네임을 socket 객체에 저장
                break;
        }
    });
});

// http 서버에 접근 access
server.listen(3000, handleListen);
