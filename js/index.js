// Used to shorten queryselectors and functions
const title = ".list-title";
const entry = ".list-entry";
const item = ".list-item";
const btnTitle = ".clear-btn-title";
const btnEntry = ".clear-btn-entry";
let todoList = new Map();

// 1. HELPER FUNCTIONS

// Function obtains text from given field (given title or entry)
const getText = (field) => document.querySelector(field).value;

// Function obtains length of field text
const textLen = (field) => document.querySelector(field).value.length;

// 2. CLEAR FUNCTIONS

// Function to clear field, given an entry or the title.
const clearField = (field) => {
    document.querySelector(field).value = '';
};

// Function to clear the title field.
const clearTitle = () => {
    clearField(title);
    // Clears the value of title in the map
    updateList("title", '');
};

// Function to clear field for entry. Runs after every entry.
const clearEntry = () => {
    clearField(entry);
};

// Function shows clear button to field when text is typed in
const toggleBtn = {
    // Shows button when the input field is typed into
    showBtn: function (field, btn) {
        document.querySelector(field).addEventListener('keyup', () => {
            // Check to see if there is any text in the field
            if (textLen(field) === 0) {
                document.querySelector(btn).style.display = "none";
            } else {
                document.querySelector(btn).style.display = "block";
            }
        });
        // What happens when the clear button is clicked
        document.querySelector(btn).addEventListener('click', () => {
            document.querySelector(btn).style.display = "none";
            document.querySelector(field).focus();
        });
        // Event listener for the delete button - shows on hover
    },
};

// Fixing problem of JS executing before DOM is finished loading. Elements that have to be loaded right away
window.onload = () => {
    init();
    toggleBtn.showBtn(title, btnTitle);
    toggleBtn.showBtn(entry, btnEntry);
    // Will insert only if enter is pressed and there is text inside the field
    document.querySelector(entry).addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && textLen(entry) > 0) {
            addEntry();
        }
    });
    // listener for the title field. When the field loses focus, updates mapping
    document.querySelector(title).addEventListener('blur', () => {
        if (textLen(title) > 0) {
            // If there is text in the field after leaving it, we update the title in map
            updateList("title", getText(title));
        }
    });
};

// 3. ADD FUNCTIONS

// Function takes text from entry field for notes, and adds it to the list. Checks to see if field is empty before. 
const addEntry = () => {
    // 1. Obtain the list entry from the entry field and then clear the field
    const listItem = getText(entry);
    clearEntry();
    // 2. Generate an ID for the entry. We will need this in order to delete this line or cross it off
    const itemId = Date.now() + Math.floor(Math.random() * 99);
    // 3. Insert list item below the entry field
    const listItemEntry = `
    <div class="entry-wrapper" id="${itemId}" role="list">
        <label class="checkbox">
            <input type="checkbox" class="checkbox" aria-label="Check item off list" onclick="crossEntry(${itemId})">
        </label>
        <input class="list-item" aria-label="Edit list item" value="${listItem}" onblur="checkEmpty(${itemId})">
        <button class="clear-btn" aria-label="Remove item off list" onclick="delEntry(${itemId})">x</button>
    </div>
    `;
    document.querySelector(".list-bottom").insertAdjacentHTML('beforebegin', listItemEntry);
    // Adds the item to the map
    updateList(itemId, [listItem, 0]);
};

// Function crosses off item in list when button is pressed
const crossEntry = (itemId) => {
    const item = document.getElementById(itemId).querySelector(".list-item");
    if (item.style.textDecorationLine === "line-through") {
        item.style.textDecorationLine = "none";
        // Gets the value array
        const state = todoList.get(itemId);
        // Changes the value from 1 (crossed out) to 0 (not crossed out)
        state[1] = 0;
        // Updates map and localStorage
        updateList(itemId, state);

    } else {
        item.style.textDecorationLine = "line-through";
        // Gets the value array
        const state = todoList.get(itemId);
        // Changes the value from 0 to 1
        state[1] = 1;
        // Updates map and localStorage
        updateList(itemId, state);
    }
};

