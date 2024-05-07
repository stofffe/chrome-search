let history_list = new Array()
let history_fuse = null

function parse_history(history) {
    history_list = history.map(a => {
        return {
            name: a.title,
            url: a.url,
        }
    })
}

function index_history() {
    chrome.history.search(
        { text: "" },
        function(results) {
            history_list = new Array()
            parse_history(results)
            history_fuse = new Fuse(history_list, {
                keys: ["name", "url"],
                includeScore: true,
            })
        }
    )
}

index_history()
