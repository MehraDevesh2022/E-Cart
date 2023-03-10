import React, { useEffect } from "react";
import "./ProductDetails.css";
import { useSelector, useDispatch } from "react-redux";
import ReviewCard from "./ReviewCard";
import { useRouteMatch } from "react-router-dom";
import { clearErrors, getProductDetails } from "../../actions/productAction";
import Loader from "../layouts/loader/Loader";
import { useAlert } from "react-alert";
import MetaData from "../layouts/MataData/MataData";
import ReactStars from "react-rating-stars-component";
import { addItemToCart } from "../../actions/cartAction";
const firstExample = {
  value: 2.5,
  edit: false,
  size: window.innerWidth < 600 ? 18 : 20,
  isHalf: true,
};

function ProductDetails() {
  const match = useRouteMatch();
  const dispatch = useDispatch();
  const alert = useAlert();

  const { product, loading, error } = useSelector(
    (state) => state.productDetails
  );

  useEffect(() => {
    if (error) {
      alert.error(error);
      dispatch(clearErrors);
    }

    dispatch(getProductDetails(match.params.id));
  }, [dispatch, error, alert]);

  const [quantity, setQuantity] = React.useState(1);

  function increaseQuantityHandler() {
    if (product.Stock <= quantity) {
      return;
    }

    setQuantity((prv) => prv + 1);
  }

  function deceraseQuantityHandler() {
    if (quantity <= 1) {
      return;
    }
    setQuantity((prv) => prv-1);
  }

  const addToCartHandler =() =>{
    dispatch(addItemToCart(match.params.id, quantity));
       alert.success("Item Added To Cart");
  }

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <MetaData title={`${product.name} --Ecart`} />
          <div className="ProductDetails">
            <div className="CarouselImage ">
              {product.images &&
                product.images.map((item, i) => (
                  <img
                    className="CarouselImage"
                    key={i}
                    src={item.url}
                    alt={`${i} Slide`}
                  />
                ))}
            </div>

            <div>
              <div className="detailsBlock-1">
                <h2>{product.name}</h2>
                <p>Product # {product._id}</p>
              </div>

              <div className="detailsBlock-2">
                <ReactStars {...firstExample} />
                <span className="detailsBlock-2-span">
                  ({product.numOfReviews} Reviews)
                </span>
              </div>

              <div className="detailsBlock-3">
                <h1>{`???${product.price}`}</h1>
                <div className="detailsBlock-3-1">
                  <div className="detailsBlock-3-1-1">
                    <button onClick={deceraseQuantityHandler}>-</button>
                    <input readOnly type="number" value={quantity} />
                    <button onClick={increaseQuantityHandler}>+</button>
                  </div>
                  <button
                    disabled={product.Stock < 1 ? true : false}
                    onClick={addToCartHandler}
                  >
                    Add to Cart
                  </button>
                </div>

                <p>
                  Status:
                  <b className={product.Stock < 1 ? "redColor" : "greenColor"}>
                    {product.Stock < 1 ? "OutOfStock" : "InStock"}
                  </b>
                </p>
              </div>

              <div className="detailsBlock-4">
                Description : <p>{product.description}</p>
              </div>

              <button className="submitReview">Submit Review</button>
            </div>
          </div>

          {/* REVIEWS section */}
          <h3 className="reviewsHeading">REVIEWS</h3>
          {product.reviews && product.reviews ? (
            <div className="reviews">
              {product.reviews &&
                product.reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
            </div>
          ) : (
            <p className="noReviews">No Reviews Yet</p>
          )}
        </>
      )}
    </>
  );
}

export default ProductDetails;
