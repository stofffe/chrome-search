// Parse bookmarks from tree
let all_bookmarks = new Array()
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
chrome.bookmarks.getTree((tree) => {
    parse_bookmark_tree(tree[0])
    console.log(all_bookmarks)
})
chrome.bookmarks.onChanged.addListener((_id, _info) => {
    chrome.bookmarks.getTree((tree) => {
        parse_bookmark_tree(tree[0])
        console.log(all_bookmarks)
    })
})

// Filter bookmarks and send back
chrome.runtime.onMessage.addListener(function(obj, sender, response) {
    let query = obj.query

    let bookmarks = all_bookmarks.filter(b => {
        return b.name.toLowerCase().includes(query.toLowerCase())
    })

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
