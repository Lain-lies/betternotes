const localState = {
	record: [],
	updateTickets: function (newTicket) {
		this.record = this.records.push(newTicket);
	},
	syncWithLocalStorage: function () {
		localStorage.setItem("record", JSON.stringify(this.record));
	},
};

const ticketForm = document.querySelector("#ticketForm");

ticketForm.addEventListener("submit", (event) => {
	event.preventDefault();
	const formData = new FormData(event.target);
	const data = Object.fromEntries(formData.entries());

	const checkList = [
		"workSetup",
		"criticalIssue",
		"existingTicket",
		"sspr",
		"nexthink",
		"nonAdPasswordReset",
		"ticketStatus",
		"issueResolved",
		"userAgreedResolved",
	];

	checkList.forEach((item) => {
		!Object.hasOwn(data, item) && (data[item] = "No");
	});

	console.log(data);
	const notes = `Employee ID: ${data.employeeId}
Name: ${data.fullName}
User ID: ${data.userId}
Email Address: ${data.email}
Contact Number: ${data.contactNumber}
Best time to reach: ${data.bestTimeToReach}
Work Setup: ${data.workSetup}
Location: ${data.location}

Critical Issue? ${data.criticalIssue}
Existing Ticket? ${data.existingdata}
Existing Ticket Number: ${data.existingdataNumber}

SSPR? ${data.sspr}
Nexthink? ${data.nexthink}
Non-AD Password Reset via Chat? ${data.nonAdPasswordReset}

ISSUE DESCRIPTION:
${data.issueDescription}

MINIMUM DATA SET:
${data.minimumDataSet}

KB Article: ${data.kbArticle}
Next Action(s): ${data.nextActions}

Issue Resolved? ${data.issueResolved}
User agreed to set data to Resolved? ${data.userAgreedResolved}

Ticket #: ${data.ticketNumber}`;

	copyToClipboard(notes);
});

async function copyToClipboard(text) {
	try {
		await navigator.clipboard.writeText(text);
		alert("Text successfully copied!");
	} catch (err) {
		console.error("Failed to copy: ", err);
	}
}
