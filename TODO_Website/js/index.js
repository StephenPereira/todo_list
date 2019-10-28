const list = ".todo_list";
const title = ".list_title";
const entry = ".list_entry";
const item = ".list_item";
const btn_title = ".clear_btn_title";
const btn_entry = ".clear_btn_entry";
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

    // TODO: Add a function where it hides the button when the field is not in focus.
};

// Fixing problem of JS executing before DOM is finished loading. Elements that have to be loaded right away
window.onload = () => {
    init();
    toggleBtn.showBtn(title, btn_title);
    toggleBtn.showBtn(entry, btn_entry);
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
    const list_item = getText(entry);
    clearEntry();
    // 2. Generate an ID for the entry. We will need this in order to delete this line or cross it off
    const item_id = Date.now() + Math.floor(Math.random() * 99);
    // 3. Insert list item below the entry field
    const list_item_entry = `
    <div class="entry_wrapper" id="${item_id}" role="list">
        <label class="checkbox">
            <input type="checkbox" class="checkbox" aria-label="Check item off list" onclick="crossEntry(${item_id})">
        </label>
        <input class="list_item" aria-label="Edit list item" value="${list_item}" onblur="checkEmpty(${item_id})">
        <button class="clear_btn" aria-label="Remove item off list" onclick="delEntry(${item_id})">x</button>
    </div>
    `;
    document.querySelector(".todo_list").insertAdjacentHTML('beforeend', list_item_entry);
    // Adds the item to the map
    updateList(item_id, [list_item, 0]);
};

// Function crosses off item in list when button is pressed
const crossEntry = (item_id) => {
    const item = document.getElementById(item_id).querySelector(".list_item");
    if (item.style.textDecorationLine === "line-through") {
        item.style.textDecorationLine = "none";
        // Gets the value array
        const state = todoList.get(item_id)
        // Changes the value from 1 (crossed out) to 0 (not crossed out)
        state[1] = 0;
        // Updates map and localStorage
        updateList(item_id, state);

    } else {
        item.style.textDecorationLine = "line-through";
        // Gets the value array
        const state = todoList.get(item_id)
        // Changes the value from 0 to 1
        state[1] = 1;
        // Updates map and localStorage
        updateList(item_id, state);
    }
};

// 4. DELETE FUNCTIONS

// Function deletes the item from the list 
const delEntry = (item_id) => {
    document.getElementById(item_id).remove();
    // Removes item from map and localStorage
    removeList(item_id);
};

// If an entry in the list is empty and user exits field, the item is deleted
const checkEmpty = (item_id) => {
    if (document.getElementById(item_id)) {
        const listEntry = document.getElementById(item_id).querySelector(item).value;
        const entryField = document.querySelector(entry);
        // Gets the value array
        const state = todoList.get(item_id)
        // Changes the value of the list entry
        state[0] = listEntry;
        // Updates map and localStorage
        updateList(item_id, state);
        if (listEntry == 0) {
            // If field is empty, it will also remove it from the map
            removeList(item_id);
            delEntry(item_id);
            entryField.focus();
        }
    }
};

// 5. STORAGE FUNCTIONS
// In order to be able to store the list, we will need to store everything in a key system. Every time a field is left, it should trigger a function
// to update the key item. We will need the title, item ids, item text and state of list item (if it is crossed off or not). All of this will be stored in
// the key object. All the elements already have listeners or onclicks, we can use these to trigger updates. We should also update the local storage when
// things are updated. When the browser is closed and opened, we need to read the local storage and use functions to add all the data back in. The title
// won't require a loop, but the list items will. We loop through and use functions above to insert the data and also cross off items that were previously
// crossed off.


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
        const title_key = "title"; 
        todoList.set(title_key, '');
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
    // Convert map to json data in preperation of sending to localStorage
    const jsonTODO = convertMap(todoList);
    // Check to see if there is localStorage. If none, alert user
    if (localStorage) {
        // Remove the old map from localstorage
        localStorage.removeItem("todoList");
        // Convert map to JSON
        const list = convertMap();
        // Add the updated list to localStorage
        localStorage.setItem("todoList", list);
    } else {
        console.log("Could not detect localStorage.")
    }
};

// Generates the list from the map, if init finds a map in localStorage
const generateList = () => {
    // 1. Get the title of the todo list from the map
    const title_value = todoList.get("title");
    // 2. Insert the value into the input field:
    document.querySelector(".list_title").value = title_value;
    // See if the title field has any text. If so we display the clear button
    if (textLen(title) > 0) {
        document.querySelector(btn_title).style.display = "block";
    }
    // 4. Create a copy of the map without the title field. Shallow copy is fine here
    const map_copy = new Map(todoList);
    map_copy.delete("title");
    // . Iterate through the map and add the old list items in
    map_copy.forEach((list_arr, item_id) => {
        // Add the item into the list
        const list_item = list_arr[0];
        const cross_status = list_arr[1];
        const list_item_entry = `
        <div class="entry_wrapper" id="${item_id}" role="list">
            <label class="checkbox">
                <input type="checkbox" class="checkboxx" aria-label="Check item off list" onclick="crossEntry(${item_id})">
            </label>
            <input class="list_item" aria-label="Edit list item" value="${list_item}" onblur="checkEmpty(${item_id})">
            <button class="clear_btn" aria-label="Remove item off list" onclick="delEntry(${item_id})">x</button>
        </div>
        `;
        document.querySelector(".todo_list").insertAdjacentHTML('beforeend', list_item_entry);
        // We check if the list item is crossed off or not, and call the crossEntry() function based on value
        if (cross_status === 1) {
            // We toggle the style for those to have the button on clicked style
            document.getElementById(item_id).querySelector(".checkbox").click();
        }
    });
};

// Functions to help convert from JSON to Map() and vice-versa

// Converts JSON to map
function convertJson(jsonData) {
    return new Map(JSON.parse(jsonData));
};

// Converts map to JSON
function convertMap() {
    return JSON.stringify([...todoList]);
};