var createError = require('http-errors');
var express = require('express');
var path = require('path');
const mongoose = require("mongoose");
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
const Store = require("./models/Store");
const Product = require("./models/Product");
const Order = require("./models/Orders");
const bcrypt = require('bcryptjs');
const passport = require('passport');
const axios = require('axios');
var app = express();
// const users = require('./routes/auth');
// const creds = require('./config/config');
const config = require('config');
var nodemailer = require('nodemailer');
const Email =require('email-templates')
var favicon = require('serve-favicon')
var ejs = require("ejs");

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))


var cors = require('cors');
app.use(cors());
//Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '1000kb' }));

//DB config
const db = require("./config/keys").mongoURI;
//connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

//post store
app.post('/add/store', async (req, res) => {
  console.log(req.body)
  var storeCount =0 
  Store.find({})
  .then(stores => {
    storeCount = stores.length
  })
  .catch(err => res.status(404).json(err));


  let store = new Store({
      storeName: req.body.storeName,
      ownerName: req.body.ownerName,
      emailAddress: req.body.emailAddress,
      phoneNumber: req.body.phoneNumber,
      storeAddress: req.body.storeAddress,
      userName: req.body.userName,
      password: req.body.password,
      lat: req.body.lat,
      lng: req.body.lng,
      aboutStore: req.body.aboutStore,
      isActive: false,
      isBlocked: false,
  });

  store.save(function (err) {
    if (err) {
      console.error(err);
      res.status(200).send({
        success: 'false',
        message: 'store not post',
        store,
      })
    } else {
      res.status(200).send({
        success: 'true',
        message: 'store post',
        store,
      })
    }
  });

});


// app.use('/api/users', users);

//get all stores
app.get('/api/users/exist/:email', (req, res) => {
  
  Store.find({userName: req.params.email})
  .then(stores => {
    console.log(stores)
    if(stores.length === 0){
      res.json("User not exist!");
    }else{
      res.json("User already exists!");
    }
  })
  .catch(err => res.status(404).json(err));
}

);



//get all stores
app.get('/get/store/login/:email/:pass', (req, res) => {

  Store.findOne({userName: req.params.email, password: req.params.pass, isActive: true})
  .then(stores => {
    res.json(stores);
  })
  .catch(err => res.status(404).json(err));
}

);


app.get('/get/store/requests', (req, res) => {
  
  Store.find({isActive: false, isBlocked: false})
  .then(stores => {
    console.log(stores)
     res.json(stores);
  })
  .catch(err => res.status(404).json(err));
}

);

app.get('/get/store/active', (req, res) => {
  
  Store.find({isActive: true})
  .then(stores => {
    console.log(stores)
     res.json(stores);
  })
  .catch(err => res.status(404).json(err));
}

);

app.get('/get/store/blocked', (req, res) => {
  
  Store.find({isBlocked: true})
  .then(stores => {
    console.log(stores)
     res.json(stores);
  })
  .catch(err => res.status(404).json(err));
}

);

//edit store by id
app.put("/make/store/active/:id", async (req, res) => {
  console.log("m", req.params.id)
  Store.updateOne({ _id: req.params.id }, {
    $set: {
      isActive: true,
      isBlocked: false
    }
  }, { upsert: true }, function (err, user) {
    res.status(200).send({
      success: 'true',
      message: 'store updated'
    })
  });
});

//edit store by id
app.put("/make/store/block/:id", async (req, res) => {
  console.log("m", req.params.id)
  Store.updateOne({ _id: req.params.id }, {
    $set: {
      isActive: false,
      isBlocked: true
    }
  }, { upsert: true }, function (err, user) {
    res.status(200).send({
      success: 'true',
      message: 'store updated'
    })
  });
});

app.get('/get/store/stats', (req, res) => {
  
  Store.find({})
  .then(stores => {
    var active =0
    var blockd =0

    for(var i=0; i<stores.length; i++){
      if(stores[i].isActive){
        active++
      }else if(stores[i].isBlocked){
        blockd++
      }
    }


    res.json({
      total: active+blockd,
      active: active,
      blocked: blockd
    });
  })
  .catch(err => res.status(404).json(err));
}

);


app.post('/add/product', async (req, res) => {
  console.log(req.body)
  let product = new Product({
        storeId: req.body.storeId,
        productName: req.body.productName,
        price: req.body.price,
        discount: req.body.discount,
        productDescription: req.body.productDescription,
       
  });

  product.save(function (err) {
    if (err) {
      console.error(err);
      res.status(200).send({
        success: 'false',
        message: 'product not post',
        product,
      })
    } else {
      res.status(200).send({
        success: 'true',
        message: 'product post',
        product,
      })
    }
  });

});


//get all products of store Id
app.get('/get/all/products/:sId', (req, res) => {

  Product.find({storeId: req.params.sId })
  .then(products => {
    console.log(products)
    res.json(products);
  })
  .catch(err => res.status(404).json(err));
}

);

//get product by id
app.get('/get/product/:id', (req, res) => {

  Product.findOne({ _id: req.params.id })
  .then(store => {
    res.json(store);
  })
  .catch(err => res.status(404).json(err));
}

);

app.put("/edit/product/:id", async (req, res) => {
  console.log("m", req.params.tId)
  Product.updateOne({ _id: req.params.id }, {
    $set: {
      storeId: req.body.storeId,
      productName: req.body.productName,
      price: req.body.price,
      discount: req.body.discount,
      productDescription: req.body.productDescription

    }
  }, { upsert: true }, function (err, product) {
    res.status(200).send({
      success: 'true',
      message: 'product updated',
      product: product
    })
  });
});

app.delete('/delete/product/:id',(req, res) => {
  Product.findOne({ _id: req.params.id }).then(store => {
    store.remove().then(() => res.json({ success: true, message: "product deleted" }));
  });
}
);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));

module.exports = app;
