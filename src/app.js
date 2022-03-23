const path = require('path')
const express = require('express')
const hbs = require('hbs')
const cors = require('cors')
const fs = require('fs')
const fetch = require('node-fetch')
const rti = require('rticonnextdds-connector')
var convert = require('xml-js')


const uuid = require('uuid')
const cookieParser = require("cookie-parser")
const sessions = require('express-session')

const PORT = process.env.PORT || 3000
var users

const app = express()

const resourcesPath = path.join(__dirname, '../assets')
const templatesPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')
const configFile = path.join(__dirname, '../ShapeExample.xml')

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

app.get('/users', (req, res) => {
    users = getUsers();
    var start = req.query.start
    var length = req.query.length

    res.send({
        'recordsTotal': users.length,
        'recordsFiltered': users.length,
        'data': (typeof start !== 'undefined' && start) ? users.slice(start, start + length) : users,
    })
})

app.get('/details', (req, res) => {
    fetch('http://localhost:8080/dds/rest1/applications/UsersDemoApp/domain_participants/UserParticipant/subscribers/UserSubscriber/data_readers/UserReader')
        .then(response => response.text())
        .then(data => {
            var result = JSON.parse(convert.xml2json(data, { compact: true, spaces: 4 }))
            res.send((Object.keys(result.read_sample_seq).length) ? result.read_sample_seq.sample.data : 'Waiting for publications...')
        }).catch(function(err) {
            console.log('Not found: ' + err)
        })
})

app.get('/profile', (req, res) => {
    if (session.username) {
        res.render('profile', {
            title: 'Profile',
            name: session.username,
            data: getUsers().find(el => el.id === session.userId)
        })
    } else {
        res.render('login', {
            message: 'Please login first!'
        })
    }
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
    const user = getUsers().find(el => el.email === userInfo.userName)
    if (user) {
        if (user.password == userInfo.password) {
            session.username = user.firstName + ' ' + user.lastName
            session.userId = user.id
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
    users = getUsers()
    const userInfo = req.body
    const user = users.find(el => el.email === userInfo.email)

    if (!user) {
        const id = uuid.v4()
        userInfo.id = id
        users.push(userInfo)
        fs.writeFileSync('./users.json', JSON.stringify(users))

        let data = {
            name: (Object.keys(userInfo.lastName).length) ? userInfo.firstName + ' ' + userInfo.lastName : userInfo.firstName,
            email: userInfo.email,
            gender: userInfo.gender,
            phonenumber: userInfo.phoneNumber,
            dob: userInfo.dob
        }

        fetch('http://localhost:8080/dds/rest1/applications/UsersDemoApp/domain_participants/UserParticipant/publishers/UserPublisher/data_writers/UserWriter', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        }).then((res) => {
            if (res.ok) {
                console.log('User details successfully published..')
            }
        }).catch((err) => {
            console.error(err);
        });

        res.send({ message: "User registered successfully,You can login now." })
    } else {
        res.status(400).send({ message: "Failed! Email is already in use!" })
    }
})

function getUsers() {
    return JSON.parse(fs.readFileSync('./users.json', 'utf8'))
}

app.listen(PORT, () => {
    console.log('App Started on port ' + PORT)
})