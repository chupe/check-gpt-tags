const https = require('https')

function fetchFromUrl(url) {
    return new Promise((resolve, reject) => {
        if (!url)
            reject('Url to fetch has not been provided')
        else
            https.get(url, (res) => {
                let body = ''
                res.on('data', (data) => body += data)
                res.on('end', () => resolve(body))
            })
    })
}

// Function to remove HTML nodes completly since they only get hidden
// and child elements are stacking upon each apppendChild call
function removeNode(node) {
    while (node.lastChild) {
        node.removeChild(node.lastChild)
    }
    node.remove()
}

// Check if an object is empty or has properties
function hasProperties(obj) {
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop))
            return true
    }
}

function isIterable(obj) {
    // checks for null and undefined
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
}

module.exports = { fetchFromUrl, removeNode, hasProperties, isIterable }