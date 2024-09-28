const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';
const selectedEditBook = [];
const UPDATED_EVENT = 'updated-book';


document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('bookForm');
    submitForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addBook();
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        searchBooks();
    });


    const searchResultsContainer = document.getElementById('searchResults');
    searchResultsContainer.style.display = 'none';

    const submitEditForm = document.getElementById('editBook');
    submitEditForm.addEventListener('submit', function(event) {
        event.preventDefault();
        handleEditSubmit();

        selectedEditBook.splice(0, selectedEditBook.length);
    });
    
    
    
    if(isStorageExist()) {
        loadDataFromStorage();
    }
})


function addBook() {
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = parseInt(document.getElementById('bookFormYear').value);
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    const generatedID = generateId();
    const bookObject = generatebookObject(generatedID, title, author, year, isComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}


function generateId() {
    return +new Date();
}

function generatebookObject(id, title, author, year, isComplete) {
    return {
        id: Number(id), // id as a number
        title: String(title), // title as a string
        author: String(author), // author as a string
        year: Number(year), // year as a number
        isComplete: Boolean(isComplete) // isCompleted as a boolean
    };
}

document.addEventListener(RENDER_EVENT, function() {
    const listUncompleted = document.getElementById('incompleteBookList');
    listUncompleted.innerHTML = '';
    const listCompleted = document.getElementById('completeBookList');
    listCompleted.innerHTML = '';

    for(const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if(bookItem.isComplete) {
            listCompleted.append(bookElement);
        } else {
            listUncompleted.append(bookElement);
        }
    }
});

function makeBook(bookObject) {
    const bookTitle = document.createElement('h3');
    bookTitle.innerText = bookObject.title;
    bookTitle.setAttribute('data-testid', 'bookItemTitle');

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = `Penulis: ${bookObject.author}`;
    bookAuthor.setAttribute('data-testid', 'bookItemAuthor');

    const bookYear = document.createElement('p');
    bookYear.innerText = `Tahun: ${bookObject.year}`;
    bookYear.setAttribute('data-testid', 'bookItemYear');

    const bookContainer = document.createElement('div');
    bookContainer.setAttribute('data-bookid', bookObject.id);
    bookContainer.setAttribute('data-testid', 'bookItemContainer');
    bookContainer.setAttribute('data-testid', 'bookItem');

    bookContainer.append(bookTitle, bookAuthor, bookYear);

    if (bookObject.isComplete) {
        const buttonContainer = document.createElement('div');
        const completeButton = document.createElement('button');
        completeButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
        completeButton.innerText = 'Belum selesai dibaca';
        completeButton.addEventListener('click', function() {
            uncompletedBook(bookObject.id);
        })

        const deleteButton = document.createElement('button');
        deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
        deleteButton.innerText = 'Hapus Buku';
        deleteButton.addEventListener('click', function() {
            removeBook(bookObject.id);
        })

        const editButton = document.createElement('button');
        editButton.setAttribute('data-testid', 'bookItemEditButton');
        editButton.innerText = 'Edit Buku';
        editButton.addEventListener('click', function() {
            editBook(bookObject.id);
        })

        buttonContainer.append(completeButton, deleteButton, editButton);
        bookContainer.append(buttonContainer);
    } else {
        const buttonContainer = document.createElement('div');
        const completeButton = document.createElement('button');
        completeButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
        completeButton.innerText = 'Selesai dibaca';
        completeButton.addEventListener('click', function() {
            completeBook(bookObject.id);
        })

        const deleteButton = document.createElement('button');
        deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
        deleteButton.innerText = 'Hapus Buku';
        deleteButton.addEventListener('click', function() {
            removeBook(bookObject.id);
        })

        const editButton = document.createElement('button');
        editButton.setAttribute('data-testid', 'bookItemEditButton');
        editButton.innerText = 'Edit Buku';
        editButton.addEventListener('click', function() {
            editBook(bookObject.id);
        })

        buttonContainer.append(completeButton, deleteButton, editButton);
        bookContainer.append(buttonContainer);
    }

    return bookContainer;
}

function completeBook(bookId) {
    const bookIndex = findBookIndex(bookId);
    if (bookIndex == null) return;
    bookIndex.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

function uncompletedBook(bookId) {
    const bookIndex = findBookIndex(bookId);

    if (bookIndex == null) return;
    bookIndex.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}


function removeBook(bookId) {
    const bookIndex = findBookIndex(bookId);
    if (bookIndex == -1) return;
    books.splice(bookIndex, 1);

    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

function findBookIndex(bookId) {
    for (let index = 0; index < books.length; index++) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    
    return -1;
}


function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() {
    if(typeof(Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function() {
    console.log(localStorage.getItem(STORAGE_KEY));
    showToast('Data Disimpan!');
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if(data !== null) {
        for (const book of data) {
           books.push(book); 
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}


function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.className = 'toast show';

    setTimeout(function() {
        toast.className = toast.className.replace('show', '');
    }, 3000);
}


function searchBooks() {
    const searchQuery = document.getElementById('searchBookTitle').value.toLowerCase();

    if (searchQuery === '') {
        const searchResultsContainer = document.getElementById('searchResults');
        searchResultsContainer.style.display = 'none';

        const uncompletedBookList = document.getElementById('incompleteBookList');
        const completeBookList = document.getElementById('completeBookList');

        uncompletedBookList.style.display = 'block';
        completeBookList.style.display = 'block';
        return;
    }

    const searchResults = books.filter(book => book.title.toLowerCase().includes(searchQuery));

    displaySearchResults(searchResults);
    
}


function displaySearchResults(results) {
    const searchResultsContainer = document.getElementById('searchResults');
    const resultsList = document.getElementById('resultBookshelf')
    resultsList.innerHTML = '';
    const searchResultCount = document.getElementById('searchResultCount');
    searchResultCount.innerText = results.length;
    
    if (results.length === 0) {
        const searchBookTitle = document.getElementById('searchBookTitle').value;
        searchBookTitle.value = ''; 
        searchResultsContainer.style.display = 'none';

        const uncompletedBookList = document.getElementById('incompleteBookList');
        const completeBookList = document.getElementById('completeBookList');

        uncompletedBookList.style.display = 'block';
        completeBookList.style.display = 'block';

        showModal('Buku tidak ditemukan!');

        return


    } else {
        results.forEach(book => {
            const bookElement = makeBook(book);
            resultsList.appendChild(bookElement);
        });
        
        const uncompletedBookList = document.getElementById('incompleteBookList');
        const completeBookList = document.getElementById('completeBookList');

        uncompletedBookList.style.display = 'none';
        completeBookList.style.display = 'none';
    }

    searchResultsContainer.style.display = 'block';
}


function showModal(message) {
    const modal = document.getElementById('myModal');
    const modalMessage = document.getElementById('modalContent');
    const backdrop = document.getElementById('backdrop');

    modalMessage.innerText = message;
    modal.style.display = 'block';
    backdrop.style.display = 'block';
}


function closeModal() {
    const modal = document.getElementById('myModal');
    const backdrop = document.getElementById('backdrop');

    modal.style.display = 'none';
    backdrop.style.display = 'none';
}


function closeModal() {
    const modal = document.getElementById('myModal');
    const backdrop = document.getElementById('backdrop');

    modal.style.display = 'none';
    backdrop.style.display = 'none';
}


function closeModalEdit() {
    const editModal = document.getElementById('editModal');
    const backdrop2 = document.getElementById('backdrop2');

    backdrop2.style.display = 'none';
    editModal.style.display = 'none';
}


function editBook(bookId) {
    const bookIndex = findBookIndex(bookId);

    console.log(bookIndex);

    if (bookIndex == null) return;

    selectedEditBook.push(bookIndex);

    const titleInput = document.getElementById('editBookTitle');
    const authorInput = document.getElementById('editBookAuthor');
    const yearInput = document.getElementById('editBookYear');

    titleInput.value = bookIndex.title;
    authorInput.value = bookIndex.author;
    yearInput.value = bookIndex.year;

    const modal = document.getElementById('editModal');
    const backdrop2 = document.getElementById('backdrop2');
    modal.style.display = 'block';
    backdrop2.style.display = 'block';
}


function handleEditSubmit() {
    const getBookId = selectedEditBook[0].id;

    console.log(getBookId);

    const titleInput = document.getElementById('editBookTitle').value;
    const authorInput = document.getElementById('editBookAuthor').value;
    const yearInput = parseInt(document.getElementById('editBookYear').value);

    const bookIndex = findBookIndex(getBookId);
    bookIndex.id = getBookId;
    bookIndex.title = titleInput;
    bookIndex.author = authorInput;
    bookIndex.year = parseInt(yearInput);

    if (bookIndex === null) return;

    selectedEditBook.splice(0, selectedEditBook.length);
    document.dispatchEvent(new Event(RENDER_EVENT));
    updateBookData();
    closeModalEdit();

}

function updateBookData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(UPDATED_EVENT));
    }
}

document.addEventListener(UPDATED_EVENT, function() {
    let messageModal = 'Buku Berhasil diupdate!';
    showModal(messageModal);
});


function findBookIndex(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }

    return null;
}




