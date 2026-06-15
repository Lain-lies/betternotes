const storageState = {
	record: [],
	currentSessionName: "",
	sessionList: [],

	setRecord: function (record) {
		this.record = record;
	},

	setCurrentSessionName: function (sessionName) {
		this.currentSessionName = sessionName;
	},

	setSessionList: function (sessionList) {
		this.sessionList = [...sessionList];
		console.log(this.sessionList);
	},

	getRecord: function () {
		return this.record;
	},

	getCurrentSessionName: function () {
		return this.currentSessionName;
	},

	getSessionList: function () {
		return [...this.sessionList];
	},

	getSessionListFromLocalStorage: function () {
		const sessionList = Object.entries(localStorage).map(([key]) => key);
		console.log(sessionList);
		if (sessionList.length === 0) {
			const now = Date.now();
			const dateObject = new Date(now);
			const currentDate = dateObject.toLocaleDateString();
			localStorage.setItem(currentDate, JSON.stringify([]));
			this.setSessionList([currentDate]);
			return;
		}

		this.setSessionList(sessionList);
	},

	// HELPERS //
	loadSession: function (sessionName) {
		const sessionData = JSON.parse(
			localStorage.getItem(this.getCurrentSessionName(sessionName)),
		);

		if (!Array.isArray(sessionData)) {
			alert("Session not found! Please create a new session.");
			return;
		}

		this.setRecord(sessionData);
		this.setCurrentSessionName(sessionName);

		console.log(`Session Name: ${this.getCurrentSessionName()}`);
		console.log(`Session Data: ${this.getRecord()}`);
	},

	syncWithLocalStorage: function (newRecord) {
		this.setRecord([...this.getRecord(), newRecord]);

		localStorage.setItem(
			this.currentSessionName,
			JSON.stringify(this.getRecord()),
		);

		alert("Local Storage Synced!");

		return true;
	},

	// INIT //

	init: function () {
		this.getSessionListFromLocalStorage();

		const currentSessionName = this.getSessionList();
		console.log(this.sessionList);
		console.log(currentSessionName[0]);
		this.setCurrentSessionName(currentSessionName[0]);
	},
};

