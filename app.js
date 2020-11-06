const { default: Axios } = require('axios');
const express = require('express'); 
const redis = require('redis'); 
const axios = require('axios')

const app = express()

const client = redis.createClient(); 
client.on('connect', () => {
    console.log('Redis client connected');
})

const PORT = process.env.PORT || 4000 

app.get('/', (req, res) => {
    res.send('home route works..')
})

const cache = (req, res, next) => {
    const { username } = req.params; 
    client.get(username, (err, repos) => {
        if(err) console.log(err, 'err');
        if(repos){
             res.send(setResponse(username, repos))
        }      
    })
 }

const setResponse = (username, repos) => {
    return `<h3>User: ${username} has ${repos} Github repos</h3>`
}

const getRepos = (req, res) => {
    console.log('fetching');
    const { username } = req.params;
    axios.get(`https://api.github.com/users/${username}`)
        .then(response => {
            // console.log(res, 'res');
            const repos = response.data.public_repos
            client.setex(username, 3600, repos)
            res.send(setResponse(username, repos))
            // res.send(response.data)
        })
        .catch(err => {
            console.log(err, 'err');
        })
}

app.get('/repos/:username', cache, getRepos)

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
})