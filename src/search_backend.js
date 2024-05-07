const BOOKMARK = "bookmark";
const HISTORY = "history"
const NONE = ""

const MATCH_LIMIT = 0.5

// Fuzzy search 
function fuzzy_search(fuse, query) {
    return fuse.search(query)
        .filter(b => b.score <= MATCH_LIMIT)
        .map(b => b.item)
}

// Filter bookmarks and send back
chrome.runtime.onMessage.addListener(function(obj, _sender, respond) {
    let query = obj.query
    let source = obj.source

    if (query == "") {
        respond({
            results: []
        })
        return
    }

    let results = []
    switch (source) {
        case "bookmark":
            results = fuzzy_search(bookmark_fuse, query)
            break
        case "history":
            results = fuzzy_search(history_fuse, query)
            break
        default:
            console.log("UNSUPPORTED source", source)
            break
    }

    respond({
        results,
    })

});