const fieldState = {
	fieldElement: document.querySelector("#ticketForm"),
	fieldCallTypeButton: document.querySelector("#calltype"),
	fieldOnBehalfContainerElement: document.querySelector("#onbehalf"),
	fieldModified: false,
	fieldSaved: false,
	fieldData: {},
	fieldItselfCall: true,

	// SETTERS //

	setFieldModified: function (value) {
		this.fieldModified = value;
	},

	setFieldSaved: function (value) {
		this.fieldSaved = value;
	},

	setFieldData: function (value) {
		this.fieldData = value;
	},

	setFieldItselfCall: function (value) {
		this.fieldItselfCall = value;
	},

	// GETTERS //

	getFieldModified: function () {
		return this.fieldModified;
	},

	getFieldSaved: function () {
		return this.fieldSaved;
	},

	getFieldData: function () {
		return this.fieldData;
	},

	getFieldItselfCall: function () {
		return this.fieldItselfCall;
	},

	// HELPERS //

	onSaveHelper: function (data) {
		if (this.getFieldModified() === false) {
			alert("No changes detected! Please modify the form before saving.");
			return;
		}

		if (this.getFieldSaved() === false) {
			this.setFieldSaved(true);
		}

		this.setFieldData(data);

		this.getFieldItselfCall()
			? copyToClipboard(noteTransform(data))
			: copyToClipboard(OBnoteTransform(data));

		alert("Record Saved!");
	},

	onResetHelper: function () {
		this.fieldElement.reset();
		this.setFieldModified(false);
		this.setFieldSaved(false);
		this.setFieldData({});
		this.resetSwitchClick();
		this.setFieldItselfCall(true);
		window.location.href = "#ticketForm";
	},

	onNewNoteHelper: function () {
		if (this.getFieldSaved() === false && this.getFieldModified() === false) {
			alert("No changes detected! Please modify the form before saving.");
			return;
		}

		if (this.getFieldSaved() === false && this.getFieldModified() === true) {
			alert("Please save current record Or cancel it first.");
			return;
		}

		storageState.syncWithLocalStorage(this.getFieldData());
		this.onResetHelper();
		controlPanelDisplayState.renderAllControlPanelList();
	},

	isAllowedtoSwitchSession: function () {
		return this.getFieldSaved() === false && this.getFieldModified() === false
			? true
			: false;
	},

	// SWITCH CLICK //

	initSwitchClick: function () {
		const defaultOptionOne = ["N/A", "Yes", "No"];
		const defaultOptionTwo = ["No", "Yes", "N/A"];
		const defaultOptionThree = ["No", "Yes"];
		const workSetupOptions = ["WFH", "Office", "Field"];
		const OBworkSetupOptions = ["N/A", "WFH", "Office", "Field"];

		this.setupSwitchClick(
			document.querySelector("[name=workSetup]"),
			workSetupOptions,
		);

		this.setupSwitchClick(
			document.querySelector("[name=OBworkSetup]"),
			OBworkSetupOptions,
		);

		this.setupSwitchClick(
			document.querySelector("[name=existingTicket]"),
			defaultOptionThree,
		);

		this.setupSwitchClick(
			document.querySelector("[name=nexthink]"),
			defaultOptionThree,
		);
		this.setupSwitchClick(
			document.querySelector("[name=newHire]"),
			defaultOptionTwo,
		);
		this.setupSwitchClick(
			document.querySelector("[name=mfaRegistered]"),
			defaultOptionOne,
		);
		this.setupSwitchClick(
			document.querySelector("[name=ssprOffered]"),
			defaultOptionOne,
		);

		this.setupSwitchClick(
			document.querySelector("[name=userDeclined]"),
			defaultOptionOne,
		);

		this.setupSwitchClick(
			document.querySelector("[name=userAttemptedSsprFailed]"),
			defaultOptionOne,
		);

		this.setupSwitchClick(document.querySelector("[name=nextActions]"), [
			"N/A",
			"Waiting for Line-Manager Approval",
			"Route the ticket to the next resolver team",
			"Set ticket to pending",
		]);

		this.setupSwitchClick(
			document.querySelector("[name=issueResolved]"),
			defaultOptionOne,
		);

		this.setupSwitchClick(
			document.querySelector("[name=userAgreedResolved]"),
			defaultOptionOne,
		);
	},

	setupSwitchClick: function (element, options) {
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
	},

	resetSwitchClick: function () {
		const switchClickButtons = document.querySelectorAll(".switch-click");

		switchClickButtons.forEach((button) => {
			button.remove();
		});

		this.initSwitchClick();
	},

	// MINIMUM DATA SET AUTOFILL //

	initAutoFillMinimumDataSet: function () {
		const element = document.querySelector("[name=minimumDataSet]");
		const parent = element.parentElement;

		const buttonOne = document.createElement("button");
		buttonOne.textContent = "PW Reset VERIFIED";
		const buttonTwo = document.createElement("button");
		buttonTwo.textContent = "PW Reset NOT VERIFIED";

		const buttonThree = document.createElement("button");
		buttonThree.textContent = "Incident Routed";
		const buttonFour = document.createElement("button");
		buttonFour.textContent = "Incident Resolved";

		buttonOne.type = "button";
		buttonTwo.type = "button";
		buttonThree.type = "button";
		buttonFour.type = "button";

		buttonOne.addEventListener("click", () => {
			const resetType = element.value;
			element.value = `
- Checked Users account via ${resetType}
- User account is active
- Verified the user via verification tool
- User is verified
- Successfully reset user's password 
- Provided the password to the user
- User tried the password on his/her end
- User successfully signed in
- Provided ticket number to user
- User acknowledged
- End call 


		`;
		});
		buttonTwo.addEventListener("click", () => {
			const resetType = element.value;
			element.value = `
- Checked Users account via  ${resetType}
- Verified the user via verification tool
- User is not verified
- Filed a password reset request for user 
- Advised user that the request is subject to line-manager's approval
- Provided Ticket Number
- User Acknowledged
- End call

		`;
		});

		buttonThree.addEventListener("click", () => {
			element.value += `
- Advised user ticket will be routed to [NAME] team
- Provided ticket number to the user
- User Acknowledged
- End call`;
		});

		buttonFour.addEventListener("click", () => {
			element.value += `
- Issue Resolved
- Provided ticket number to the user
- Confirmed with user ticket can now be set to resolved
- End call`;
		});
		parent.appendChild(buttonOne);
		parent.appendChild(buttonTwo);
		parent.appendChild(buttonThree);
		parent.appendChild(buttonFour);
	},

	// INIT //

	init: function () {
		this.fieldElement.addEventListener("input", () => {
			this.setFieldModified(true);
		});

		this.fieldElement.addEventListener("submit", (event) => {
			event.preventDefault();
			const formData = new FormData(event.target);
			const data = Object.fromEntries(formData.entries());
			this.onSaveHelper(data);
		});

		const resetButton = document.querySelector("#cancelButton");
		resetButton.addEventListener("click", () => {
			if (
				confirm(
					"Are you sure you want to cancel? All unsaved changes will be lost.",
				)
			) {
				this.onResetHelper();
			}
		});

		const newNoteButton = document.querySelector("#newNoteButton");
		newNoteButton.addEventListener("click", () => {
			this.onNewNoteHelper();
		});

		this.fieldOnBehalfContainerElement.style.display = "none";

		this.fieldCallTypeButton.addEventListener("click", (e) => {
			e.preventDefault();
			if (this.getFieldItselfCall() === true) {
				this.setFieldItselfCall(false);
				this.fieldOnBehalfContainerElement.style.display = "block";
				e.target.textContent = "OnBehalf";
			} else {
				this.setFieldItselfCall(true);
				this.fieldOnBehalfContainerElement.style.display = "none";
				e.target.textContent = "Itself";
			}
		});

		this.initSwitchClick();
		this.initAutoFillMinimumDataSet();
	},
};

