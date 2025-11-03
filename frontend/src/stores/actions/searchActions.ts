import { searchService } from "@/services/searchService";
import actionTypes from "./actionTypes";

export const searchAll = (query: string) => async (dispatch: any) => {
  try {
    dispatch({ type: actionTypes.SEARCH_REQUEST });

    const res = await searchService.search(query);
    console.log(res);
    
    dispatch({
      type: actionTypes.SEARCH_SUCCESS,
      results: res.data,
    });
  } catch (error: any) {
    dispatch({
      type: actionTypes.SEARCH_FAIL,
      error: error.message,
    });
  }
};
