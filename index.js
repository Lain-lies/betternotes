const localState = {
	record: [],
	fieldData: {},
	fieldSaved: false,
	fieldModified: false,
	currentSessionName: "",
	currentSessionNameElement: document.querySelector("#currentSessionName"),

	setFieldData: function (fieldData) {
		this.fieldData = fieldData;
	},

	setFieldSaved: function (value) {
		this.fieldSaved = value;
	},

	setFieldModified: function (value) {
		this.fieldModified = value;
	},

	setRecord: function (record) {
		this.record = record;
	},

	setCurrentSessionName: function (sessionName) {
		this.currentSessionName = sessionName;
	},

	getRecord: function () {
		return this.record;
	},

	getFieldData: function () {
		return this.fieldData;
	},

	getFieldSaved: function () {
		return this.fieldSaved;
	},

	getFieldModified: function () {
		return this.fieldModified;
	},

	getCurrentSessionName: function () {
		return this.currentSessionName;
	},

	saveRecord: function (fieldData) {
		if (this.getFieldModified() === false) {
			alert("No changes detected! Please modify the form before saving.");
			return;
		}

		if (this.getFieldSaved() === false) {
			this.setFieldData(fieldData);
			this.setFieldSaved(true);
			return;
		}

		this.setFieldData(fieldData);
		copyToClipboard(noteTransform(fieldData));
		alert("Record Saved!");
	},

	loadSession: function (sessionName) {
		this.setRecord(JSON.parse(localStorage.getItem(sessionName)));
		this.setFieldSaved(false);
		this.setFieldModified(false);
		this.setCurrentSessionName(sessionName);
		this.currentSessionNameElement.textContent = sessionName;

		console.log(this.getCurrentSessionName());
	},

	syncWithLocalStorage: function () {
		// if new note is triggered but the current record is not yet saved, prevent
		if (this.getFieldSaved() === false && this.getFieldModified() === false) {
			alert("No changes detected! Please modify the form before saving.");
			return false;
		}

		if (this.getFieldSaved() === false && this.getFieldModified() === true) {
			alert("Please save current record Or cancel it first.");
			return false;
		}

		this.setRecord([...this.getRecord(), this.getFieldData()]);
		this.setFieldData({});
		this.setFieldSaved(false);
		this.setFieldModified(false);
		localStorage.setItem(
			this.currentSessionName,
			JSON.stringify(this.getRecord()),
		);

		alert("Local Storage Synced!");

		return true;
	},
};

async function copyToClipboard(text) {
	try {
		await navigator.clipboard.writeText(text);
		alert("Text successfully copied!");
	} catch (err) {
		console.error("Failed to copy: ", err);
	}
}

function noteTransform(data) {
	const notes = `
Employee ID: ${data.employeeId}
Name: ${data.fullName}
User ID: ${data.userId}
Email Address: ${data.email}
Contact Number: ${data.contactNumber}
Best time to reach: ${data.bestTimeToReach}
Work Setup: ${data.workSetup}
Location: ${data.location}

Critical Issue? ${data.criticalIssue}
Existing Ticket? ${data.existingTicket}
Existing Ticket Number: ${data.existingTicketNumber}

SSPR? ${data.sspr}
Nexthink? ${data.nexthink}
Non-AD Password Reset via Chat? ${data.nonAdPasswordReset}

New Hire: ${data.newHire}
MFA Registered? ${data.mfaRegistered}
SSPR Offered? ${data.ssprOffered}

User Declined SSPR? ${data.userDeclined}
User Declined Reason: ${data.userDeclinedReason}
User Attempted SSPR but Failed? ${data.userAttemptedSsprFailed}
User SSPR Failure Details: ${data.ssprFailureDetails}

ISSUE DESCRIPTION:
${data.issueDescription}

MINIMUM DATA SET:
${data.minimumDataSet}

KB Article: ${data.kbArticle}
Next Action(s): ${data.nextActions}

Issue Resolved? ${data.issueResolved}
User agreed to set data to Resolved? ${data.userAgreedResolved}
Resolution Notes: ${data.resolutionNotes}

Ticket #: ${data.ticketNumber}`;

	return notes;
}

