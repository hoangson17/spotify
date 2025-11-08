import actionTypes from "./actionTypes";

export const setCurrentSong = (song: any) => {
  // console.log("Dispatch setCurrentSong:", song);
  return {
    type: actionTypes.SET_CURRENT_SONG,
    payload: song,
  };
};

export const queue = (song: any) => {
  console.log(song);
  
  return{
  type: actionTypes.QUEUE,
  payload: song,
}}

export const togglePlay = () => ({
  type: actionTypes.TOGGLE_PLAY,
});
