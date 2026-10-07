// =====================================================
// LIBRARYHUB FRONTEND
// =====================================================

const API = "http://127.0.0.1:5000";


// =====================================================
// SECURITY HELPER
// =====================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// DASHBOARD
// =====================================================

async function loadDashboard() {

    try {

        const response =
            await fetch(`${API}/api/dashboard`);

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Dashboard loading failed"
            );
        }

        document.getElementById("totalBooks").textContent =
            data.total_books;

        document.getElementById("availableBooks").textContent =
            data.available_books;

        document.getElementById("issuedBooks").textContent =
            data.issued_books;

        document.getElementById("totalMembers").textContent =
            data.total_members;

    }

    catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );

    }
}


// =====================================================
// BOOKS
// =====================================================

async function loadBooks() {

    try {

        const response =
            await fetch(`${API}/api/books`);

        const books =
            await response.json();

        if (!response.ok) {
            throw new Error(
                books.error || "Could not load books"
            );
        }

        displayBooks(books);

    }

    catch (error) {

        console.error(
            "Book Error:",
            error
        );

        document.getElementById(
            "bookTableBody"
        ).innerHTML = `

            <tr>

                <td colspan="7">

                    Unable to connect to the
                    library server.

                </td>

            </tr>

        `;
    }
}


// =====================================================
// DISPLAY BOOKS
// =====================================================

function displayBooks(books) {

    const tableBody =
        document.getElementById(
            "bookTableBody"
        );

    tableBody.innerHTML = "";


    if (books.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="7">

                    No books found in the library.

                </td>

            </tr>

        `;

        return;
    }


    books.forEach(book => {

        const row =
            document.createElement("tr");


        let statusHTML;

        let actionHTML;


        if (book.available === 1) {

            statusHTML = `

                <span class="status available">

                    Available

                </span>

            `;


            actionHTML = `

                <button
                    class="primary-btn"
                    onclick="issueBookPrompt(${book.id})"
                >
                    Issue
                </button>

            `;

        }

        else {

            statusHTML = `

                <span class="status issued">

                    Issued

                </span>

            `;


            actionHTML = `

                <button
                    class="primary-btn"
                    onclick="returnBook(${book.id})"
                >
                    Return
                </button>

            `;
        }


        row.innerHTML = `

            <td>
                ${escapeHtml(book.id)}
            </td>

            <td>
                <strong>
                    ${escapeHtml(book.title)}
                </strong>
            </td>

            <td>
                ${escapeHtml(book.author)}
            </td>

            <td>
                ${escapeHtml(book.isbn)}
            </td>

            <td>
                ${escapeHtml(book.category)}
            </td>

            <td>
                ${statusHTML}
            </td>

            <td>

                ${actionHTML}

                <button
                    class="secondary-btn"
                    onclick="deleteBook(${book.id})"
                >
                    Delete
                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });
}


// =====================================================
// ADD BOOK
// =====================================================

document
    .getElementById("bookForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const title =
                document
                    .getElementById("title")
                    .value
                    .trim();


            const author =
                document
                    .getElementById("author")
                    .value
                    .trim();


            const isbn =
                document
                    .getElementById("isbn")
                    .value
                    .trim();


            const category =
                document
                    .getElementById("category")
                    .value
                    .trim();


            try {

                const response =
                    await fetch(
                        `${API}/api/books`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    title,
                                    author,
                                    isbn,
                                    category
                                })

                        }
                    );


                const data =
                    await response.json();


                alert(
                    data.message ||
                    data.error
                );


                if (response.ok) {

                    this.reset();

                    await loadBooks();

                    await loadDashboard();

                }

            }

            catch (error) {

                alert(
                    "Cannot connect to the backend. " +
                    "Please make sure Flask is running."
                );

                console.error(error);

            }

        }
    );


// =====================================================
// SEARCH BOOKS
// =====================================================

async function searchBooks() {

    const query =
        document
            .getElementById("searchInput")
            .value
            .trim();


    try {

        const response =
            await fetch(
                `${API}/api/books/search?q=${encodeURIComponent(query)}`
            );


        const books =
            await response.json();


        if (!response.ok) {

            throw new Error(
                books.error ||
                "Search failed"
            );

        }


        displayBooks(books);

    }

    catch (error) {

        alert(
            "Search failed."
        );

        console.error(error);

    }
}


// =====================================================
// DELETE BOOK
// =====================================================

async function deleteBook(id) {

    const confirmation =
        confirm(
            "Are you sure you want to delete this book?"
        );


    if (!confirmation) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API}/api/books/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        alert(
            data.message ||
            data.error
        );


        if (response.ok) {

            await loadBooks();

            await loadDashboard();

        }

    }

    catch (error) {

        alert(
            "Cannot connect to the backend."
        );

        console.error(error);

    }
}


// =====================================================
// MEMBERS
// =====================================================