function loadSession(sessionName) {
	const sessionData = JSON.parse(localStorage.getItem(sessionName));

	if (Array.isArray(sessionData)) {
		localState.loadSession(sessionName);
	} else {
		alert("Session not found! Please create a new session.");
	}
	console.log(sessionData);
}

function drawSessionList(sessionList) {
	const sessionListNodeElement = document.querySelector(".session-list");

	sessionListNodeElement.replaceChildren();
	sessionList.forEach((session) => {
		const li = document.createElement("li");
		const button = document.createElement("button");
		button.textContent = session;
		button.addEventListener("click", () => {
			localState.syncWithLocalStorage();
			localState.loadSession(session);
		});
		li.appendChild(button);
		sessionListNodeElement.appendChild(li);
	});

	localState.currentSessionNameElement.textContent =
		localState.currentSessionName;

	//temporary code for downloading the session records
	const sessionExportListNodeElement = document.querySelector(
		".session-export-list",
	);
	sessionExportListNodeElement.replaceChildren();

	sessionList.forEach((session) => {
		const li = document.createElement("li");
		const button = document.createElement("button");
		button.textContent = session;
		button.addEventListener("click", () => {
			exportSession(session);
		});
		li.appendChild(button);
		sessionExportListNodeElement.appendChild(li);
	});
}

function initControlPanel() {
	const hideControlPanelButton = document.querySelector("#hide-control-panel");
	const controlPanel = document.querySelector(".control-panel");
	hideControlPanelButton.addEventListener("click", () => {
		if (controlPanel.style.display === "none") {
			controlPanel.style.display = "block";
			hideControlPanelButton.textContent = "HIDE CONTROL PANEL";
		} else {
			controlPanel.style.display = "none";
			hideControlPanelButton.textContent = "SHOW CONTROL PANEL";
		}
	});
}

function initTicketForm() {
	const ticketForm = document.querySelector("#ticketForm");

	ticketForm.addEventListener("input", () => {
		localState.setFieldModified(true);
	});

	ticketForm.addEventListener("submit", (event) => {
		event.preventDefault();
		const formData = new FormData(event.target);
		const data = Object.fromEntries(formData.entries());

		localState.saveRecord(data);
		console.log(data);
	});

	const cancelButton = document.querySelector("#cancelButton");
	cancelButton.addEventListener("click", () => {
		if (
			confirm(
				"Are you sure you want to cancel? All unsaved changes will be lost.",
			)
		) {
			ticketForm.reset();
			localState.setFieldSaved(false);
		}
	});

	const newNoteButton = document.querySelector("#newNoteButton");
	newNoteButton.addEventListener("click", () => {
		if (localState.syncWithLocalStorage()) {
			ticketForm.reset();
		}
	});
}

function initSession() {
	const sessionList = Object.entries(localStorage).map(([key]) => key);

	if (sessionList.length === 0) {
		const now = Date.now();
		const dateObject = new Date(now);
		const currentDate = dateObject.toLocaleDateString();
		localStorage.setItem(currentDate, JSON.stringify([]));
		sessionList.push(currentDate);
	}

	loadSession(sessionList[0]);
	drawSessionList(sessionList);

	console.log(sessionList);
}

function initCreateNewSessionForm() {
	const createSessionForm = document.querySelector("#createSessionForm");
	createSessionForm.addEventListener("submit", (event) => {
		event.preventDefault();
		const formData = new FormData(event.target);
		const newSessionName = formData.get("sessionName").trim();
		console.log(newSessionName);
		if (newSessionName === "") {
			alert("Session name cannot be empty!");
			return;
		}

		if (localStorage.getItem(newSessionName)) {
			alert("Session name already exists! Please choose a different name.");
			return;
		}

		localStorage.setItem(newSessionName, JSON.stringify([]));

		//RE-INITIALIZE THE SESSION LIST

		initSession();
	});
}

function init() {
	window.addEventListener("beforeunload", (e) => {
		e.preventDefault();
		localState.syncWithLocalStorage();
	});

	initSession();
	initControlPanel();
	initCreateNewSessionForm();
	initTicketForm();
	initSwitchClick();
}

