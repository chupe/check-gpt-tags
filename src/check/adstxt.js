const storage = require('../common/database/storage'),
    util = require('../common/util'),
    fs = require('fs'),
    adstxtPath = '/home/chupe/Lupon Media/development/check-gpt-tags/src/common/ads.txt'


async function check(publisher) {
    let origin = new URL(publisher).origin,
        hostname = new URL(publisher).hostname
    let hostAdsTxt = new URL(origin + '/ads.txt')
    let missingLines = []

    // The function loads static ads.txt from local folder, splits it into
    // an array at '\n' than splits it once more so that each comma in a line
    // is a split point. This way each comma separated value in each line can
    // be compared against another line that is generated in the same way but
    // originates from the activeTabUrl.origin /ads.txt
    let compareAdsTxt = (localAdstxt, adstxt) => {

        // Split lines first
        localAdstxt = localAdstxt.split('\n')
        adstxt = adstxt.split('\n')

        for (let localLine of localAdstxt) {
            let onSite = false

            // Skip line of comment
            if (localLine.charAt(0) === '#') continue

            // Each line is split into comma separated list (bidder name, publisher ID)
            // trimmed of spaces for consistency. Iterate over local ads.txt and try to
            // match it against the origin site ads.txt. If unable push missing lines
            // into a variable missingLines
            let localItems = localLine.split(',').map((item) => item.trim())
            for (let siteLine of adstxt) {
                let siteItems = siteLine.split(',').map((item) => item.trim())
                if (localItems[0] === siteItems[0] && localItems[1] === siteItems[1]) {
                    onSite = true
                }
            }
            if (!onSite)
                missingLines.push(localLine)
        }

        return missingLines
    }

    let pub = await storage.getPub({ name: hostname })

    if (!pub) {
        throw new Error ('Can not check ads.txt before other checks')
    }

    let getLocal = new Promise((res, rej) => fs.readFile(adstxtPath, (err, data) => res(data.toString())))
    let local, remote
    [local, remote] = await Promise.all([getLocal, util.fetchFromUrl(hostAdsTxt.href)])

    // @ts-ignore
    pub.adstxtCheck = true
    if (local && remote) {
        // @ts-ignore
        pub.adstxtMissingLines = compareAdsTxt(local, remote)
    }

    pub.save()
}

module.exports = check