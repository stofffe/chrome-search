// Index bookmarks from tree
let bookmark_list = new Array()
let bookmark_fuse = null

function parse_bookmarks(tree) {
    let children = tree.children
    if (children) {
        children.forEach((e) => {
            parse_bookmarks(e)
        })
    } else {
        bookmark_list.push({
            name: tree.title,
            url: tree.url,
        })
    }
}
function index_bookmarks() {
    chrome.bookmarks.getTree((tree) => {
        bookmark_list = new Array()
        parse_bookmarks(tree[0])
        bookmark_fuse = new Fuse(bookmark_list, {
            keys: ["name"],
            includeScore: true,
        })
    })
}

// Inital parse
index_bookmarks()

// Parse on updated bookmars
chrome.bookmarks.onChanged.addListener((_id, _info) => {
    index_bookmarks()
})
chrome.bookmarks.onChildrenReordered.addListener((_id, _info) => {
    index_bookmarks()
})
chrome.bookmarks.onCreated.addListener((_id, _info) => {
    index_bookmarks()
})
chrome.bookmarks.onMoved.addListener((_id, _info) => {
    index_bookmarks()
})
chrome.bookmarks.onRemoved.addListener((_id, _info) => {
    index_bookmarks()
})

