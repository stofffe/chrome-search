importScripts("fuzzy.js")

// Index bookmarks from tree
let all_bookmarks = new Array()
let fuse = null
function parse_bookmark_tree(tree) {
    let children = tree.children
    if (children) {
        children.forEach((e) => {
            parse_bookmark_tree(e)
        })
    } else {
        all_bookmarks.push({
            name: tree.title,
            url: tree.url,
        })
    }
}
function index_bookmarks() {
    chrome.bookmarks.getTree((tree) => {
        parse_bookmark_tree(tree[0])
        fuse = new Fuse(all_bookmarks, {
            keys: ["name"],
            includeScore: true,
        })
    })
}

// Fuzzy search 
const MATCH_LIMIT = 0.5
function fuzzy_search(query) {
    return fuse.search(query)
        .filter(b => b.score <= MATCH_LIMIT)
        .map(b => b.item)
}

// Filter bookmarks and send back
chrome.runtime.onMessage.addListener(function(obj, sender, response) {
    let query = obj.query

    let bookmarks = fuzzy_search(query)

    if (query != "") {
        response({
            bookmarks: bookmarks
        });
    } else {
        response({
            bookmarks: []
        })
    }
});

// Inital parse
index_bookmarks()
// Parse on updated bookmars
chrome.bookmarks.onChanged.addListener((_id, _info) => {
    index_bookmarks()
})
