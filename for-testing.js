function fillTestData() {
	document.querySelector("[name=employeeId]").value = "12345678";
	document.querySelector("[name=fullName]").value = "Kenjie Tarasona";
	document.querySelector("[name=userId]").value = "KDCRUZ";
	document.querySelector("[name=email]").value =
		"kenjie.tarasona@nationalgrid.com";
	document.querySelector("[name=contactNumber]").value = "09171234567";
	document.querySelector("[name=location]").value = "Marikina";

	document.querySelector("[name=issueDescription]").value =
		"User unable to sign in after password expiration.";

	document.querySelector("[name=minimumDataSet]").value =
		`Verified employee identity.
Validated employee ID.
Performed password reset via SSPR.
Confirmed successful login.`;

	document.querySelector("[name=kbArticle]").value = "KB123456";
	document.querySelector("[name=ticketNumber]").value = "INC1234567";
}

document.querySelector("#fillTestData").addEventListener("click", fillTestData);
