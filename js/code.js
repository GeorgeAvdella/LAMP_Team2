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
        document.getElementById("lbl" + f).style.color = "black";
        document.getElementById("ast" + f).innerHTML = "";
    });

    let newFirstName = document.getElementById("signupFirstName").value.trim();
    let newLastName = document.getElementById("signupLastName").value.trim();
    let newUsername = document.getElementById("signupUsername").value.trim();
    let newPassword = document.getElementById("signupPassword").value.trim();

    let missing = false;

    // check each field and mark in red if missing
    if (!newFirstName) { markInvalid("FirstName"); missing = true; }
    if (!newLastName) { markInvalid("LastName"); missing = true; }
    if (!newUsername) { markInvalid("Username"); missing = true; }
    if (!newPassword) { markInvalid("Password"); missing = true; }

    if (missing) {
        let result = document.getElementById("signupResult");
        result.innerHTML = "Fields marked with * are required!";
        result.style.color = "red";
        return;
    }
    let hash = md5(newPassword);
    let tmp = {
        firstName: newFirstName,
        lastName: newLastName,
        login: newUsername,
        password: hash
    };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Signup.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try
    {
        xhr.onreadystatechange = function()
        {
            if (this.readyState == 4 && this.status == 200)
            {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error && jsonObject.error !== "")
                {
                    document.getElementById("signupResult").innerHTML = jsonObject.error;
                    return;
                }

                document.getElementById("signupResult").innerHTML = "Account created! Please login.";

                // clear form
                document.getElementById("signupFirstName").value = "";
                document.getElementById("signupLastName").value = "";
                document.getElementById("signupUsername").value = "";
                document.getElementById("signupPassword").value = "";

                // switch to login after 2 seconds
                setTimeout(showLogin, 2000);
            }
        };
        xhr.send(jsonPayload);
    }
    catch(err)
    {
        document.getElementById("signupResult").innerHTML = err.message;
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
    document.getElementById("inner-title-login").style.color = "black";
    document.getElementById("lblLoginName").style.color = "black";
    document.getElementById("astLoginName").innerHTML = "";
    document.getElementById("lblLoginPassword").style.color = "black";
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
    let hash = md5(newPassword);
	
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
            document.getElementById("addContactResult").innerText = resp.error;
        } else {
            document.getElementById("addContactResult").innerText = "Contact added!";
            loadContacts(); // refresh list
        }
    };
    xhr.send(JSON.stringify(payload));
}

function loadContacts() {
    if (userId < 1) readCookie();

    let payload = {
        userId: userId,
        search: "" // empty search returns all contacts 
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
                    row.innerHTML = `
                        <td>${contact.firstName} ${contact.lastName}</td>
                        <td>${contact.Phone}</td>
                        <td>${contact.Email}</td>
                        <td>
                            <button class="delete-btn" onclick="deleteContactByID(${contact.ID})">Delete</button>
                        </td>
                    `;
                });
            } else {
                tableBody.innerHTML = "<tr><td colspan='4'>No contacts found.</td></tr>";
            }
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
            alert("Error: " + resp.error);
        }
    };
    xhr.send(JSON.stringify(payload));
}