import {
  ALL_PRODUCT_REQUEST,
  ALL_PRODUCT_SUCCESS,
  ALL_PRODUCT_FAIL,
  CLEAR_ERRORS,
  PRODUCT_DETAILS_REQUEST,
  PRODUCT_DETAILS_SUCCESS,
  PRODUCT_DETAILS_FAIL,

} from "../constants/productsConstatns";

export const productsReducer  =  (state ={products : []} , action) =>{
   switch (action.type) {
     case ALL_PRODUCT_REQUEST: {
       return {
        ...state,
         loading: true,
         products: [],
       };
     }
     case ALL_PRODUCT_SUCCESS: {
       return {
         loading: false,
         products: action.payload.products,
         productsCount: action.payload.productsCount,
         resultPerPage: action.payload.resultPerPage,
         filterdProductCount : action.payload.filterdProductCount
       };
     }
     case ALL_PRODUCT_FAIL: {
      console.log(action.payload);
       return {
         loading: false,
         error: action.payload,
       };
     }
    // Clear error
     case CLEAR_ERRORS:
       return {
         ...state,
         error: null,
       };
     default:
       return state;
   }

  }

  
   // product detalis  :
   export const productDetailsReducer = (state = { product: {} }, action) =>{
    switch (action.type) {
      case PRODUCT_DETAILS_REQUEST: {
        return {
          loading: true,
          ...state,
        };
      }
      case PRODUCT_DETAILS_SUCCESS:
        return {
          loading: false,
          product: action.payload, // product details from backend
        };
      case PRODUCT_DETAILS_FAIL:
        return {
          loading: false,
          error: action.payload,
        };

      // error msg clear
      case CLEAR_ERRORS:
        return {
          ...state,
          error: null,
        };

      default:
        return state;
    }
   


   }

   
  

 
