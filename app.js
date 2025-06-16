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
await startLowdb()

const app = express()
const jwtSecretKey = process.env.JWT_SECRET_KEY

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('view engine', 'ejs');
app.set('views', './views');

app.get("/", (_req, res) => {
    res.render('index', { version: '1.0.0' });
    // res.send("Auth API.\nPlease use POST /auth & POST /verify for authentication");
});

// Rota para criar usuário
app.post('/create-user', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const { users } = db.data;
    if (users.find(u => u.email === email)) {
        return res.status(409).json({ error: 'Usuário já existe.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.data.users.push({ email, password: hashedPassword });
    await db.write();

    res.status(201).json({ message: 'Usuário criado com sucesso!' });
});

app.post("/auth", async (req, res) => {
    const { email, password } = req.body
    const { users } = db.data
    const user = users.find(user => email === user.email)

    if (user) {
        const result = await bcrypt.compare(password, user.password)
        if (!result) {
            return res.status(401).json({ message: "Invalid password" })
        } else {
            let loginData = {
                email,
                signInTime: Date.now(),
            }
            const token = jwt.sign(loginData, jwtSecretKey)
            return res.status(200).json({ message: "authentication success", token })
        }
    } else {
        // Usuário não encontrado
        return res.status(404).json({ message: "Usuário não encontrado" })
    }
})

app.post('/verify', (req, res) => {
    const authToken = req.headers.tokenheaderkey;
    try {
        const verified = jwt.verify(authToken, jwtSecretKey)
        return verified ? res.status(200).json({ status: "logged in", message: "verify with success" }) : res.status(401).json({ status: "invalid auth", message: "error" });
    } catch (error) {
        return res.status(401).json({ status: "invalid auth", message: "error" })
    }
})

app.get('/check-account', (req, res) => {
    const { email } = req.body
    const { users } = db.data
    const user = users.find(user => email === user.email)
    res.status(200).json({
        status: user ? "User exists" : "User does not exist", userExists: !!user
    })
})

app.delete('/remove-user', async (req, res) => {
    const { email } = req.body
    const { users } = db.data;
    const userIndex = users.findIndex(user => email === user.email);
    if (userIndex !== -1) {
        db.data.users.splice(userIndex, 1);
        await db.write();
        return res.status(200).json({
            status: "User removed", userExists: true
        });
    }
    res.status(200).json({
        status: "User not founded", userExists: false
    });
})

app.listen(3080, function () {
    console.log('listen to port 3080')
})