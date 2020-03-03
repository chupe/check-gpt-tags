//@ts-nocheck

const https = require('https'),
    http = require('http'),
    fs = require('fs'),
    _ = require('lodash')

function fetchFromUrl(url) {
    return new Promise((resolve, reject) => {
        if (!url)
            reject('Url to fetch has not been provided')
        else if (url.startsWith('https://'))
            https.get(url, res => {
                if (res.statusCode >= 300 && res.statusCode < 400) resolve(fetchFromUrl(res.headers.location))
                let body = ''
                res.on('data', data => body += data)
                res.on('end', () => resolve(body))
            })
        else
            http.get(url, res => {
                if (res.statusCode >= 300 && res.statusCode < 400) resolve(fetchFromUrl(res.headers.location))
                let body = ''
                res.on('data', data => body += data)
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

function ArrayEquals() {
    // Warn if overriding existing method
    if (Array.prototype.equals)
        console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
    // attach the .equals method to Array's prototype to call it on any array
    Array.prototype.equals = function (array) {
        // if the other array is a falsy value, return
        if (!array)
            return false;

        // compare lengths - can save a lot of time 
        if (this.length != array.length)
            return false;

        for (var i = 0, l = this.length; i < l; i++) {
            // Check if we have nested arrays
            if (this[i] instanceof Array && array[i] instanceof Array) {
                // recurse into the nested arrays
                if (!this[i].equals(array[i]))
                    return false;
            }
            else if (this[i] != array[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    }
    // Hide method from for-in loops
    Object.defineProperty(Array.prototype, "equals", { enumerable: false });
}

function ObjectEquals() {
    Object.prototype.equals = function (object2) {
        //For the first loop, we only check for types
        for (propName in this) {
            //Check for inherited methods and properties - like .equals itself
            //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
            //Return false if the return value is different
            if (this.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
                return false;
            }
            //Check instance type
            else if (typeof this[propName] != typeof object2[propName]) {
                //Different types => not equal
                return false;
            }
        }
        //Now a deeper check using other objects property names
        for (propName in object2) {
            //We must check instances anyway, there may be a property that only exists in object2
            //I wonder, if remembering the checked values from the first loop would be faster or not 
            if (this.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
                return false;
            }
            else if (typeof this[propName] != typeof object2[propName]) {
                return false;
            }
            //If the property is inherited, do not check any more (it must be equa if both objects inherit it)
            if (!this.hasOwnProperty(propName))
                continue;

            //Now the detail check and recursion

            //This returns the script back to the array comparing
            /**REQUIRES Array.equals**/
            if (this[propName] instanceof Array && object2[propName] instanceof Array) {
                // recurse into the nested arrays
                if (!this[propName].equals(object2[propName]))
                    return false;
            }
            else if (this[propName] instanceof Object && object2[propName] instanceof Object) {
                // recurse into another objects
                //console.log("Recursing to compare ", this[propName],"with",object2[propName], " both named \""+propName+"\"");
                if (!this[propName].equals(object2[propName]))
                    return false;
            }
            //Normal value comparison for strings and numbers
            else if (this[propName] != object2[propName]) {
                return false;
            }
        }
        //If everything passed, let's say YES
        return true;
    }

}

function sanitizeUrl(href) {
    if (!href.startsWith('http')) href = 'https://' + href

    let urlString = new URL(href),
        hrefSanitized,
        urlSanitized

    let noProtHref = href.substr(urlString.protocol.length + 2)

    if (noProtHref.startsWith('www.')) hrefSanitized = noProtHref.slice(4)
    else hrefSanitized = noProtHref

    urlSanitized = new URL(urlString.protocol + hrefSanitized)

    return urlSanitized
}

function errFmt(e) {
    if (!e.msg && !e.message) e.message = e.toString()

    return { message: e }
}

function readFile(path) {
    return new Promise((reject, resolve) => {
        fs.readFile(path, (data, err) => {
            if (err)
                reject(err)
            else
                resolve(data)
        })
    })
}

async function getUrls() {
    let urls = [],
        path = './src/links',
        files = fs.readdirSync(path),
        links = {}

    for (let file of files) {
        let content = (await readFile(path + '/' + file)).toString()
        arr = content.split('\n')
        for (let line of arr) {
            let domain = line.split(/\s/)[0]
            if ((/(?![\s\S]*\/taboola)\./).test(domain) && !urls.includes(domain))
                urls.push(sanitizeUrl(domain))
            // console.log(sanitizeUrl(domain).href)
        }
    }

    urls.sort((a, b) => {
        return a > b
    })
    return urls
}

getUrls().catch(e => console.log(e))

module.exports = {
    fetchFromUrl,
    removeNode,
    hasProperties,
    isIterable,
    ArrayEquals,
    ObjectEquals,
    errFmt,
    sanitizeUrl,
    getUrls
}