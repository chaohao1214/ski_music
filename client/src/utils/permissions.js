export const canDo = (role, ability) => {
  const map = {
    uploadSong: ["admin"],
    addToPlaylist: ["general_user", "super_user", "player", "admin"],
    removeFromList: ["super_user", "player", "admin"],
    reorderPlaylist: ["super_user", "player", "admin"],
    controlPlayback: ["super_user", "player", "admin"],
    manageUsers: ["admin"],
  };
  return map[ability]?.includes(role);
};