const controlPanelDisplayState = {
	controlPanelElement: document.querySelector(".control-panel"),
	controlPanelCurrentSessionNameElement: document.querySelector(
		"#currentSessionName",
	),
	controlPanelSessionListElement: document.querySelector("#session-list"),
	controlPanelExportSessionListElement:
		document.querySelector("#exportable-list"),
	controlPanelSessionHistoryElement: document.querySelector("#session-history"),

	renderCurrentSessionName: function (value) {
		this.controlPanelCurrentSessionNameElement.textContent = value;
	},

	renderSessionList: function () {
		this.controlPanelSessionListElement.replaceChildren();

		const sessionList = storageState.getSessionList();
		sessionList.forEach((session) => {
			const li = document.createElement("li");
			const button = document.createElement("button");
			button.textContent = session;
			button.addEventListener("click", () => {
				if (fieldState.isAllowedtoSwitchSession()) {
					storageState.loadSession(session);
					this.renderCurrentSessionName(storageState.getCurrentSessionName());
					this.renderAllControlPanelList();
					return;
				}
				alert(
					"Please SAVE current work before switching or CANCEL if you want to abandon work",
				);
			});
			li.appendChild(button);
			this.controlPanelSessionListElement.appendChild(li);
		});
	},

	renderExportSessionList: function () {
		this.controlPanelExportSessionListElement.replaceChildren();
		const sessionList = storageState.getSessionList();
		sessionList.forEach((session) => {
			const li = document.createElement("li");
			const button = document.createElement("button");
			button.textContent = session;
			button.addEventListener("click", () => {
				this.renderSessionHistory(session);
			});
			li.appendChild(button);
			this.controlPanelExportSessionListElement.appendChild(li);
		});
	},

	renderSessionHistory: function (sessionName) {
		this.controlPanelSessionHistoryElement.replaceChildren();

		const exportAllButton = document.createElement("button");
		exportAllButton.textContent = "Export ALL";
		exportAllButton.addEventListener("click", () => exportSession(sessionName));

		this.controlPanelSessionHistoryElement.appendChild(exportAllButton);

		const sessionHistory = JSON.parse(localStorage.getItem(sessionName));

		sessionHistory.forEach((record) => {
			const button = document.createElement("button");
			button.textContent = `${record.ticketNumber} | ${record.fullName}`;
			button.addEventListener("click", () => {
				exportIndividualRecord(record);
			});
			this.controlPanelSessionHistoryElement.appendChild(button);
		});
	},

	renderAllControlPanelList: function () {
		this.renderSessionList();
		this.renderExportSessionList();
	},

	init: function () {
		const hideControlPanelButton = document.querySelector(
			"#hide-control-panel",
		);

		hideControlPanelButton.addEventListener("click", () => {
			if (this.controlPanelElement.style.display === "none") {
				this.controlPanelElement.style.display = "block";
				hideControlPanelButton.textContent = "HIDE CONTROL PANEL";
			} else {
				this.controlPanelElement.style.display = "none";
				hideControlPanelButton.textContent = "SHOW CONTROL PANEL";
			}
		});

		this.renderCurrentSessionName(storageState.getCurrentSessionName());

		this.renderAllControlPanelList();
	},
};

// UTILITIES //
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

Existing Ticket? ${data.existingTicket}
Existing Ticket Number: ${data.existingTicketNumber}

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
Nexthink: ${data.nexthink}

Next Action(s): ${data.nextActions}

Issue Resolved? ${data.issueResolved}
User agreed to set data to Resolved? ${data.userAgreedResolved}
Resolution Notes: ${data.resolutionNotes}

Ticket #: ${data.ticketNumber}`;

	return notes;
}

function OBnoteTransform(data) {
	const notes = `
== CALLER == 

Employee ID: ${data.employeeId}
Name: ${data.fullName}
User ID: ${data.userId}
Email Address: ${data.email}
Contact Number: ${data.contactNumber}
Best time to reach: ${data.bestTimeToReach}
Work Setup: ${data.workSetup}
Location: ${data.location}

== USER ==

Employee ID: ${data.OBemployeeId}
Name: ${data.OBfullName}
User ID: ${data.OBuserId}
Email Address: ${data.OBemail}
Contact Number: ${data.OBcontactNumber}
Best time to reach: ${data.OBbestTimeToReach}
Work Setup: ${data.OBworkSetup}
Location: ${data.OBlocation}

Existing Ticket? ${data.existingTicket}
Existing Ticket Number: ${data.existingTicketNumber}

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
Nexthink: ${data.nexthink}

Next Action(s): ${data.nextActions}

Issue Resolved? ${data.issueResolved}
User agreed to set data to Resolved? ${data.userAgreedResolved}
Resolution Notes: ${data.resolutionNotes}

Ticket #: ${data.ticketNumber}`;

	return notes;
}

