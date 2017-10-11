const request = require("request")
const cheerio = require("cheerio")
const urlUtil = require("url")

// finds title in the DOM passed
const findTitleInDom = $dom => {
    return (
        $dom("meta[property='og:title']").attr("content") ||
        $dom("title").text() ||
        $dom("meta[name=title]").attr("content")
    )
}

// finds description in the DOM passed
const findDescriptionInDom = $dom => {
    return (
        $dom("meta[property='og:description']").attr("content") ||
        $dom("meta[name=description]").attr("content") ||
        $dom("div .description").text()
    )
}

// finds image in the DOM passed
const findImageInDom = $dom => {
    var imageSrc =
        $dom("meta[property='og:image']").attr("content") ||
        $dom("meta[itemprop=image]").attr("content") ||
        $dom("link[rel=image_src]").attr("content") ||
        $dom("img").attr("src")
    return imageSrc
}

// const validateUrl = (value) => (/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9:%._\+~#=^@]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9:%_\+.~#?&//=^@]*)/g).test(value)

const generatePreview = (url, callback) => {
    // fetches the provided url
    request(url, function(error, response, body) {
        if (!error) {
            const $dom = cheerio.load(body)
            const descr = findDescriptionInDom($dom)
            let title = findTitleInDom($dom)
            title = title ? title : url

            let img = findImageInDom($dom)
            img = img ? urlUtil.resolve(new urlUtil.URL(url).href, img) : ""

            const html = `<div class="linkPreviewContainer">
                <a href="${url}" data-href="${url}" title="${url}" rel="nofollow" target="_blank" class="linkPreviewText">
                    <strong>${title}</strong><br>
                    <em>${descr}</em>${url}</a>
                <a
                    href="${url}" class="linkPreviewImage" target="_blank" style="background-image: url(${img});"></a>
            </div>`

            callback(html)
        } else {
            // if the fetch fails (no internet connection or dead link) return a plain link
            callback(`<a target="_blank" href="${url}">${url}</a>`)
        }
    })
}

module.exports = generatePreview
