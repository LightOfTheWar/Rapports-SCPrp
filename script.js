let startTime = null;
let rapport = "";
let currentDepartment = null;
let currentTemplate = null;
let freeMode = false;

/*
========================================
SECTEURS UNIVERSELS
========================================
*/

const UNIVERSAL_SECTORS = [
    "Gate A",
    "Gate B",
    "Zone de Confinement",
    "Carcérale",
    "Laboratoire",
    "Administratif",
    "Surface",
    "Autre"
];

/*
========================================
CONFIG DÉPARTEMENTS
========================================
*/

const CONFIG = {

    "Sécuritaire": {
        roles: ["Agent", "Sergent", "Caporal", "Classe-D"],
        reasons: ["Refus d'obtempérer", "Comportement suspect", "Infraction", "Autre"],
        actions: {
            simple: {
                "Émeute": "Une émeute de Classe-D a éclaté.",
                "SCP déconf": "Un SCP est sorti de son confinement."
            },
            role: {
                "Exécution": "{role} a été exécuté.",
                "ISO": "{role} a été placé en isolement."
            }
        }
    },

    "Scientifique": {
        roles: ["Scientifique", "Superviseur", "Chercheur"],
        reasons: ["Erreur de manipulation", "Test dangereux", "Violation protocole", "Autre"],
        actions: {
            simple: {
                "Test SCP": "Un test SCP a été effectué."
            },
            role: {
                "Incident": "{role} a provoqué un incident."
            }
        }
    }

};

/*
========================================
INITIALISATION
========================================
*/

function init() {
    const deptSelect = document.getElementById("departmentSelect");

    Object.keys(CONFIG).forEach(dept => {
        const option = document.createElement("option");
        option.value = dept;
        option.textContent = dept;
        deptSelect.appendChild(option);
    });
}

function nowTime() {
    return new Date().toLocaleTimeString();
}

function updateReport() {
    document.getElementById("reportBox").value = rapport;
}

/*
========================================
SERVICE
========================================
*/

function startService() {
    currentDepartment = document.getElementById("departmentSelect").value;
    const matricule = document.getElementById("matriculeInput").value;

    startTime = new Date();

    rapport =
        `RAPPORT DE SERVICE\n\n` +
        `Date : ${startTime.toLocaleDateString()}\n` +
        `Matricule : ${matricule}\n` +
        `Département : ${currentDepartment}\n` +
        `Heure début : ${startTime.toLocaleTimeString()}\n\n` +
        `Événements :\n`;

    generateButtons();
    updateReport();
}

function endService() {
    rapport += `\nFin de service : ${nowTime()}\n`;
    updateReport();
}

/*
========================================
BOUTONS DYNAMIQUES
========================================
*/

function generateButtons() {
    const container = document.getElementById("actionsContainer");
    container.innerHTML = "";

    const dept = CONFIG[currentDepartment];

    // Actions simples
    Object.entries(dept.actions.simple).forEach(([name, text]) => {
        const btn = document.createElement("button");
        btn.textContent = name;
        btn.onclick = () => {
            rapport += `[${nowTime()}] ${text}\n`;
            updateReport();
        };
        container.appendChild(btn);
    });

    // Actions avec rôle
    Object.entries(dept.actions.role).forEach(([name, template]) => {
        const btn = document.createElement("button");
        btn.textContent = name;
        btn.onclick = () => openModal(name, template, false);
        container.appendChild(btn);
    });

    // Bouton universel NOTE LIBRE
    const freeBtn = document.createElement("button");
    freeBtn.textContent = "Note libre (universelle)";
    freeBtn.onclick = () => openModal("Note libre", null, true);
    container.appendChild(freeBtn);
}

/*
========================================
MODAL
========================================
*/

function openModal(title, template, isFreeMode) {

    freeMode = isFreeMode;
    currentTemplate = template;

    const dept = CONFIG[currentDepartment];

    document.getElementById("modalTitle").textContent = title;

    fillSelect("roleSelect", dept.roles);
    fillSelect("sectorSelect", UNIVERSAL_SECTORS);
    fillSelect("reasonSelect", dept.reasons);

    document.getElementById("customReason").style.display = "none";
    document.getElementById("freeText").style.display = isFreeMode ? "block" : "none";

    document.getElementById("actionModal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("actionModal").classList.add("hidden");
}

function fillSelect(id, items) {
    const select = document.getElementById(id);
    select.innerHTML = "";
    items.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

/*
========================================
CONFIRMATION ACTION
========================================
*/

function confirmAction() {

    const role = document.getElementById("roleSelect").value;
    const sector = document.getElementById("sectorSelect").value;
    let reason = document.getElementById("reasonSelect").value;

    if (reason === "Autre") {
        document.getElementById("customReason").style.display = "block";
        reason = document.getElementById("customReason").value;
    }

    if (freeMode) {
        const freeText = document.getElementById("freeText").value;
        rapport += `[${nowTime()}] ${freeText} (Secteur: ${sector})\n`;
    } else {
        let text = currentTemplate.replace("{role}", role);
        rapport += `[${nowTime()}] ${text} (Secteur: ${sector}) - Raison: ${reason}\n`;
    }

    updateReport();
    closeModal();
}

/*
========================================
PDF
========================================
*/

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const lines = doc.splitTextToSize(rapport, 180);
    doc.text(lines, 10, 10);

    doc.save("rapport_service.pdf");
}

function handleReasonChange() {
    const reason = document.getElementById("reasonSelect").value;
    const customField = document.getElementById("customReason");

    if (reason === "Autre") {
        customField.style.display = "block";
    } else {
        customField.style.display = "none";
    }
}

init();