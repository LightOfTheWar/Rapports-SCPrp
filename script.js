let startTime = null;
let rapport = "";
let currentDepartment = null;
let currentTemplate = null;
let freeMode = false;

/* =========================================
   SECTEURS UNIVERSELS
========================================= */

const UNIVERSAL_SECTORS = [
    "Sécuritaire",
    "Administratif",
    "Zone de Confinement",
    "DI&ST",
    "Carcérale",
    "Gate A",
    "Surface",
    "Autre"
];

/* =========================================
   CONFIGURATION COMPLETE
========================================= */

const CONFIG = {

    "Sécuritaire": {
        roles: [
            "Recrue Carcérale",
            "Agent Carcéral",
            "Superviseur Carcéral",
            "Chef Carcéral",
            "Caporal UT",
            "Sergent UT",
            "APR",
            "APR WL",
            "Lieutenant UT",
            "Colonel UT",
            "Marshal"
        ],
        reasons: [
            "Refus d'obtempérer",
            "Infraction",
            "Comportement suspect",
            "Tentative d'évasion",
            "Autre"
        ],
        actions: {
            simple: {
                "Fuite ventilation": "Un Classe-D a tenté de s'échapper par la ventilation et a été neutralisé.",
                "Franchissement ligne rouge": "Un Classe-D a franchi la ligne rouge et a été abattu.",
                "Émeute": "Une émeute de Classe-D a éclaté.",
                "Combat IC": "Un combat armé impliquant des IC a eu lieu.",
                "SCP déconf": "Un SCP a été détecté hors confinement.",
                "Panne générateurs": "Les générateurs sont tombés en panne."
            },
            role: {
                "Exécution": "{role} a été exécuté.",
                "TAZE": "{role} a été neutralisé au TAZER.",
                "ISO": "{role} a été placé en isolement.",
                "Rappel à l'ordre": "{role} a été rappelé à l'ordre."
            }
        }
    },

    "Scientifique": {
        roles: [
            "Scientifique",
            "Scientifique Avancé",
            "Superviseur Scientifique"
        ],
        reasons: [
            "Erreur de manipulation",
            "Test dangereux",
            "Violation protocole",
            "Autre"
        ],
        actions: {
            simple: {
                "Test SCP": "Un test sur un SCP a été effectué.",
                "Incident labo": "Un incident a eu lieu en laboratoire."
            },
            role: {
                "Sanction": "{role} a reçu une sanction disciplinaire.",
                "Mise en quarantaine": "{role} a été placé en quarantaine."
            }
        }
    },

    "Administratif": {
        roles: [
            "Agent Administratif",
            "Secrétaire",
            "Directeur"
        ],
        reasons: [
            "Non respect protocole",
            "Erreur administrative",
            "Autre"
        ],
        actions: {
            simple: {
                "Réunion": "Une réunion administrative a eu lieu.",
                "Audit": "Un audit interne a été réalisé."
            },
            role: {
                "Sanction": "{role} a reçu un avertissement officiel.",
                "Promotion": "{role} a été promu."
            }
        }
    },

    "DI&ST": {
        roles: [
            "Agent d'entretien",
            "Technicien",
            "Ingénieur"
        ],
        reasons: [
            "Maintenance urgente",
            "Panne système",
            "Autre"
        ],
        actions: {
            simple: {
                "Réparation": "Une réparation technique a été effectuée.",
                "Maintenance": "Une maintenance système a été réalisée."
            },
            role: {
                "Intervention": "{role} est intervenu sur une panne critique."
            }
        }
    },

    "Classe-D": {
        roles: ["Classe-D"],
        reasons: [
            "Non respect consignes",
            "Tentative d'évasion",
            "Autre"
        ],
        actions: {
            simple: {
                "Transfert": "Un transfert de Classe-D a été effectué."
            },
            role: {
                "Isolement": "{role} a été placé en cellule d'isolement."
            }
        }
    },

    "Insurrection du Chaos": {
        roles: ["Membre IC"],
        reasons: [
            "Intrusion",
            "Attaque armée",
            "Autre"
        ],
        actions: {
            simple: {
                "Raid": "Un raid de l'Insurrection du Chaos a été signalé."
            },
            role: {
                "Neutralisation": "{role} a été neutralisé."
            }
        }
    }

};

/* =========================================
   INITIALISATION
========================================= */

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

/* =========================================
   SERVICE
========================================= */

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

/* =========================================
   GÉNÉRATION DES BOUTONS
========================================= */

function generateButtons() {

    const container = document.getElementById("actionsContainer");
    container.innerHTML = "";

    const dept = CONFIG[currentDepartment];

    Object.entries(dept.actions.simple).forEach(([name, text]) => {
        const btn = document.createElement("button");
        btn.textContent = name;
        btn.onclick = () => {
            rapport += `[${nowTime()}] ${text}\n`;
            updateReport();
        };
        container.appendChild(btn);
    });

    Object.entries(dept.actions.role).forEach(([name, template]) => {
        const btn = document.createElement("button");
        btn.textContent = name;
        btn.onclick = () => openModal(name, template, false);
        container.appendChild(btn);
    });

    const freeBtn = document.createElement("button");
    freeBtn.textContent = "Note libre (universelle)";
    freeBtn.onclick = () => openModal("Note libre", null, true);
    container.appendChild(freeBtn);
}

/* =========================================
   MODAL
========================================= */

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

function handleReasonChange() {
    const reason = document.getElementById("reasonSelect").value;
    const customField = document.getElementById("customReason");

    if (reason === "Autre") {
        customField.style.display = "block";
    } else {
        customField.style.display = "none";
    }
}

/* =========================================
   CONFIRMATION ACTION
========================================= */

function confirmAction() {

    const role = document.getElementById("roleSelect").value;
    const sector = document.getElementById("sectorSelect").value;
    let reason = document.getElementById("reasonSelect").value;

    if (reason === "Autre") {
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

/* =========================================
   PDF
========================================= */

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const lines = doc.splitTextToSize(rapport, 180);
    doc.text(lines, 10, 10);

    doc.save("rapport_service.pdf");
}

init();