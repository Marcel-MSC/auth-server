import express from "express"
import bcrypt from 'bcryptjs'
import cors from 'cors'
import jwt from "jsonwebtoken"
import { JSONFilePreset } from 'lowdb/node'
import 'dotenv/config'

const defaultData = { users: [] }
let db
async function startLowdb() {
    db = await JSONFilePreset('datatable.json', defaultData)
}
startLowdb()

// Initialize Express app
const app = express()
// Define a JWT secret key. This should be isolated by using env letiables for security
const jwtSecretKey = process.env.JWT_SECRET_KEY

// Set up CORS and JSON middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Basic home route for the API
app.get("/", (_req, res) => {
    res.send("Auth API.\nPlease use POST /auth & POST /verify for authentication");
})

// The auth endpoint that creates a new user record or logs a user based on an existing record
app.post("/auth", (req, res) => {
    const { email, password } = req.body
    // Look up the user entry in the database
    const { users } = db.data
    const user = users.filter(user => email === user.email)
    console.log('user', user)
    //const user = db.get("users").value().filter(user => email === user.email)
    // If found, compare the hashed passwords and generate the JWT token for the user
    if (user.length === 1) {
        bcrypt.compare(password, user[0].password, function (_err, result) {
            console.log('_err', _err)
            console.log('compare result', result)
            if (!result) {
                console.log('invalid password')
                return res.status(401).json({ message: "Invalid password" })
            } else {
                let loginData = {
                    email,
                    signInTime: Date.now(),
                }
                const token = jwt.sign(loginData, jwtSecretKey)
                res.status(200).json({ message: "authentication success", token })
            }
        })
        // If no user is found, hash the given password and create a new entry in the auth db with the email and hashed password
    } else if (user.length === 0) {
        bcrypt.hash(password, 10, async function (_err, hash) {
            console.log('email e password', { email, password: hash })
            const { users } = db.data
            // db.get("users").push({ email, password: hash }).write()
            db.data.users.push({ email, password: hash })
            await db.write()
            console.log('autorizado com sucesso')
            let loginData = {
                email,
                signInTime: Date.now(),
            }
            const token = jwt.sign(loginData, jwtSecretKey)
            res.status(200).json({ message: "success", token })
        })
    }
})

// The verify endpoint that checks if a given JWT token is valid
app.post('/verify', (req, res) => {
    //const tokenHeaderKey = "jwt-token"
    const authToken = req.headers.tokenheaderkey;
    console.log('req', req.headers)
    debugger
    try {
        const verified = jwt.verify(authToken, jwtSecretKey)
        return verified ? res.status(200).json({ status: "logged in", message: "verify with success" }) : res.status(401).json({ status: "invalid auth", message: "error" });
    } catch (error) {
        // Access Denied
        return res.status(401).json({ status: "invalid auth", message: "error" })
    }
})

// An endpoint to see if there's an existing account for a given email address
app.post('/check-account', (req, res) => {
    const { email } = req.body
    console.log(req.body)
    const { users } = db.data
    const user = users.filter(user => email === user.email)
    console.log(user)
    res.status(200).json({
        status: user.length === 1 ? "User exists" : "User does not exist", userExists: user.length === 1
    })
})

// An endpoint to delete a user
// lowdb doenst give a delete/remove function
// so we filer the user to se if exists and them update the users with a new object;
app.post('/remove-user', async (req, res) => {
    const { email } = req.body
    const { users } = db.data;
    const user = users.filter(user => email === user.email);
    if (user) {
        const newObj = {};
        newObj.users = [];
        const newUsers = users.filter(userDB => email == userDB.email ? null : userDB);
        newObj.users = newUsers;
        db.data.users = newUsers;
        db.write();
    }
    res.status(200).json({
        status: user.length === 1 ? "User removed" : "User not founded", userExists: user.length === 1
    });
})

app.listen(3080, function () {
    console.log('listen to port 3080')
})