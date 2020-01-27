module.exports = function injected() {
    let url = new URL(document.URL)
    let hostname = url.hostname

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

        return adxbid[0]
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

            let publisher = hostname

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
        let pageType = []

        if (url.pathname === '/' || url.pathname === '')
            pageType.push('homepage')
        else if (
            url.pathname.startsWith('/kategorija') ||
            url.pathname.startsWith('/category') ||
            url.pathname.startsWith('/sport') ||
            url.pathname.startsWith('/teme') ||
            url.pathname.startsWith('/vijesti')
        )
            pageType.push('category')
        else
            pageType.push('article')

        return pageType
    }

    let obj = {
        adUnits: checkDivs(),
        scripts: getScript(),
        pageType: getPageType(),
        name: hostname
    }

    return obj
}