// 4. DELETE FUNCTIONS

// Function deletes the item from the list 
const delEntry = (itemId) => {
    document.getElementById(itemId).remove();
    // Removes item from map and localStorage
    removeList(itemId);
};

// If an entry in the list is empty and user exits field, the item is deleted
const checkEmpty = (itemId) => {
    if (document.getElementById(itemId)) {
        const listEntry = document.getElementById(itemId).querySelector(item).value;
        const entryField = document.querySelector(entry);
        // Gets the value array
        const state = todoList.get(itemId);
        // Changes the value of the list entry
        state[0] = listEntry;
        // Updates map and localStorage
        updateList(itemId, state);
        if (listEntry == 0) {
            // If field is empty, it will also remove it from the map
            removeList(itemId);
            delEntry(itemId);
            entryField.focus();
        }
    }
};

// 5. STORAGE FUNCTIONS

// Initializes the map with general mappings for keys. Will be called from the window.onload to initialize as soon as the page is loaded
const init = () => {
    // If there is the map stored on localstorage, we get it.
    if (localStorage.getItem("todoList")) {
        // We convert the JSON to a map
        const list = convertJson(localStorage.getItem("todoList"));
        // We set todoList to the old list
        todoList = list;
        // We load the old list and update the fields
        generateList();
        // If the list can't be found, we init a new one
    } else {
        // If not, then initialize the map with a key for title.
        const titleKey = "title";
        todoList.set(titleKey, '');
    }
};

// Updates the todoList, triggers an update to localStorage. Whenever a new list element is added, the function will be called to add it to the map
const updateList = (key, update) => {
    todoList.set(key, update);
    updateLocalStorage();
};

// Removes item from todoList, triggers update to localStorage
const removeList = (key) => {
    todoList.delete(key);
    updateLocalStorage();
};

// Updates the localStorage todoList.
const updateLocalStorage = () => {
    // Check to see if there is localStorage. If none, alert user
    if (localStorage) {
        // Remove the old map from localstorage
        localStorage.removeItem("todoList");
        // Convert map to JSON
        const list = convertMap();
        // Add the updated list to localStorage
        localStorage.setItem("todoList", list);
    } else {
        console.log("Could not detect localStorage.");
    }
};

// Generates the list from the map, if init finds a map in localStorage
const generateList = () => {
    // 1. Get the title of the todo list from the map
    const titleValue = todoList.get("title");
    // 2. Insert the value into the input field:
    document.querySelector(title).value = titleValue;
    // See if the title field has any text. If so we display the clear button
    if (textLen(title) > 0) {
        document.querySelector(btnTitle).style.display = "block";
    }
    // 4. Create a copy of the map without the title field. Shallow copy is fine here
    const mapCopy = new Map(todoList);
    mapCopy.delete("title");
    // . Iterate through the map and add the old list items in
    mapCopy.forEach((listArray, itemId) => {
        // Add the item into the list
        const listItem = listArray[0];
        const crossStatus = listArray[1];
        const listItemEntry = `
        <div class="entry-wrapper" id="${itemId}" role="list">
            <label class="checkbox">
                <input type="checkbox" class="checkboxx" aria-label="Check item off list" onclick="crossEntry(${itemId})">
            </label>
            <input class="list-item" aria-label="Edit list item" value="${listItem}" onblur="checkEmpty(${itemId})">
            <button class="clear-btn" aria-label="Remove item off list" onclick="delEntry(${itemId})">x</button>
        </div>
        `;
        document.querySelector(".list-bottom").insertAdjacentHTML('beforebegin', listItemEntry);
        // We check if the list item is crossed off or not, and call the crossEntry() function based on value
        if (crossStatus === 1) {
            // We toggle the style for those to have the button on clicked style
            document.getElementById(itemId).querySelector(".checkbox").click();
        }
    });
};

// Functions to help convert from JSON to Map() and vice-versa. Used in init and updating

// Converts JSON to map
const convertJson = (jsonData) => new Map(JSON.parse(jsonData));


// Converts map to JSON
const convertMap = () => JSON.stringify([...todoList]);