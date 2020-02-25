// @ts-nocheck
module.exports = function injected() {
    let url = new URL(document.URL),
        unusedBids = [],
        script = getScriptInfo().adxbid[0]


    function hostname() {
        let hostname = url.hostname,
            arr = hostname.split(''),
            trim = ['www.', 'm.'],
            result = ''

        for (let toTrim of trim) {
            if (hostname.startsWith(toTrim)) {
                arr.splice(0, toTrim.length)
                result = arr.join('')
                break
            }
            else result = hostname
        }

        return result
    }

    function checkDivs() {
        let gtUnits = getAdUnits()
        for (let adUnit in gtUnits) {
            if (document.querySelector(`[id="${gtUnits[adUnit].ID}"]`)) {
                gtUnits[adUnit].pageType = getPageType()
            }
        }

        return gtUnits
    }

    function getScriptInfo() {
        let adxbid = [],
            adServer = [],
            adocean = 'AdOcean',
            gam = 'Google Ad Manager',
            pagora = 'Project Agora',
            rev = 'Revive Ad Server'

        let scriptTags = document.getElementsByTagName('script')
        for (let script of scriptTags) {
            let src = script.getAttribute('src')
            if (src) {
                let url = src.match(/https:\/\/adxbid\.(info|me)\/[a-z,0-_]+\.js/gi)
                adxbid = url ? url : adxbid
                if (typeof ado !== 'undefined' && !adServer.includes(adocean))
                    adServer.push(adocean)
                if (typeof googletag !== 'undefined' && !adServer.includes(gam))
                    adServer.push(gam)
                if (typeof ProjectAgora !== 'undefined' && !adServer.includes(pagora))
                    adServer.push(pagora)
                if (typeof reviveAsync !== 'undefined' && !adServer.includes(rev))
                    adServer.push(rev)
            }
        }

        return { adxbid, adServer }
    }

    function fillUnusedBids() {
        if (typeof adUnits !== 'undefined')
            for (let pbUnit of adUnits) {
                if (!pbUnit.labelAny
                    || (isMobile() && (pbUnit.labelAny.includes('mobile') || /mobile/gi.test(script)))
                    || (!isMobile() && (pbUnit.labelAny.includes('desktop') || /desktop/gi.test(script))))
                    unusedBids.push(pbUnit.code)
            }
    }

    function getAdUnits() {
        let result = {},
            gtUnits

        if (typeof googletag !== 'undefined')
            gtUnits = googletag.pubads().getSlots()

        fillUnusedBids()

        if (Array.isArray(gtUnits))
            for (let adUnit of gtUnits) {
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

                let prebid = false,
                    bids, bids_mobile,
                    pbSizes, pbSizes_mobile,
                    labels

                if (typeof adUnits !== 'undefined')
                    for (let pbUnit of adUnits) {
                        let label = ''

                        if (!pbUnit.labelAny && !/desktop|mobile/gi.test(script)) label = 'any'
                        else if (!isMobile() && (pbUnit.labelAny && pbUnit.labelAny.includes('desktop') || /desktop/gi.test(script))) label = 'desktop'
                        else if (isMobile() && (pbUnit.labelAny && pbUnit.labelAny.includes('mobile') || /mobile/gi.test(script))) label = 'mobile'

                        if (pbUnit.code === ID) {

                            switch (label) {
                                case 'any':
                                    prebid = true
                                    bids = pbUnit.bids
                                    bids_mobile = bids
                                    pbSizes = pbUnit.mediaTypes.banner.sizes
                                    pbSizes_mobile = pbSizes
                                    labels = pbUnit.labelAny
                                    unusedBids.splice(unusedBids.indexOf(ID), 1)
                                    break;
                                case 'desktop':
                                    prebid = true
                                    bids = pbUnit.bids
                                    pbSizes = pbUnit.mediaTypes.banner.sizes
                                    labels = pbUnit.labelAny
                                    unusedBids.splice(unusedBids.indexOf(ID), 1)
                                    break
                                case 'mobile':
                                    prebid = true
                                    bids_mobile = pbUnit.bids
                                    pbSizes_mobile = pbUnit.mediaTypes.banner.sizes
                                    labels = pbUnit.labelAny
                                    unusedBids.splice(unusedBids.indexOf(ID), 1)
                                    break
                                default:
                                    break;
                            }
                        }
                    }

                result[name] = {
                    name,
                    ID,
                    publisher,
                    sizes: arraySizes,
                    prebid,
                    bids,
                    bids_mobile,
                    pbSizes,
                    pbSizes_mobile,
                    labels,
                }
            }

        return result
    }

    function getPageType() {
        let pageType = [],
            mobileString = '',
            arr = url.pathname.split('/'),
            pathArr = url.pathname.split(''),
            catIdentifiers = ['kategorija', 'category', 'rubrika', 'sport', 'vijesti', 'teme', 'spor', 'vesti', 'news', 'kosarka'],
            homeIdentifiers = ['', '/', 'm', 'mobile-home', 'mobile']

        if (isMobile()) mobileString = '_mobile'

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
                } else type = 'article' + mobileString
            }
            pageType.push(type)
        }

        return pageType
    }

    function isMobile() {
        let mobileReg = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
            isMobile = mobileReg.test(navigator.userAgent)

        return isMobile
    }

    function getUnusedBids() {
        let bids = []

        for (let bid of unusedBids) {
            bids.push({ id: bid, pageType: getPageType()[0] })
        }

        return bids
    }

    return new Promise((resolve, reject) => {
        let timeout = 150000

        setTimeout(() => {
            reject('window.onload timed out after: ' + timeout)
        }, timeout)

        if (document.readyState === 'complete') returnResolve()
        else window.onload = returnResolve()

        function returnResolve() {
            let obj = {
                adUnits: checkDivs(),
                scripts: getScriptInfo().adxbid,
                pageType: getPageType(),
                name: hostname(),
                unusedBids: getUnusedBids(),
                adServer: getScriptInfo().adServer
            }
            resolve(obj)
        }
    })
}