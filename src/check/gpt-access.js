module.exports = function injected() {
    let url = new URL(document.URL)

    function hostname() {
        let hostname = url.hostname,
            arr = hostname.split('')
        if (hostname.startsWith('www.')) {
            arr.splice(0, 4)
            return arr.join('')
        }
        else return hostname
    }

    function checkDivs() {
        let adUnits = getAdUnits()
        for (let adUnit in adUnits) {
            if (document.querySelector(`[id="${adUnits[adUnit].ID}"]`)) {
                adUnits[adUnit].pageType = getPageType()
            }
        }

        return adUnits
    }

    function getScript() {
        let adxbid = []
        let scriptTags = document.getElementsByTagName('script')
        for (let script of scriptTags) {
            if (script.getAttribute('src')) {
                let url = script.getAttribute('src').match(/https:\/\/adxbid\.(info|me)\/[a-z,0-_]+\.js/gi)
                adxbid = url ? url : adxbid
            }
        }

        return adxbid
    }

    function getAdUnits() {
        let result = {}
        //@ts-ignore
        let adunits = googletag.pubads().getSlots()
        for (let adUnit of adunits) {
            let name = adUnit.getSlotId().getName()
            name = name.split('/')[2]
            let ID = adUnit.getSlotId().getDomId()
            let sizes = adUnit.getSizes()

            let arraySizes = []

            for (let size of sizes) {
                let array = []
                array.push(size.l, size.j)
                arraySizes.push(array)
            }

            arraySizes.sort((a, b) => {
                return b[0] * b[1] - a[0] * a[1]
            })

            let publisher = hostname()

            result[name] = {
                name,
                ID,
                publisher,
                sizes: arraySizes,
            }
        }

        return result
    }

    function getPageType() {
        let pageType = [],
            mobileReg = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
            isMobile = mobileReg.test(navigator.userAgent),
            mobileString = '',
            arr = url.pathname.split('/'),
            pathArr = url.pathname.split(''),
            catIdentifiers = ['kategorija', 'category', 'sport', 'vijesti', 'teme'],
            homeIdentifiers = ['', '/', 'm', 'mobile-home', 'mobile']

        if (isMobile) mobileString = '_mobile'

        while (arr.indexOf('') > -1) arr.splice(arr.indexOf(''), 1)
        while (pathArr.indexOf('/') > -1) pathArr.splice(pathArr.indexOf('/'), 1)
        let pathname = pathArr.join('')

        if (homeIdentifiers.includes(pathname)) pageType.push('homepage' + mobileString)
        else {
            let type
            for (let section of arr) {
                if (arr.length < 3 && catIdentifiers.includes(section)) {
                    type = 'category' + mobileString
                    break
                } else if (!Number.isNaN(parseInt(section))) {
                    type = 'article' + mobileString
                    break
                }
            }
            pageType.push(type)
        }

        return pageType
    }

    let obj = {
        adUnits: checkDivs(),
        scripts: getScript(),
        pageType: getPageType(),
        name: hostname()
    }

    return obj
}