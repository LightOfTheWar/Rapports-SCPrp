let startTime = null;
let rapport = "";
let currentDepartment = null;

/*
========================================
CONFIGURATION DYNAMIQUE DES DÉPARTEMENTS
========================================
Pour ajouter un nouveau département :
1. Copier un bloc
2. Ajouter les actions
Rien d’autre à modifier.
*/

const DEPARTMENT_CONFIG = {

    "Sécuritaire": {
        simple: {
            "Fuite ventilation": "Un Classe-D a tenté de s'échapper par la ventilation et a été neutralisé.",
            "Franchissement ligne rouge": "Un Classe-D a franchi la ligne rouge et a été abattu.",
            "Émeute": "Une émeute de Classe-D a éclaté.",
            "SCP déconf": "Un SCP a été détecté en dehors de son confinement."
        },

        roleActions: {
            "Exécution": "{role} a été exécuté.",
            "TAZE": "{role} a été arrêté à l'aide du TAZER.",
            "ISO": "{role} a été placé à l'isolement.",
            "Combat armé": "{role} a été impliqué dans un combat armé."
        }
    },

    "Scientifique": {
        simple: {
            "Test SCP": "Un test sur un SCP a été effectué.",
            "Incident laboratoire": "Un incident a eu lieu en laboratoire.",
            "Manipulation dangereuse": "Une manipulation dangereuse a été signalée."
        },

        roleActions: {
            "Expérience non autorisée": "{role} a effectué une expérience non autorisée.",
            "Blessure en test": "{role} a été blessé durant un test.",
            "Mise en quarantaine": "{role} a été placé en quarantaine."
        }
    },

    "Administratif": {
        simple: {
            "Réunion direction": "Une réunion de direction a eu lieu.",
            "Audit interne": "Un audit interne a été effectué."
        },

        roleActions: {
            "Sanction disciplinaire": "{role} a reçu une sanction disciplinaire.",
            "Promotion": "{role} a été promu."
        }
    }

};

/*
========================================
FONCTIONS PRINCIPALES
========================================
*/

function nowTime() {
    return new Date().toLocaleTimeString();
}

function updateReport() {
    document.getElementById("reportBox").value = rapport;
}

function startService() {

    const matricule = prompt("Matricule :") || "Inconnu";

    const deptList = Object.keys(DEPARTMENT_CONFIG).join("\n");
    const dept = prompt("Choisir un département :\n\n" + deptList);

    if (!DEPARTMENT_CONFIG[dept]) {
        alert("Département invalide.");
        return;
    }

    currentDepartment = dept;
    startTime = new Date();

    rapport =
        `RAPPORT DE SERVICE\n` +
        `Date : ${startTime.toLocaleDateString()}\n` +
        `Nom de code : ${matricule}\n` +
        `Département : ${dept}\n` +
        `Heure de prise de service : ${startTime.toLocaleTimeString()}\n\n` +
        `RAPPORT :\n`;

    generateActionButtons();
    updateReport();
}

function endService() {
    if (!startTime) return;

    rapport += `\nFin de service à : ${nowTime()}\n`;
    updateReport();
}

function copyReport() {
    navigator.clipboard.writeText(rapport);
}

function addEventEnd() {
    if (!startTime) return;

    rapport += `[${nowTime()}] Fin de l'événement.\n`;
    updateReport();
}

/*
========================================
GÉNÉRATION DYNAMIQUE DES BOUTONS
========================================
*/

function generateActionButtons() {

    const container = document.getElementById("actions");
    container.innerHTML = ""; // reset

    const config = DEPARTMENT_CONFIG[currentDepartment];

    // Actions simples
    Object.entries(config.simple).forEach(([name, text]) => {
        const btn = document.createElement("button");
        btn.innerText = name;
        btn.onclick = () => {
            rapport += `[${nowTime()}] ${text}\n`;
            updateReport();
        };
        container.appendChild(btn);
    });

    // Actions avec rôle
    Object.entries(config.roleActions).forEach(([name, template]) => {
        const btn = document.createElement("button");
        btn.innerText = name;
        btn.onclick = () => handleRoleAction(template);
        container.appendChild(btn);
    });
}

function handleRoleAction(template) {

    if (!startTime) return;

    const role = prompt("Rôle concerné :");
    const sector = prompt("Secteur :");
    const reason = prompt("Raison (optionnel) :");

    let text = template.replace("{role}", role);

    rapport += `[${nowTime()}] ${text}` +
        (reason ? ` Raison : ${reason}.` : "") +
        (sector ? ` (Secteur : ${sector}).` : "") +
        `\n`;

    updateReport();
}