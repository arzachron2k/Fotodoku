/* --- UI & EINSTELLUNGEN LOGIK --- */
let staffList = JSON.parse(localStorage.getItem('sh_staff')) || ["Christian"];

function toggleSettings(show) { document.getElementById('settings-modal').style.display = show ? 'flex' : 'none'; }
function toggleHelp(show) { document.getElementById('help-modal').style.display = show ? 'flex' : 'none'; }

function renderStaffLists() {
    const select = document.getElementById('staff-name');
    const adminList = document.getElementById('staff-list-admin');
    const lastStaff = localStorage.getItem('sh_last_staff');
    
    select.innerHTML = '<option value="" disabled selected>Mitarbeiter wählen...</option>';
    staffList.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name; opt.innerText = name;
        if(name === lastStaff) opt.selected = true;
        select.appendChild(opt);
    });

    adminList.innerHTML = "";
    staffList.forEach((name, index) => {
        const div = document.createElement('div');
        div.className = "flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-700 mb-1 text-sm";
        div.innerHTML = `<span>${name}</span><button onclick="removeStaffMember(${index})" class="text-red-500 font-bold px-2">✕</button>`;
        adminList.appendChild(div);
    });
    localStorage.setItem('sh_staff', JSON.stringify(staffList));
}

function saveLastStaff() { localStorage.setItem('sh_last_staff', document.getElementById('staff-name').value); }
function addStaffMember() {
    const input = document.getElementById('new-staff-name');
    if(input.value.trim()) { staffList.push(input.value.trim()); input.value = ""; renderStaffLists(); }
}
function removeStaffMember(index) { staffList.splice(index, 1); renderStaffLists(); }

/* --- INSTALL BANNER LOGIK --- */
function checkInstallBanner() {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const isDismissed = sessionStorage.getItem('installBannerDismissed');
    
    if (!isPWA && !isDismissed) {
        showBannerUI();
    }
}

// Neue Funktion für den manuellen Aufruf über das Zahnrad
function forceShowBanner() {
    showBannerUI();
    toggleSettings(false); // Einstellungen schließen
}

function showBannerUI() {
    const banner = document.getElementById('install-banner');
    if (!/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        banner.querySelector('p:last-child').innerHTML = 'Tippe auf die <strong>drei Punkte ⋮</strong><br>und dann auf <strong>"App installieren"</strong>';
    }
    banner.classList.remove('hidden');
}

function closeInstallBanner() {
    document.getElementById('install-banner').classList.add('hidden');
    sessionStorage.setItem('installBannerDismissed', 'true');
}

window.onload = () => { 
    renderStaffLists(); 
    checkInstallBanner();
};