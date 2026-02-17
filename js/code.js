const urlBase = '/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";


function showSignup()
{
    document.getElementById("loginDiv").style.display = "none";
    document.getElementById("signupDiv").style.display = "block";
    document.getElementById("signupResult").innerHTML = "";

    let result = document.getElementById("signupResult");
    result.innerHTML = "";
    result.classList.remove("success", "error");
}

function showLogin()
{
    document.getElementById("loginDiv").style.display = "block";
    document.getElementById("signupDiv").style.display = "none";
    document.getElementById("loginResult").innerHTML = "";
}

function doSignup() {
    const fields = ["FirstName", "LastName", "Username", "Password"];
    
    fields.forEach(f => {
        document.getElementById("ast" + f).innerHTML = "";
        document.getElementById("lbl" + f).style.color = "white"; 
    });

    let newFirstName = document.getElementById("signupFirstName").value.trim();
    let newLastName = document.getElementById("signupLastName").value.trim();
    let newUsername = document.getElementById("signupUsername").value.trim();
    let newPassword = document.getElementById("signupPassword").value.trim();

    let missing = false;

    if (!newFirstName) { markInvalid("FirstName"); missing = true; }
    if (!newLastName) { markInvalid("LastName"); missing = true; }
    if (!newUsername) { markInvalid("Username"); missing = true; }
    if (!newPassword) { markInvalid("Password"); missing = true; }

    let result = document.getElementById("signupResult");

    if (missing) {
        result.classList.remove("success");
        result.classList.add("error");
        result.innerHTML = "Fields marked with * are required!";
        return;
    }

    let hash = md5(newPassword);
    let tmp = {
        firstName: newFirstName,
        lastName: newLastName,
        login: newUsername,
        password: hash
    };
    
    let url = urlBase + '/Signup.' + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error && jsonObject.error !== "") {
                    result.classList.remove("success");
                    result.classList.add("error");
                    result.innerHTML = jsonObject.error;
                    return;
                }

                result.classList.remove("error");
                result.classList.add("success");
                result.innerHTML = "Account created! Please login.";

                document.getElementById("signupFirstName").value = "";
                document.getElementById("signupLastName").value = "";
                document.getElementById("signupUsername").value = "";
                document.getElementById("signupPassword").value = "";

                setTimeout(showLogin, 2000);
            }
        };
        xhr.send(JSON.stringify(tmp));
    } catch(err) {
        result.innerHTML = err.message;
    }
}

function markInvalid(fieldName) {
    document.getElementById("lbl" + fieldName).style.color = "red";
    document.getElementById("ast" + fieldName).innerHTML = " *";
    document.getElementById("ast" + fieldName).style.color = "red";
}


function doLogin()
{
    userId = 0;
    firstName = "";
    lastName = "";
    
    // reset styles before checking
    document.getElementById("astLoginName").innerHTML = "";
    document.getElementById("astLoginPassword").innerHTML = "";

    let login = document.getElementById("loginName").value.trim();
    let password = document.getElementById("loginPassword").value.trim();
    
    let missing = false;
    if (login === "") {
        document.getElementById("lblLoginName").style.color = "red";
        document.getElementById("astLoginName").innerHTML = " *";
        document.getElementById("astLoginName").style.color = "red";
        missing = true;
    }
    if (password === "") {
        document.getElementById("lblLoginPassword").style.color = "red";
        document.getElementById("astLoginPassword").innerHTML = " *";
        document.getElementById("astLoginPassword").style.color = "red";
        missing = true;
    }

    if (missing) {
        document.getElementById("inner-title-login").style.color = "red";
        document.getElementById("loginResult").innerHTML = "Fields marked with * are required!";
        document.getElementById("loginResult").style.color = "red";
        return; 
    }
    let hash = md5(password);
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "contacts.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
//		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function addContact() {
    let first = document.getElementById("contactFirstName");
    let last = document.getElementById("contactLastName");
    let phone = document.getElementById("contactPhone");
    let email = document.getElementById("contactEmail");
    let result = document.getElementById("addContactResult");

    // reset everything to normal state
    [first, last, phone, email].forEach(el => el.classList.remove("input-error"));
    result.innerText = "";

    //  check for each field
    let missing = false;
    if (first.value.trim() === "") { first.classList.add("input-error"); missing = true; }
    if (last.value.trim() === "") { last.classList.add("input-error"); missing = true; }
    if (phone.value.trim() === "") { phone.classList.add("input-error"); missing = true; }
    if (email.value.trim() === "") { email.classList.add("input-error"); missing = true; }

    if (missing) {
        result.innerText = "Fields marked * are required!";
        result.style.color = "#fc100d";
        return;
    }

    let payload = {
        userId: userId,
        firstName: first.value.trim(),
        lastName: last.value.trim(),
        phone: phone.value.trim(),
        email: email.value.trim()
    };

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/LAMPAPI/AddContact.php", true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onload = function() {
        let resp = JSON.parse(xhr.responseText);
        if(resp.error) {
            document.getElementById("addContactResult").className = "error";
            document.getElementById("addContactResult").innerText = resp.error;
            
        } else {
            document.getElementById("addContactResult").className = "success";
            document.getElementById("addContactResult").innerText = "Contact added!";
            loadContacts(); // refresh list
        }
    };
    xhr.send(JSON.stringify(payload));
}