function exportSession(sessionName) {
	const records = JSON.parse(localStorage.getItem(sessionName)) || [];

	let textContent = "";

	records.forEach((ticket, index) => {
		textContent += `
========================================
Record #${index + 1}
========================================
== CALLER ==

Employee ID: ${ticket.employeeId}
Name: ${ticket.fullName}
User ID: ${ticket.userId}
Email Address: ${ticket.email}
Contact Number: ${ticket.contactNumber}
Best time to reach: ${ticket.bestTimeToReach}
Work Setup: ${ticket.workSetup}
Location: ${ticket.location}

== USER ==

Employee ID: ${ticket.OBemployeeId}
Name: ${ticket.OBfullName}
User ID: ${ticket.OBuserId}
Email Address: ${ticket.OBemail}
Contact Number: ${ticket.OBcontactNumber}
Best time to reach: ${ticket.OBbestTimeToReach}
Work Setup: ${ticket.OBworkSetup}
Location: ${ticket.OBlocation}

Existing Ticket? ${ticket.existingTicket}
Existing Ticket Number: ${ticket.existingTicketNumber}

New Hire: ${ticket.newHire}
MFA Registered? ${ticket.mfaRegistered}
SSPR Offered? ${ticket.ssprOffered}

User Declined SSPR? ${ticket.userDeclined}
User Declined Reason: ${ticket.userDeclinedReason}
User Attempted SSPR but Failed? ${ticket.userAttemptedSsprFailed}
User SSPR Failure Details: ${ticket.ssprFailureDetails}

ISSUE DESCRIPTION:
${ticket.issueDescription}

MINIMUM DATA SET:
${ticket.minimumDataSet}

KB Article: ${ticket.kbArticle}
Nexthink? ${ticket.nexthink}

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

function exportIndividualRecord(ticket) {
	const textContent = `
========================================
Individual Record
========================================

== CALLER ==

Employee ID: ${ticket.employeeId}
Name: ${ticket.fullName}
User ID: ${ticket.userId}
Email Address: ${ticket.email}
Contact Number: ${ticket.contactNumber}
Best time to reach: ${ticket.bestTimeToReach}
Work Setup: ${ticket.workSetup}
Location: ${ticket.location}

== USER ==

Employee ID: ${ticket.OBemployeeId}
Name: ${ticket.OBfullName}
User ID: ${ticket.OBuserId}
Email Address: ${ticket.OBemail}
Contact Number: ${ticket.OBcontactNumber}
Best time to reach: ${ticket.OBbestTimeToReach}
Work Setup: ${ticket.OBworkSetup}
Location: ${ticket.OBlocation}

Existing Ticket? ${ticket.existingTicket}
Existing Ticket Number: ${ticket.existingTicketNumber}

New Hire: ${ticket.newHire}
MFA Registered? ${ticket.mfaRegistered}
SSPR Offered? ${ticket.ssprOffered}

User Declined SSPR? ${ticket.userDeclined}
User Declined Reason: ${ticket.userDeclinedReason}
User Attempted SSPR but Failed? ${ticket.userAttemptedSsprFailed}
User SSPR Failure Details: ${ticket.ssprFailureDetails}

ISSUE DESCRIPTION:
${ticket.issueDescription}

MINIMUM DATA SET:
${ticket.minimumDataSet}

KB Article: ${ticket.kbArticle}
Nexthink? ${ticket.nexthink}

Next Action(s): ${ticket.nextActions}

Issue Resolved? ${ticket.issueResolved}
User agreed to set ticket to Resolved?
${ticket.userAgreedResolved}
Resolution Notes: ${ticket.resolutionNotes}

Ticket #: ${ticket.ticketNumber}
`;

	const blob = new Blob([textContent], {
		type: "text/plain",
	});

	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = `${ticket.ticketNumber}.txt`;

	a.click();

	URL.revokeObjectURL(url);
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
		storageState.getSessionListFromLocalStorage();
		controlPanelDisplayState.renderAllControlPanelList();
	});
}

function init() {
	window.addEventListener("beforeunload", (e) => {
		e.preventDefault();
	});

	storageState.init();
	fieldState.init();
	controlPanelDisplayState.init();
	initCreateNewSessionForm();
}

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

init();
document.querySelector("#fillTestData").addEventListener("click", fillTestData);
