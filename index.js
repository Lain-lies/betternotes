const localState = {
	record: [],
	currentlyEditingRecordIndex: null,
	currentSession: "",
	currentSessionNodeElement: document.querySelector("#currentSessionName"),
	ticketModified: false,

	initLocalState: function () {
		this.currentlyEditingRecordIndex = this.record.length;
	},

	saveRecord: function (newTicket) {
		if (this.currentlyEditingRecordIndex === this.record.length) {
			this.record.push(newTicket);
			return;
		}

		this.record[this.currentlyEditingRecordIndex] = newTicket;
		copyToClipboard(noteTransform(newTicket));
		alert("Record Saved!");
	},

	updateCurrentSession: function (sessionName) {
		this.currentSession = sessionName;
		this.currentSessionNodeElement.textContent = sessionName;
		this.record = JSON.parse(localStorage.getItem(sessionName));
		this.currentlyEditingRecordIndex = this.record.length;

		console.log(this.currentSession);
	},

	syncWithLocalStorage: function () {
		// if new note is triggered but the current record is not yet saved, prevent

		console.log(
			this.currentlyEditingRecordIndex,
			this.record.length,
			this.ticketModified,
		);
		if (
			this.currentlyEditingRecordIndex === this.record.length &&
			this.ticketModified
		) {
			alert("Please save current record Or cancel it first.");
			return false;
		}

		localStorage.setItem(this.currentSession, JSON.stringify(this.record));
		this.currentlyEditingRecordIndex = this.record.length;
		this.ticketModified = false;

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

ISSUE DESCRIPTION:
${data.issueDescription}

MINIMUM DATA SET:
${data.minimumDataSet}

KB Article: ${data.kbArticle}
Next Action(s): ${data.nextActions}

Issue Resolved? ${data.issueResolved}
User agreed to set data to Resolved? ${data.userAgreedResolved}

Ticket #: ${data.ticketNumber}`;

	return notes;
}

function loadSession(sessionName) {
	const sessionData = JSON.parse(localStorage.getItem(sessionName));

	if (Array.isArray(sessionData)) {
		localState.record = sessionData;
		localState.currentlyEditingRecordIndex = localState.record.length;
		localState.currentSession = sessionName;
		localState.currentSessionNodeElement.textContent = sessionName;
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
			localState.updateCurrentSession(session);
		});
		li.appendChild(button);
		sessionListNodeElement.appendChild(li);
	});

	localState.currentSessionNodeElement.textContent = localState.currentSession;

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
		localState.ticketModified = true;
	});

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
			localState.ticketModified = false;
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

init();