function loadContacts() {
    if (userId < 1) readCookie();

    let searchInput = document.getElementById("searchText");
    let searchValue = searchInput ? searchInput.value : "";

    let payload = {
        userId: userId,
        search: searchValue
    };

    let xhr = new XMLHttpRequest();
    xhr.open("POST", urlBase + "/SearchContacts." + extension, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onload = function() {
        if (this.status == 200) {
            let jsonObject = JSON.parse(this.responseText);
            let tableBody = document.getElementById("contactList");
            tableBody.innerHTML = ""; // clear existing rows

            if (jsonObject.results && jsonObject.results.length > 0) {
                jsonObject.results.forEach(contact => {
                    let row = tableBody.insertRow();
                    
                    // save the contact info into the rows "dataset"
                    // so we can grab it easily when the user clicks edit
                    row.id = `row-${contact.ID}`;
                    row.dataset.first = contact.firstName;
                    row.dataset.last  = contact.lastName;
                    row.dataset.phone = contact.Phone;
                    row.dataset.email = contact.Email;

                    row.innerHTML = `
                        <td>${contact.firstName} ${contact.lastName}</td>
                        <td>${contact.Phone}</td>
                        <td>${contact.Email}</td>
                        <td>
                            <button class="edit-btn" onclick="editContact(${contact.ID})">Edit</button>
                            <button class="delete-btn" onclick="deleteContactByID(${contact.ID})">Delete</button>
                        </td>
                    `;
                });
            } else {
                tableBody.innerHTML = "<tr><td colspan='4' id='no-contacts-msg'>No contacts found.</td></tr>";
            }
        }
    };
    xhr.send(JSON.stringify(payload));
}

function editContact(id) {
    let row = document.getElementById(`row-${id}`);
    
    let first = row.dataset.first;
    let last  = row.dataset.last;
    let phone = row.dataset.phone;
    let email = row.dataset.email;

    row.innerHTML = `
        <td>
            <input type="text" id="edit-first-${id}" value="${first}" placeholder="First" style="width:40%;" aria-label="Edit First Name">
            <input type="text" id="edit-last-${id}" value="${last}" placeholder="Last" style="width:40%;" aria-label="Edit Last Name">
        </td>
        <td>
            <input type="text" id="edit-phone-${id}" value="${phone}" style="width:90%;" aria-label="Edit Phone">
        </td>
        <td>
            <input type="text" id="edit-email-${id}" value="${email}" style="width:90%;" aria-label="Edit Email">
        </td>
        <td>
            <button class="save-btn" onclick="updateContact(${id})">Save</button>
            <button class="cancel-btn" onclick="loadContacts()">Cancel</button>
            <div id="edit-error-${id}" class="error" style="font-size:12px; margin-top:5px;"></div>
        </td>
    `;
}

function updateContact(id) {
    let newFirst = document.getElementById(`edit-first-${id}`);
    let newLast  = document.getElementById(`edit-last-${id}`);
    let newPhone = document.getElementById(`edit-phone-${id}`);
    let newEmail = document.getElementById(`edit-email-${id}`);
    let errorSpan = document.getElementById(`edit-error-${id}`);

    [newFirst, newLast, newPhone, newEmail].forEach(el => el.classList.remove("input-error"));
    errorSpan.innerText = "";

    let missing = false;
    if (newFirst.value.trim() === "") { newFirst.classList.add("input-error"); missing = true; }
    if (newLast.value.trim() === "") { newLast.classList.add("input-error"); missing = true; }
    if (newPhone.value.trim() === "") { newPhone.classList.add("input-error"); missing = true; }
    if (newEmail.value.trim() === "") { newEmail.classList.add("input-error"); missing = true; }

    if (missing) {
        errorSpan.innerHTML = "* All fields are required";
        return; 
    }

    let payload = {
        userId: userId,
        contactId: id,
        firstName: newFirst.value.trim(),
        lastName: newLast.value.trim(),
        phone: newPhone.value.trim(),
        email: newEmail.value.trim()
    };

    let xhr = new XMLHttpRequest();
    xhr.open("POST", urlBase + "/UpdateContact." + extension, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onload = function() {
        let resp = JSON.parse(this.responseText);
        if (resp.error) {
            errorSpan.innerText = resp.error;
        } else {
            loadContacts();
        }
    };
    xhr.send(JSON.stringify(payload));
}

function deleteContactByID(id) {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    let payload = {
        userId: userId,
        contactId: id 
    };

    let xhr = new XMLHttpRequest();
    xhr.open("POST", urlBase + "/DeleteContact." + extension, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onload = function() {
        let resp = JSON.parse(this.responseText);
        if (!resp.error || resp.error === "") {
            loadContacts(); // refresh after del
        } else {
            document.getElementById("deleteContactResult").innerText = resp.error;
        }
    };
    xhr.send(JSON.stringify(payload));
}
