export const SOCKET_EVENTS = {
  ROOM_NAME: "music-control-room",
  COMMAND: "player:command", // 前端发命令
  EXECUTE: "player:execute", // 后端执行播放动作后广播
  STATE_UPDATE: "playlist:update", // 你可以再扩展其他事件
};