function exportSession(sessionName) {
	const records = JSON.parse(localStorage.getItem(sessionName)) || [];

	let textContent = "";

	records.forEach((ticket, index) => {
		textContent += `
========================================
Record #${index + 1}
========================================

Employee ID: ${ticket.employeeId}
Name: ${ticket.fullName}
User ID: ${ticket.userId}
Email Address: ${ticket.email}
Contact Number: ${ticket.contactNumber}
Best time to reach: ${ticket.bestTimeToReach}
Work Setup: ${ticket.workSetup}
Location: ${ticket.location}

Critical Issue? ${ticket.criticalIssue}
Existing Ticket? ${ticket.existingTicket}
Existing Ticket Number: ${ticket.existingTicketNumber}

New Hire: ${ticket.newHire}
MFA Registered? ${ticket.mfaRegistered}
SSPR Offered? ${ticket.ssprOffered}

User Declined SSPR? ${ticket.userDeclined}
User Declined Reason: ${ticket.userDeclinedReason}
User Attempted SSPR but Failed? ${ticket.userAttemptedSsprFailed}
User SSPR Failure Details: ${ticket.ssprFailureDetails}

SSPR? ${ticket.sspr}
Nexthink? ${ticket.nexthink}
Non-AD Password Reset via Chat? ${ticket.nonAdPasswordReset}



ISSUE DESCRIPTION:
${ticket.issueDescription}

MINIMUM DATA SET:
${ticket.minimumDataSet}

KB Article: ${ticket.kbArticle}
Next Action(s): ${ticket.nextActions}

Issue Resolved? ${ticket.issueResolved}
User agreed to set ticket to Resolved?
${ticket.userAgreedResolved}
Resolution Notes: ${ticket.resolutionNotes}

Ticket #: ${ticket.ticketNumber}


`;
	});

	const blob = new Blob([textContent], {
		type: "text/plain",
	});

	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = `${sessionName}.txt`;

	a.click();

	URL.revokeObjectURL(url);
}

function initSwitchClick() {
	const defaultOptionOne = ["N/A", "Yes", "No"];
	const defaultOptionTwo = ["No", "Yes", "N/A"];
	const defaultOptionThree = ["No", "Yes"];
	const workSetupOptions = ["WFH", "Office", "Field"];

	switchClick(document.querySelector("[name=workSetup]"), workSetupOptions);

	switchClick(
		document.querySelector("[name=criticalIssue]"),
		defaultOptionThree,
	);
	switchClick(
		document.querySelector("[name=existingTicket]"),
		defaultOptionThree,
	);
	switchClick(document.querySelector("[name=sspr]"), defaultOptionThree);
	switchClick(document.querySelector("[name=nexthink]"), defaultOptionThree);
	switchClick(
		document.querySelector("[name=nonAdPasswordReset]"),
		defaultOptionOne,
	);
	switchClick(document.querySelector("[name=newHire]"), defaultOptionTwo);
	switchClick(document.querySelector("[name=mfaRegistered]"), defaultOptionOne);
	switchClick(document.querySelector("[name=ssprOffered]"), defaultOptionOne);

	switchClick(document.querySelector("[name=userDeclined]"), defaultOptionOne);
	switchClick(
		document.querySelector("[name=userAttemptedSsprFailed]"),
		defaultOptionOne,
	);
	switchClick(document.querySelector("[name=nextActions]"), [
		"N/A",
		"Waiting for Line-Manager Approval",
		"Route the ticket to the next resolver team",
	]);

	switchClick(document.querySelector("[name=issueResolved]"), defaultOptionOne);

	switchClick(
		document.querySelector("[name=userAgreedResolved]"),
		defaultOptionOne,
	);
}

function switchClick(element, options) {
	let currentOptionIndex = 0;

	element.value = options[currentOptionIndex];
	element.style.display = "none";

	const parent = element.parentElement;

	const button = document.createElement("button");

	button.textContent = options[currentOptionIndex];
	button.type = "button";
	button.classList.add("switch-click");
	button.addEventListener("click", () => {
		currentOptionIndex++;
		if (currentOptionIndex === options.length) {
			currentOptionIndex = 0;
		}
		element.value = options[currentOptionIndex];
		button.textContent = options[currentOptionIndex];
	});
	parent.appendChild(button);
}

init();
