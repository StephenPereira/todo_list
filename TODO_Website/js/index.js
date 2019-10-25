const list = ".todo_list";
const title = ".list_title";
const entry = ".list_entry";
const btn_title = ".clear_btn_title";
const btn_entry = ".clear_btn_entry"

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
};

// Function to clear field for entry. Runs after every entry.
const clearEntry = () => {
    clearField(entry);
};

// Function shows clear button to field when text is typed in
const toggleBtn = {
    // Shows button when the input field is typed into
    showBtn: function(field, btn) {
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

    // TODO: Add a function where it hides the button when the field is not in focus. Can use the DIV as a focus element
};

// Fixing problem of JS executing before DOM is finished loading
window.onload = () => {
    toggleBtn.showBtn(title, btn_title);
    toggleBtn.showBtn(entry, btn_entry);
    // Will insert only if enter is pressed and there is text inside the field
    document.querySelector(entry).addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && textLen(".list_entry") > 0) {
            addEntry();
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
        <input class="list_item" aria-label="Edit list item" value="${list_item}">
        <button class="clear_btn" aria-label="Remove item off list" onclick="delEntry(${item_id})">x</button>
    </div>
    `;
    document.querySelector(".todo_list").insertAdjacentHTML('beforeend', list_item_entry);
};
 
// Function deletes the item from the list 
const delEntry = (item_id) => {
    document.getElementById(item_id).remove();
};

// Function crosses off item in list when button is pressed
const crossEntry = (item_id) => {
    const item = document.getElementById(item_id).querySelector(".list_item");
    if(item.style.textDecorationLine === "line-through") {
        item.style.textDecorationLine = "none";
    } else {
        item.style.textDecorationLine = "line-through";  
    }
    console.log(item.style.textDecorationLine);
};