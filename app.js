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
const EWallet = require("./models/EWallet");
const Haseeb = require("./models/Haseeb");
const Walmart = require("./models/Walmart"); 
const Imtiaz = require("./models/Imtiaz");
const RefID = require("./models/RefID");
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


app.put("/edit/ewallet1/:id/:amount", async (req, res) => {
  console.log("m", req.params.id)
  EWallet.updateOne({ _id: req.params.id }, {
    $set: {
      amount: req.params.amount
    }
  }, { upsert: true }, function (err, user) {
    res.status(200).send({
      success: 'true',
      message: 'ewallet updated'
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

app.get('/get/stores/', (req, res) => {

  Store.find({isActive: true})
  .then(stores => {
    res.json(stores);
  })
  .catch(err => res.status(404).json(err));
}

);

app.get('/get/all/products/:sId', (req, res) => {

  Product.find({storeId: req.params.sId })
  .then(products => {
    console.log(products)
    res.json(products);
  })
  .catch(err => res.status(404).json(err));
}

);

app.get('/get/orders/stats/:id', (req, res) => {

  Order.find({storeId: req.params.id})
  .then(orders => {
    console.log(orders.length)
    var newOrders =0;
    var readyOrders=0;
    var totalRevenue=0;
    
    for(var i=0; i<orders.length; i++){
        if(orders[i].isAccepted === false && orders[i].isRejected === false){
          newOrders++
        }else if(orders[i].isAccepted === true && orders[i].isPicked === true){
          totalRevenue+=parseFloat(orders[i].totalAmount)
        }else if(orders[i].isAccepted === true && orders[i].isReady === true){
          readyOrders++
        }
    }
    var stats={}

    stats= {
      newOrders: newOrders,
      readyOrders: readyOrders,
      totalRevenue: totalRevenue
    }
    console.log("sa1",stats)
   
    res.json(stats);
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



//post order
app.post('/add/order', async (req, res) => {
  console.log(req.body)
  let order = new Order({
    storeId: req.body.storeId,
    products: req.body.products,
    totalAmount:req.body.totalAmount,
    orderNumber: req.body.orderNumber,
    storeName: req.body.storeName,
    storeAddress: req.body.storeAddress,
    storePhone: req.body.storePhone,
    userId: req.body.userId,
    name:req.body.name,
    phone:req.body.phone,
    email: req.body.email,
    address: req.body.address,
    orderTime: req.body.orderTime,
    orderDate: req.body.orderDate,
    isReady: false,
    isAccepted: false,
    isRejected: false,
    isHomeDelivery: req.body.isHomeDelivery

  });

  order.save(function (err,order1) {
    if (err) {
      console.error(err);
      res.status(200).send({
        success: 'false',
        message: 'order not post',
        order1,
      })
    } else {
      res.status(200).send({
        success: 'true',
        message: 'order post',
        order1,
      })
    }
  });

});

app.put("/edit/order/reject/:id", async (req, res) => {
  console.log("m", req.params.tId)
  Order.updateOne({ _id: req.params.id }, {
    $set: {
        isRejected: true,
        isAccepted: false
    }
  }, { upsert: true }, function (err, user) {
    res.status(200).send({
      success: 'true',
      message: 'order updated'
    })
  });
});


app.get('/get/my/orders/:uId', (req, res) => {
  console.log("hiy",req.params)
Order.find({userId: req.params.uId })
.then(order => {
  console.log(order)
  res.json(order);
})
.catch(err => res.status(404).json(err));
}

);

app.get('/get/all/orders/:sId', (req, res) => {

  Order.find({storeId: req.params.sId, isAccepted: false, isRejected: false })
  .then(orders => {
    console.log(orders)
    res.json(orders);
  })
  .catch(err => res.status(404).json(err));
}

);
app.put("/edit/order/reject/:id", async (req, res) => {
  console.log("m", req.params.tId)
  Order.updateOne({ _id: req.params.id }, {
    $set: {
        isRejected: true,
        isAccepted: false
    }
  }, { upsert: true }, function (err, user) {
    res.status(200).send({
      success: 'true',
      message: 'order updated'
    })
  });
});

app.put("/edit/order/accept/:id", async (req, res) => {
  console.log("m", req.params.tId)
  Order.updateOne({ _id: req.params.id }, {
    $set: {
        isAccepted: true,
        isInPreparation: true
    }
  }, { upsert: true }, function (err, user) {
    res.status(200).send({
      success: 'true',
      message: 'order updated'
    })
  });
});

app.put('/get/orders/isrejected/:id', (req, res) => {
  console.log("HITTT", req.params)
  Order.findOne({_id: req.params.id})
  .then(orders => {
   var stat= false
    if(orders.isRejected === true){
      stat= true
    }
    res.json(stat);
  })
  .catch(err => res.status(404).json(err));
}

);

app.get('/get/all/preparation/orders/:sId', (req, res) => {

  Order.find({storeId: req.params.sId, isAccepted: true, isInPreparation: true })
  .then(orders => {
    console.log(orders)
    res.json(orders);
  })
  .catch(err => res.status(404).json(err));
}

);

app.put("/edit/order/ready/:id", async (req, res) => {
  console.log("m", req.params.tId)
  Order.updateOne({ _id: req.params.id }, {
    $set: {
        isReady: true,
        isInPreparation: false
    }
  }, { upsert: true }, function (err, user) {
    res.status(200).send({
      success: 'true',
      message: 'order updated'
    })
  });
});

app.put("/edit/order/picked/:id", async (req, res) => {
  console.log("m", req.params.tId)
  Order.updateOne({ _id: req.params.id }, {
    $set: {
        isReady: false,
        isPicked: true
    }
  }, { upsert: true }, function (err, user) {
    res.status(200).send({
      success: 'true',
      message: 'order updated'
    })
  });
});


app.get('/get/all/ready/orders/:sId', (req, res) => {

  Order.find({storeId: req.params.sId, isAccepted: true, isInPreparation: false ,isReady: true })
  .then(orders => {
    console.log(orders)
    res.json(orders);
  })
  .catch(err => res.status(404).json(err));
}

);

app.get('/get/all/picked/orders/:sId', (req, res) => {

  Order.find({storeId: req.params.sId, isAccepted: true, isInPreparation: false ,isReady: false, isPicked: true })
  .then(orders => {
    console.log(orders)
    res.json(orders);
  })
  .catch(err => res.status(404).json(err));
}

);


app.get('/get/wallet/user/:id', (req, res) => {

  User.find({$or: [{email: req.params.id}, {mobile: req.params.id}]})
  .then(user => {
    console.log(user)
    res.json(user);
  })
  .catch(err => res.status(404).json(err));
}

);



app.post('/add/EWallet', async (req, res) => {
  console.log(req.body)
  let ewallet = new EWallet({
    amount: req.body.amount,
    storeName: req.body.storeName,
    userId: req.body.userId,
    storeId: req.body.storeId
       
  });

  ewallet.save(function (err) {
    if (err) {
      console.error(err);
      res.status(200).send({
        success: 'false',
        message: 'ewallet not post',
        ewallet,
      })
    } else {
      res.status(200).send({
        success: 'true',
        message: 'ewallet post',
        ewallet,
      })
    }
  });

});



app.get('/get/wallet/store/:id', (req, res) => {

  EWallet.find({storeId: req.params.id})
  .then(user => {
    console.log(user)
    res.json(user);
  })
  .catch(err => res.status(404).json(err));
}

);


app.get('/get/wallet/user1/:id', (req, res) => {

  EWallet.find({userId: req.params.id})
  .then(user => {
    console.log(user)
    res.json(user);
  })
  .catch(err => res.status(404).json(err));
}

);

app.get('/get/order/bynumber/:id', (req, res) => {

  Order.findOne({_id: req.params.id, isReady: true })
  .then(order => {
    console.log(order)
    res.json(order);
  })
  .catch(err => res.status(404).json(err));
}

);

app.get('/wallet/amount/:id/:sid', (req, res) => {

  EWallet.findOne({userId: req.params.id, storeId: req.params.sid })
  .then(order => {
    console.log(order)
    res.json(order);
  })
  .catch(err => res.status(404).json(err));
}

);



app.post('/add/walmart/EWallet', async (req, res) => {
  console.log(req.body)

  Walmart.find({name: req.body.name})
  .then(resp => {
      if(resp.length > 0){
        res.status(200).send({
          success: 'true',
          message: 'User exist'
        })
      }else{

        Walmart.find({})
          .then(resp => {
              var idNo = resp.length
              
              let walmart = new Walmart({
                id: Number(idNo+1),
                name: req.body.name,
                token: req.body.token
                  
              });

              walmart.save(function (err, result) {
                console.log(err,result)
                if (err) {
                  console.error(err);
                  res.status(200).send({
                    success: 'false',
                    message: 'walmart not post',
                    walmart,
                  })
                } else {

            
                  axios.post('https://mysterious-anchorage-22807.herokuapp.com/add/refid',{
                    storeName: req.body.storeName,
                    id: Number(idNo+1),
                    userID: req.body.userID
                  }).then(resp => console.log(resp.data))
                    .catch(err => console.log(err))

                  //   User.updateOne({ name: req.body.name }, {
                  //     $set: {
                  //       id: Number(idNo+1)
                  //     }
                  //   }, { upsert: true }, function (err, user) {
                  //     // res.status(200).send({
                  //     //   success: 'true',
                  //     //   message: 'store updated'
                  //     // })
                  //   });

                  res.status(200).send({
                    success: 'true',
                    message: 'walmart post',
                    walmart,
                  })
                }
              });

          })
          .catch(err => res.status(404).json(err));
          
      }
  })
  .catch(err => res.status(404).json(err));


});



app.post('/add/imtiaz/EWallet', async (req, res) => {
  console.log(req.body)

  Imtiaz.find({name: req.body.name})
  .then(resp => {
      if(resp.length > 0){
        res.status(200).send({
          success: 'true',
          message: 'User exist'
        })
      }else{

        Imtiaz.find({})
          .then(resp => {
              var idNo = resp.length
              
              let imtiaz = new Imtiaz({
                id: Number(idNo+1),
                name: req.body.name,
                token: req.body.token
                  
              });

              imtiaz.save(function (err, result) {
                console.log(err,result)
                if (err) {
                  console.error(err);
                  res.status(200).send({
                    success: 'false',
                    message: 'imtiaz not post',
                    imtiaz,
                  })
                } else {

                  axios.post('https://mysterious-anchorage-22807.herokuapp.com/add/refid',{
                    storeName: req.body.storeName,
                    id: Number(idNo+1),
                    userID: req.body.userID
                  }).then(resp => console.log(resp.data))
                    .catch(err => console.log(err))
            
                    // User.updateOne({ name: req.body.name }, {
                    //   $set: {
                    //     id: Number(idNo+1)
                    //   }
                    // }, { upsert: true }, function (err, user) {
                    //   // res.status(200).send({
                    //   //   success: 'true',
                    //   //   message: 'store updated'
                    //   // })
                    // });

                  res.status(200).send({
                    success: 'true',
                    message: 'imtiaz post',
                    imtiaz,
                  })
                }
              });

          })
          .catch(err => res.status(404).json(err));
          
      }
  })
  .catch(err => res.status(404).json(err));


});


app.post('/add/haseeb/EWallet', async (req, res) => {
  console.log(req.body)

  Haseeb.find({name: req.body.name})
  .then(resp => {
      if(resp.length > 0){
        res.status(200).send({
          success: 'true',
          message: 'User exist'
        })
      }else{

        Haseeb.find({})
          .then(resp => {
              var idNo = resp.length
              
              let haseeb = new Haseeb({
                id: Number(idNo+1),
                name: req.body.name,
                token: req.body.token
                  
              });

              haseeb.save(function (err, result) {
                console.log(err,result)
                if (err) {
                  console.error(err);
                  res.status(200).send({
                    success: 'false',
                    message: 'haseeb not post',
                    haseeb,
                  })
                } else {

            
                  axios.post('https://mysterious-anchorage-22807.herokuapp.com/add/refid',{
                    storeName: req.body.storeName,
                    id: Number(idNo+1),
                    userID: req.body.userID
                  }).then(resp => console.log(resp.data))
                    .catch(err => console.log(err))

                    // User.updateOne({ name: req.body.name }, {
                    //   $set: {
                    //     id: Number(idNo+1)
                    //   }
                    // }, { upsert: true }, function (err, user) {
                    //   // res.status(200).send({
                    //   //   success: 'true',
                    //   //   message: 'store updated'
                    //   // })
                    // });

                  res.status(200).send({
                    success: 'true',
                    message: 'haseeb post',
                    haseeb,
                  })
                }
              });

          })
          .catch(err => res.status(404).json(err));
          
      }
  })
  .catch(err => res.status(404).json(err));


});



// app.post('/add/imtiaz/EWallet', async (req, res) => {
//   console.log(req.body)
//   let imtiaz = new Imtiaz({
//     id: "1",
//     name: req.body.name,
//     token: req.body.token
       
//   });

//   imtiaz.save(function (err, result) {
//     console.log(err,result)
//     if (err) {
//       console.error(err);
//       res.status(200).send({
//         success: 'false',
//         message: 'imtiaz not post',
//         imtiaz,
//       })
//     } else {
//       res.status(200).send({
//         success: 'true',
//         message: 'imtiaz post',
//         imtiaz,
//       })
//     }
//   });

// });


app.post('/add/haseeb/EWallet', async (req, res) => {
  console.log(req.body)
  let haseeb = new Haseeb({
    id: "1",
    name: req.body.name,
    token: req.body.token
       
  });

  haseeb.save(function (err, result) {
    console.log(err,result)
    if (err) {
      console.error(err);
      res.status(200).send({
        success: 'false',
        message: 'haseeb not post',
        haseeb,
      })
    } else {
      res.status(200).send({
        success: 'true',
        message: 'haseeb post',
        haseeb,
      })
    }
  });

});


app.put("/edit/haseeb/EWallet/:id", async (req, res) => {
  console.log("m", req.params.id)
  Haseeb.updateOne({ id: req.params.id }, {
    $set: {
      token: req.body.token
    }
  }, { upsert: true }, function (err, user) {
    res.status(200).send({
      success: 'true',
      message: 'store updated'
    })
  });
});

app.put("/edit/imtiaz/EWallet/:id", async (req, res) => {
  console.log("m", req.params.id)
  Imtiaz.updateOne({ id: req.params.id }, {
    $set: {
      token: req.body.token
    }
  }, { upsert: true }, function (err, user) {
    res.status(200).send({
      success: 'true',
      message: 'store updated'
    })
  });
});

app.put("/edit/walmart/EWallet/:id", async (req, res) => {
  console.log("m", req.params.id)
  Walmart.updateOne({ id: req.params.id }, {
    $set: {
      token: req.body.token
    }
  }, { upsert: true }, function (err, user) {
    res.status(200).send({
      success: 'true',
      message: 'store updated'
    })
  });
});

app.get('/haseeb/:id', (req, res) => {
  Haseeb.findOne({id: req.params.id})
  .then(token => {
    console.log("haseeb",token)
    res.json(token);
  })
  .catch(err => res.status(404).json(err));
}

);


app.get('/imtiaz/:id', (req, res) => {
  Imtiaz.findOne({id: req.params.id})
  .then(token => {
    console.log("imtiaz",token)
    res.json(token);
  })
  .catch(err => res.status(404).json(err));
}

);

app.get('/walmart/:id', (req, res) => {
  Walmart.findOne({id: req.params.id})
  .then(token => {
    console.log("walmart",token)
    res.json(token);
  })
  .catch(err => res.status(404).json(err));
}

);

app.get('/get/token/:id/:sname', (req, res) => {

  console.log("ssss",req.params)
  if(req.params.sname === "Haseeb Mart"){

    axios
    .get(
      "https://mysterious-anchorage-22807.herokuapp.com/haseeb/"+req.params.id
    )
    .then((resp) => {
        console.log("i got the response", resp.data)
        res.json(resp.data)
    });

  }else if(req.params.sname === "Wallmart"){
    axios
    .get(
      "https://mysterious-anchorage-22807.herokuapp.com/walmart/"+req.params.id
    )
    .then((resp) => {
        console.log("i got the response", resp.data)
        res.json(resp.data)

    });
  }else if(req.params.sname === "Imtiaz"){
    axios
    .get(
      "https://mysterious-anchorage-22807.herokuapp.com/imtiaz/"+req.params.id
    )
    .then((resp) => {
        console.log("i got the response", resp.data)
        res.json(resp.data)
    });
  }

}

);



app.post('/signup', async (req, res) => {
  console.log(req.body)
  // Check if this user already exisits
  let user = await User.findOne({ email: req.body.email });
  if (user) {
      return res.status(200).send('User already exists!');
  } else {
      // Insert the new user if they do not exist yet
      user = new User({
          name: req.body.name, 
          email: req.body.email,
          mobile: req.body.mobile,
          password: req.body.password,
          address: req.body.address,
          id: req.body.id
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);

      await user.save();
      res.status(200).send(user);
  }
});


app.post('/signin', async (req, res) => {
  console.log("sign in called")
  //  Now find the user by their email address
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
      return res.status(200).send('Email does not exist.');
  }

  // Then validate the Credentials in MongoDB match
  // those provided in the request
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
      return res.status(200).send('Incorrect password.');
  }

  res.send({ user: user});
});




app.post('/add/refid', async (req, res) => {
  console.log(req.body)
  let refID = new RefID({
        storeName: req.body.storeName,
        id: req.body.id,
        userID: req.body.userID
  });

  refID.save(function (err) {
    if (err) {
      console.error(err);
      res.status(200).send({
        success: 'false',
        message: 'refID not post',
        refID,
      })
    } else {
      res.status(200).send({
        success: 'true',
        message: 'refID post',
        refID,
      })
    }
  });

});

app.get('/get/refID/:id', (req, res) => {

  RefID.find({userID: req.params.id})
  .then(refids => {
    res.json(refids);
  })
  .catch(err => res.status(404).json(err));
}

);


app.get('/get/alluser', (req, res) => {

  User.find({})
  .then(users => {
    res.json(users);
  })
  .catch(err => res.status(404).json(err));
}

);



app.put("/edit/user/refID/:id/:refID", async (req, res) => {
  console.log("m", req.params.id)
  User.updateOne({ _id: req.params.id }, {
    $set: {
      id: req.params.refID,
    }
  }, { upsert: true }, function (err, user) {
    res.status(200).send({
      success: 'true',
      message: 'user updated'
    })
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));

module.exports = app;
