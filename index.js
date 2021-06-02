const { createServer: createHttpServer } = require("http");
const { parse } = require("url");

const StringDecoder = require("string_decoder").StringDecoder;
const { handlers } = require("./handler");
const decoder = new StringDecoder('utf-8');
const users = require("./users.json");
const products = require("./products.json");

let userId= '';
let productId ='';
// function for get the all users
function getUsers(req, res) {
    res.writeHead(200,{"Content-Type" : "application/json"});
    let userData=JSON.stringify(users);
    res.end(userData);
}

// function for get the all products
function getProducts(req, res) {
    res.writeHead(200,{"Content-Type" : "application/json"});
    let productData=JSON.stringify(products);
    res.end(productData);
}

// function calls for getting a user for a particular Id.
function getUserById(req,res) {
    res.writeHead(200,{"Content-Type" : "application/json"});
    let userData = JSON.stringify(userId);
    res.end(userData);
}

// function calls for getting a product for a particular Id.
function getProductById(req,res) {
    res.writeHead(200,{"Content-Type" : "application/json"});
    let productData = JSON.stringify(productId);
    res.end(productData);
}

//add post request data
function payload(req,res) {
    let body = '';
    req.on('data', (data) => {
        body += decoder.write(data);
    });
    req.on('end', () => {
        body += decoder.end();
        console.log(body);
        res.end("Data Added Successfully");
        
    });
}

// function calls if route is not found
function get404(req, res) {
    res.writeHead(404, "Not Found", { "Content-Type": "text/html" });
    res.write("<html><html><head><title>404</title></head><body>404: Not found. Go to <a href='/users'>Users</a></body></html>");
    res.end();
}



// function for handle the GET and POST request.
function unifiedServer(req, res) {
    const parsedUrl = parse(req.url,true);
    const path = parsedUrl.pathname;
    const queryStringObj = parsedUrl.query;
    const trimmedPath = path.replace(/^\/+\/+$/, '');
    const method = req.method.toLowerCase();
    const userObjectId = users.filter(item => item.id == queryStringObj.id);
    const productObjectId = products.filter(item => item.id == queryStringObj.id);
    const userIndex = users.indexOf(userObjectId[0]);
    const productIndex = products.indexOf(productObjectId[0]);

    switch (method) {
        case "get":
            if (trimmedPath === '/users' && Object.keys(queryStringObj).length === 0) {
                getUsers(req, res); 
            } else if (trimmedPath === '/products' && Object.keys(queryStringObj).length === 0) {
                getProducts(req, res);
            } else if (userObjectId.length !==0 && trimmedPath === '/users' ) { 
                userId = userObjectId;
                getUserById(req, res);
            }else if (productObjectId.length !==0 && trimmedPath === '/products') {
                productId = productObjectId;
                getProductById(req, res);
            }else {
                get404(req, res);
            }
            break;
        case "post":
            if (trimmedPath === '/users' && Object.keys(queryStringObj).length === 0) {            // post for user entity
                payload(req,res);
            }else if (trimmedPath === '/products' && Object.keys(queryStringObj).length === 0) {          // post for product entity
                payload(req,res);
            }else {
                get404(req, res);
            } 
            break;
        case "put":
            if(userObjectId.length !==0 && trimmedPath === '/users') {
                let body = '';
                req.on('data', (data) => {
                    body += decoder.write(data);
                });
                req.on('end', () => {
                    body += decoder.end();
                    bodyObject = JSON.parse(body);
                    userObjectId[0].name = bodyObject.name;
                    userObjectId[0].password = bodyObject.password;
                    userObjectId[0].profession = bodyObject.profession;
                    users.splice(userIndex, 1, userObjectId[0]);
                    console.log(users);
                    res.end("Update User Data Successfully");
                });
            }else if(productObjectId.length !==0 && trimmedPath === '/products'){
                let body = '';
                req.on('data', (data) => {
                    body += decoder.write(data);
                });
                req.on('end', () => {
                    body += decoder.end();
                    bodyObject = JSON.parse(body);
                    productObjectId[0].productName = bodyObject.productName;
                    productObjectId[0].productType = bodyObject.productType;
                    productObjectId[0].description = bodyObject.description;
                    productObjectId[0].rate = bodyObject.rate;
                    products.splice(productIndex, 1, productObjectId[0]);
                    console.log(products);
                    res.end("Update Products Data Successfully");
                });
            }else {
                get404(req, res);
            }
            break;
        case "delete":
            if(userObjectId.length !==0 && trimmedPath === '/users') {
                users.splice(userIndex, 1);
                console.log(users);
                res.end("Delete user data Successfully");
            } else if(productObjectId.length !==0 && trimmedPath === '/products') {
                products.splice(productIndex, 1);
                console.log(products);
                res.end("Delete product data Successfully");
            }else {
                get404(req, res);
            }
            break;
    }

}

const httpServer = createHttpServer((req, res) => {
    unifiedServer(req, res);     
});

httpServer.listen(8080, () => {
    console.log("Server is listening at 8080");
});