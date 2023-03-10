const ProductModel = require("../model/ProductModel");
const ErrorHandler = require("../utils/errorHandler");
const asyncWrapper = require("../middleWare/asyncWrapper");
const ApiFeatures = require("../utils/apiFeatures");

   
// >>>>>>>>>>>>>>>>>>>>> createProduct Admin route  >>>>>>>>>>>>>>>>>>>>>>>>
exports.createProduct = asyncWrapper(async (req, res) => {

       const body = req.body;

       // when we have muliple admin . to ishe ye pta chlgea kiss admin ne konsa product cretae kiya hai. q ki product schema main user section main usg user ki id add ho jayegi.
       req.body.user = req.user.id // req.user created by us.. user all data store in this object from there we are adding user id to the products user section

       const data = await ProductModel.create(body)
    
       res.status(200).json({ succes: true, data: data })

}
)


// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> get all product >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
exports.getAllProducts = asyncWrapper(async (req, res , next) => {
  const resultPerPage = 5; // per page products visibile
  // const products = await ProductModel.find();
  const productsCount = await ProductModel.countDocuments(); // it returns product length
  // ApiFeatures is class and we making here intsance of that . and passing 2 args : => agr : ProductModel.find() ==> reciving as  query in constructor , and   req.query ==> reciving as  queryString in constructor
  const apiFeature = new ApiFeatures(ProductModel.find(), req.query)
    .search()
    .filter();
 
  let products = await apiFeature.query; // whatever data is return base on filter fetching here using apiFeature.query where apiFeature is complete object of ApiFeatures class with req data. and query is property form ApiFeatures class same like queryString , query storing req data here
  // if  there is no value in query string then all prodcut is return here in apiFeature.query

  let filterdProductCount = products.length; // this is for pagination in frontend . if  filterdProductCount < resultperPage then dont show pagination
  apiFeature.Pagination(resultPerPage); //now products with pagination
  //Mongoose no longer allows executing the same query object twice => so use .clone()
  products = await apiFeature.query.clone(); // get products
  res.status(201).json({
    succes: true,
    products: products,
    productsCount: productsCount,
    resultPerPage: resultPerPage,
    filterdProductCount: filterdProductCount,
  });
})


//>>>>>>>>>>>>>>>>>> Update Admin Route >>>>>>>>>>>>>>>>>>>>>>>
exports.updateProduct = asyncWrapper(async (req, res, next) => {

       let Product = await ProductModel.findById(req.params.id);
       console.log(Product);
       if (!Product) {
              return next(new ErrorHandler("Product not found", 404))
       }

       console.log(Product);
       Product = await Product.findByIdAndUpdate(req.params.id, req.body, {
              new: true,
              runValidators: true,
              useFindAndModify: false,
       });
       res.status(201).json({
              succes: true,
              message: Product
       })
})

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  delete product --admin  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
exports.deleteProduct = asyncWrapper(async (req, res, next) => {

       let product = await ProductModel.findById(req.params.id);

       if (!product) {
              return next(new ErrorHandler("Product not found", 404))
       }

       await product.remove();

       res.status(201).json({
              succes: true,
              message: "Product delete successfully"
       })

})
exports.getProductDetails = asyncWrapper(async (req, res, next) => {

       const id = req.params.id;
       const Product = await ProductModel.findById(id);
       if (!Product) {
              return next(new ErrorHandler("Product not found", 404))
       }
       res.status(201).json({
         succes: true,
         Product: Product,
       });

})

//>>>>>>>>>>>>> Create New Review or Update the review >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

exports.createProductReview = asyncWrapper(async (req, res, next) => {
       const { rating, comment, productId } = req.body;
   console.log(rating);
       const review = {
              userId: req.user._id,  // user id who is adding review in prodcut. user must login .. there req.user has all info about user(from authentication);
              name: req.user.name,
              rating: rating,
              comment : comment 
       };
 
       // find product by product id.
        const product = await ProductModel.findById(productId);

        // in product schema product.reviews is array with {userID , name  , rating ,comment} property . we are checking here is this user done review before on this product if yes then update that review else add new
       const isReviewed = product.reviews.find(
              // check kya pehle review kiya hai. to user data base main user id match kro abhi jo review kra hai ush userId se
              (rev) => rev.userId.toString() === req.user._id.toString()
       );

              
       // agar  isReviewed ==true iska mtlv user ne pehle review kiya then update. else add new
       if (isReviewed) {
              // find that user in reviews array 
              product.reviews.forEach((rev) => {
                     if (rev.userId.toString() === req.user._id.toString())
                          (rev.rating = rating), (rev.comment = comment);
              });
       } else {
              // if isReviewed false that mean user not did any reviwe in that product so add new one and push it into product.reviews array
              product.reviews.push(review);
              product.numOfReviews = product.reviews.length;
       }

       // now find total ratings for that product. based on all reviews
       let avg = 0;
    // caluclate all reviews sum of  all ratings then calcculate avg of that review
       product.reviews.forEach((rev) => {
              avg += rev.rating;
       });

         // update rating avg
         console.log(avg);
       product.ratings = avg / product.reviews.length;
       console.log(product.ratings);
  // save to db
       await product.save({ validateBeforeSave: false });

       res.status(200).json({
              success: true,
       });
});


// >>>>>>>>>>>>>>>>>>>>>> Get All Reviews of a product>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
exports.getProductReviews = asyncWrapper(async (req, res, next) => {
      // we need product id for all reviews of the product
      
      const product = await ProductModel.findById(req.query.id);

       if (!product) {
              return next(new ErrorHandler("Product not found", 404));
       } 

       res.status(200).json({
              success: true,
              reviews: product.reviews,
       });
});

//>>>>>>>>>>>>>>>>>>>>>> delete review >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
exports.deleteReview = asyncWrapper(async (req, res, next) => {
      // we have review id and product id here in req object
      // find thr product with product id
        console.log("hello " ,req.query); 
      const product = await ProductModel.findById(req.query.productId);
     
       if (!product) {
              return next(new ErrorHandler("Product not found", 404));
       }
     
       // check if ther any review avalible with given reviwe id. then filter the review array store inside reviews without that review
       const reviews = product.reviews.filter(
              (rev) => rev._id.toString() !== req.query.id.toString()
       );
     // once review filterd then update new rating from prdoduct review
       let avg = 0;
       console.log(reviews);
       reviews.forEach((rev) => {
              console.log(rev.ratings ," rev");
              avg += rev.ratings;
       });

       let ratings = 0;
        
       if (reviews.length === 0) {
              ratings = 0;
       } else {
              ratings = avg / reviews.length;
       }
             // also set  numOfReviews in product
       const numOfReviews = reviews.length;
            // now update the product schema with these values
       await ProductModel.findByIdAndUpdate(
              req.query.productId,
              {
                     reviews,
                     ratings,
                     numOfReviews,
              },
              {
                     new: true,
                     runValidators: true,
                     useFindAndModify: false,
              }
       );

       res.status(200).json({
              success: true,
       });
});