const path = require('path')
const express = require('express')
const hbs = require('hbs')
const cors = require('cors')
const fs = require('fs')
const users = require('./users.json')
const uuid = require('uuid')
const cookieParser = require("cookie-parser")
const sessions = require('express-session')

const PORT = process.env.PORT || 3000

const app = express()

const resourcesPath = path.join(__dirname, '../assets')
const templatesPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

app.set('view engine', 'hbs')
app.set('views', templatesPath)
hbs.registerPartials(partialsPath)

app.use(express.urlencoded({
    extended: true
}))
app.use(cors())
app.use(express.static(resourcesPath))
app.use(cookieParser())

const oneDay = 1000 * 60 * 60 * 24
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}))

var session
app.use((req, res, next) => {
    if (!req.session.initialised) {
        req.session.initialised = true
        session = req.session
    }
    next()
})

app.get(['', '/login'], (req, res) => {
    res.render('login', {
        title: 'Login'
    })
})

app.get('/dashboard', (req, res) => {
    if (session.username) {
        res.render('index', {
            title: 'Dashboard',
            name: session.username
        })
    } else {
        res.render('login', {
            message: 'Please login first!'
        })
    }
})

app.get('/profile', (req, res) => {
    res.render('profile', {
        title: 'Profile',
        name: session.username
    })
})

app.get('/logout', (req, res) => {
    req.session.destroy()
    res.render('login', {
        title: 'Login',
        message: 'Successfully logout'
    })
})

app.post('/login', (req, res) => {
    const userInfo = req.body
    const user = users.find(el => el.email === userInfo.userName)
    if (user) {
        if (user.password == userInfo.password) {
            session.username = user.firstName + ' ' + user.lastName
            res.send({
                'Success': 'Success!'
            })
        } else {
            return res.status(401).send({ message: "Invalid Password!" })
        }
    } else {
        return res.status(404).send({ message: "User Not found." })
    }
})

app.get('/register', (req, res) => {
    res.render('register', {
        title: 'Sign Up'
    })
})

app.post('/register', (req, res) => {
    const userInfo = req.body
    const user = users.find(el => el.email === userInfo.email)

    if (!user) {
        const id = uuid.v4()
        userInfo.id = id
        users.push(userInfo)
        fs.writeFileSync('users.json', JSON.stringify(users))
        res.send({ message: "User registered successfully,You can login now." })
    } else {
        res.status(400).send({ message: "Failed! Email is already in use!" })
    }
})

app.listen(PORT, () => {
    console.log('App Started on port ' + PORT)
})