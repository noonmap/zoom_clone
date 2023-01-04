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

// http 서버 생성
const server = http.createServer(app);
// http 서버 위에 ws 서버 생성
const wss = new WebSocket.Server({ server });

// websocket이 연결됐을 때 실행되는 callback func
// socket : 브라우저와 서버 간의 연결
function handleConnection(socket) {
  console.log(socket);  
}
// websocket event 등록
wss.on("connection", handleConnection);

app.listen(3000, handleListen);