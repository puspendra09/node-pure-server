const { createServer: createHttpServer } = require("http");
const { parse } = require("url");

const StringDecoder = require("string_decoder").StringDecoder;
const decoder = new StringDecoder('utf-8');
let users = require("./users.json");

let userId= '';
let productId ='';
// function for get the all users
function getUsers(req, res) {
    res.writeHead(200,{"Content-Type" : "application/json"});
    let userData=JSON.stringify(users);
    res.end(userData);
}

// function calls for getting a user for a particular Id.
function getUserById(req,res) {
    res.writeHead(200,{"Content-Type" : "application/json"});
    let userData = JSON.stringify(userId);
    res.end(userData);
}

//add post request data
function payload(req,res) {
    let body = '';
    req.on('data', (data) => {
        body += decoder.write(data);
    });
    req.on('end', () => {
        body += decoder.end();
        users.push(JSON.parse(body));
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
    const userIndex = users.indexOf(userObjectId[0]);

    switch (method) {
        case "get":
            if (trimmedPath === '/users' && Object.keys(queryStringObj).length === 0) {
                getUsers(req, res); 
            } else if (userObjectId.length !==0 && trimmedPath === '/users' ) { 
                userId = userObjectId;
                getUserById(req, res);
            }else {
                get404(req, res);
            }
            break;
        case "post":
            if (trimmedPath === '/users' && Object.keys(queryStringObj).length === 0) {            // post for user entity
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
           }else {
                get404(req, res);
            }
            break;
        case "delete":
            if(userObjectId.length !==0 && trimmedPath === '/users') {
                users.splice(userIndex, 1);
                console.log(users);
                res.end("Delete user data Successfully");
            }else {
                get404(req, res);
            }
            break;
    }

}

const httpServer = createHttpServer((req, res) => {
    unifiedServer(req, res);     
});

httpServer.listen(8081, () => {
    console.log("Server is listening at 8081");
});