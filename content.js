// Css
let style = new CSSStyleSheet()
style.insertRule(`
    #search-container {
        position: fixed;
        top: 4vh;
        width: 80vw;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999999999999999;
    }
`)
style.insertRule(`
    #search-input {
        color: black;
        font-size: 1em;
        background-color: white;
        width: 100%;
        padding: 10px;
        border-color: black;
        border: 1px solid #000000;
        border-radius: 10px;
    }
`)
style.insertRule(`
    #search-results {
        color: black;
        font-size: 1em;
        background-color: white;
        width: 100%;
        border-color: black;
        border: 1px solid #000000;
        border-radius: 10px;
        padding: 10px;
    }
`)
style.insertRule(`
    #search-result {
        padding: 10px;
    }
`)
style.insertRule(`
    #search-result[active] {
        padding: 10px;
        background-color: lightgray;
        border-radius: 5px;
    }
`)

// Shadow
let shadow_container = document.createElement("div")
let shadow = shadow_container.attachShadow({ mode: "open" })
shadow.adoptedStyleSheets = [style]

// Search input
let search_input = document.createElement("input")
search_input.type = "text"
search_input.id = "search-input"
search_input.addEventListener("focusout", () => {
    search_container.hidden = true
})

// Search results
let search_results = document.createElement("div")
search_results.id = "search-results"
let focused_element = 0

// Search container
let search_container = document.createElement("div")
search_container.id = "search-container"
search_container.hidden = true
search_container.appendChild(search_input)
search_container.appendChild(search_results)

shadow.appendChild(search_container)
document.body.appendChild(shadow_container)

// Constants
const BOOKMARK = "bookmark";
const HISTORY = "history"
const NONE = ""

// Global variables
let global_results = []
let global_source = NONE

// Filter and render results
function filter_bookmarks(query, source) {
    chrome.runtime.sendMessage(
        {
            query: query,
            source: source,
        },
        function(response) {
            focused_element = 0
            global_results = response.results
            render_results()
        }
    );
}
function render_results() {
    search_results.innerHTML = ""
    global_results.forEach((b, i) => {
        let result = document.createElement("div")
        result.id = "search-result"
        result.textContent = b.name
        if (focused_element === i) {
            result.setAttribute("active", "true")
        }
        search_results.appendChild(result)
    })
    search_results.hidden = global_results.length == 0
}


// Open search listener
document.addEventListener("keydown", (e) => {
    if (!search_container.hidden) {
        e.stopPropagation()
        e.stopImmediatePropagation()
    }

    if (e.key === "b" && e.ctrlKey && search_container.hidden) {
        global_source = BOOKMARK
        search_container.hidden = false
        search_input.focus()
        e.preventDefault()
    }

    if (e.key === "h" && e.ctrlKey && search_container.hidden) {
        global_source = HISTORY
        search_container.hidden = false
        search_input.focus()
        e.preventDefault()
    }
})

// Input handling
search_input.addEventListener("keydown", (e) => {
    e.stopPropagation()
    e.stopImmediatePropagation()

    // Scroll through results
    let down = (e.key === "Tab" && !e.shiftKey) || (e.key === "j" && e.ctrlKey)
    let up = (e.key === "Tab" && e.shiftKey) || (e.key === "k" && e.ctrlKey)
    let scroll = down || up
    if (scroll && !search_container.hidden) {
        if (down) {
            focused_element += 1
        } else {
            focused_element += global_results.length
            focused_element -= 1
        }
        focused_element %= global_results.length
        render_results()
        e.preventDefault()
    }

    // Choose result
    if (e.key === "Enter") {
        let result = global_results[focused_element]
        window.location.href = result.url
    }

    // Quit search
    if (e.key === "Escape") {
        document.activeElement.blur();
    }
})

search_input.addEventListener("keyup", (e) => {
    e.stopPropagation()
    e.stopImmediatePropagation()

    if (
        e.key === "Control" ||
        e.key === "Shift" ||
        e.key === "Tab" ||
        e.key === "Enter" ||
        (e.key === "Tab" && e.shiftKey) ||
        (e.key === "j" && e.ctrlKey) ||
        (e.key === "k" && e.ctrlKey)
    ) {
        return
    }

    // Filter results
    filter_bookmarks(e.target.value, global_source)
})

search_input.addEventListener("keypress", (e) => {
    e.stopPropagation()
    e.stopImmediatePropagation()
})

// Initally filter with empty string
filter_bookmarks("", "")