async function loadMembers() {

    try {

        const response =
            await fetch(
                `${API}/api/members`
            );


        const members =
            await response.json();


        if (!response.ok) {

            throw new Error(
                members.error ||
                "Could not load members"
            );

        }


        const tableBody =
            document.getElementById(
                "memberTableBody"
            );


        tableBody.innerHTML = "";


        if (members.length === 0) {

            tableBody.innerHTML = `

                <tr>

                    <td colspan="5">

                        No members registered yet.

                    </td>

                </tr>

            `;

            return;
        }


        members.forEach(member => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHtml(member.id)}
                </td>

                <td>
                    <strong>
                        ${escapeHtml(member.name)}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(member.email)}
                </td>

                <td>
                    ${escapeHtml(member.phone)}
                </td>

                <td>

                    <button
                        class="secondary-btn"
                        onclick="deleteMember(${member.id})"
                    >
                        Delete
                    </button>

                </td>

            `;


            tableBody.appendChild(row);

        });

    }

    catch (error) {

        console.error(
            "Member Error:",
            error
        );

    }
}


// =====================================================
// ADD MEMBER
// =====================================================

document
    .getElementById("memberForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("memberName")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("memberEmail")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("memberPhone")
                    .value
                    .trim();


            try {

                const response =
                    await fetch(
                        `${API}/api/members`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    name,
                                    email,
                                    phone
                                })

                        }
                    );


                const data =
                    await response.json();


                alert(
                    data.message ||
                    data.error
                );


                if (response.ok) {

                    this.reset();

                    await loadMembers();

                    await loadDashboard();

                }

            }

            catch (error) {

                alert(
                    "Cannot connect to the backend."
                );

                console.error(error);

            }

        }
    );


// =====================================================
// DELETE MEMBER
// =====================================================

async function deleteMember(id) {

    const confirmation =
        confirm(
            "Are you sure you want to delete this member?"
        );


    if (!confirmation) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API}/api/members/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        alert(
            data.message ||
            data.error
        );


        if (response.ok) {

            await loadMembers();

            await loadDashboard();

        }

    }

    catch (error) {

        alert(
            "Cannot connect to the backend."
        );

        console.error(error);

    }
}


// =====================================================
// ISSUE BOOK
// =====================================================

async function issueBook(
    bookId,
    memberId
) {

    try {

        const response =
            await fetch(
                `${API}/api/books/${bookId}/issue`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            member_id:
                                Number(memberId)
                        })

                }
            );


        const data =
            await response.json();


        alert(
            data.message ||
            data.error
        );


        if (response.ok) {

            await loadBooks();

            await loadDashboard();

            return true;
        }

    }

    catch (error) {

        alert(
            "Cannot connect to the backend."
        );

        console.error(error);

    }


    return false;
}


// =====================================================
// ISSUE FROM TABLE
// =====================================================

async function issueBookPrompt(bookId) {

    const memberId =
        prompt(
            "Enter the Member ID:"
        );


    if (!memberId) {
        return;
    }


    if (!/^\d+$/.test(memberId)) {

        alert(
            "Please enter a valid Member ID."
        );

        return;
    }


    await issueBook(
        bookId,
        memberId
    );
}


// =====================================================
// RETURN BOOK
// =====================================================

async function returnBook(bookId) {

    try {

        const response =
            await fetch(
                `${API}/api/books/${bookId}/return`,
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        alert(
            data.message ||
            data.error
        );


        if (response.ok) {

            await loadBooks();

            await loadDashboard();

        }

    }

    catch (error) {

        alert(
            "Cannot connect to the backend."
        );

        console.error(error);

    }
}


// =====================================================
// ISSUE FORM
// =====================================================

document
    .getElementById("issueForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const bookId =
                document
                    .getElementById("issueBookId")
                    .value
                    .trim();


            const memberId =
                document
                    .getElementById("issueMemberId")
                    .value
                    .trim();


            if (!bookId || !memberId) {
                return;
            }


            const success =
                await issueBook(
                    bookId,
                    memberId
                );


            if (success) {

                this.reset();

            }

        }
    );


// =====================================================
// RETURN FORM
// =====================================================

document
    .getElementById("returnForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const bookId =
                document
                    .getElementById("returnBookId")
                    .value
                    .trim();


            if (!bookId) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `${API}/api/books/${bookId}/return`,
                        {
                            method: "POST"
                        }
                    );


                const data =
                    await response.json();


                alert(
                    data.message ||
                    data.error
                );


                if (response.ok) {

                    this.reset();

                    await loadBooks();

                    await loadDashboard();

                }

            }

            catch (error) {

                alert(
                    "Cannot connect to the backend."
                );

                console.error(error);

            }

        }
    );


// =====================================================
// INITIAL LOAD
// =====================================================

loadDashboard();

loadBooks();

loadMembers();