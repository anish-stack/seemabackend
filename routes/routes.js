const express = require('express')
const { createProducts, getAllProducts, deleteProductById, getProductByName, updateProduct } = require('../controllers/ProductController')
const routes = express.Router()
const multer = require('multer')
const { register, LoginUser, Logout, getAllUsers, getTokenFromCookies } = require('../controllers/Usercontrollers')
const { isAuthenticatedUser } = require('../middlewares/auth')
const { CreateOrder, checkStatus, GetMyOrders } = require('../controllers/OrderController')

const storage = multer.memoryStorage()
const multerUploads = multer({ storage }).array('images')

//====================USER ROUTES=========================//
routes.post('/register', register)
routes.post('/login', LoginUser)
routes.get('/Logout', isAuthenticatedUser, Logout)
routes.get('/All-users', isAuthenticatedUser, getAllUsers)
routes.get('/Token', isAuthenticatedUser, getTokenFromCookies)






    




//====================PRODUCT ROUTES=========================//
routes.post('/create-products', multerUploads, createProducts)
routes.get('/get-products', getAllProducts)
routes.delete('/delete-products/:id', deleteProductById)
routes.get('/get-products-name/:name/:id', getProductByName)
routes.patch('/update-products/:id', updateProduct)

//====================ORDERS ROUTES=========================//
routes.post('/Make-Orders',isAuthenticatedUser,CreateOrder)
routes.post('/status/:txnId',checkStatus)
routes.get('/get-My-Orders',isAuthenticatedUser,GetMyOrders)



module.exports = routes