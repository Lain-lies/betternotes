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

	return notes;
}

const localState = {
	record: [],
	currentlyEditingRecordIndex: 0,
	currentSession: "test",
	currentSessionNodeElement: document.querySelector("#currentSessionName"),

	saveRecord: function (newTicket) {
		if (this.currentRecordIndex === this.record.length) {
			this.record.push(newTicket);
			return;
		}
		this.record[this.currentRecordIndex] = newTicket;
		copyToClipboard(noteTransform(newTicket));
		alert("Record Saved!");
	},

	updateCurrentSession: function (newSessionName) {
		localStorage.setItem(this.currentSession, JSON.stringify(this.record));
		this.currentSession = newSessionName;
		this.currentSessionNodeElement.textContent = newSessionName;
		this.record = JSON.parse(localStorage.getItem(newSessionName)) || [];
		console.log(this.currentSession);
	},

	syncWithLocalStorage: function () {
		localStorage.setItem(this.currentSession, JSON.stringify(this.record));
		this.currentRecordIndex = this.record.length;
		alert("Local Storage Synced!");
	},
};

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

	const newNoteButton = document.querySelector("#newNoteButton");
	newNoteButton.addEventListener("click", () => {
		ticketForm.reset();
		localState.syncWithLocalStorage();
	});
}

function initSession() {
	const sessions = Object.entries(localStorage).map(([key]) => key);
	loadSession(sessions[0]);
	const sessionListNodeElement = document.querySelector(".session-list");
	sessions.forEach((session) => {
		const li = document.createElement("li");
		const a = document.createElement("a");
		a.textContent = session;
		a.addEventListener("click", () => {
			localState.updateCurrentSession(session);
		});
		li.appendChild(a);
		sessionListNodeElement.appendChild(li);
	});
	console.log(sessions);
}

function loadSession(sessionName) {
	console.log(sessionName);
	const sessionData = localStorage.getItem(sessionName);
	if (sessionData) {
		localState.record = JSON.parse(sessionData);
		localState.currentRecordIndex = localState.record.length;
		localState.currentSession = sessionName;
		localState.currentSessionNodeElement.textContent = sessionName;
	} else {
		alert("Session not found!");
	}

	console.log(sessionData);
}

function init() {
	window.addEventListener("beforeunload", (e) => {
		e.preventDefault();
		localState.syncWithLocalStorage();
	});

	localState.currentSessionNodeElement.textContent = localState.currentSession;
	initSession();
	initControlPanel();
	initTicketForm();
}

init();
