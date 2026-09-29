/* --- KAMERA & FOTO ENGINE (v8.9.4 - MIT BANNER.PNG & DATENSCHUTZ) --- */
let photos = [];
const maxPhotos = 10;
let currentStaff = "";

// Hier laden wir jetzt die richtige Datei: banner.png!
const bannerImg = new Image();
bannerImg.src = "banner.png";

async function initCamera() {
    const staffSelect = document.getElementById('staff-name');
    currentStaff = staffSelect.value;
    const name = document.getElementById('client-name').value.trim();
    const clientNumber = document.getElementById('client-number').value.trim();

    if (!currentStaff || !name) {
        return alert("Bitte Mitarbeiter und Kundenname eingeben!");
    }
    if (!clientNumber) {
        return alert("Bitte Kundennummer eingeben!");
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }, 
            audio: false 
        });
        document.getElementById('video-preview').srcObject = stream;
        
        document.body.classList.add('camera-active');
        document.getElementById('display-info').innerText = `Kd-Nr: ${clientNumber} | ${currentStaff}`;
    } catch (err) { 
        alert("Kamera-Fehler: " + err); 
    }
}

function takePhoto() {
    if (photos.length >= maxPhotos) return;
    const video = document.getElementById('video-preview');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth; 
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const clientNumber = document.getElementById('client-number').value.trim();
    const product = document.getElementById('product-info').value.trim();
    const margin = 40;

    // --- 1. ORIGINAL FIRMEN-BANNER OBEN RECHTS (TRANSPARENT) ---
    if (bannerImg.complete && bannerImg.naturalWidth !== 0) {
        // Banner-Breite ca. 24% der Bildbreite
        const bannerW = canvas.width * 0.24;
        const bannerH = (bannerImg.naturalHeight / bannerImg.naturalWidth) * bannerW;
        const x = canvas.width - bannerW - margin;
        const y = margin;

        // Direkt ohne Kasten transparent einzeichnen
        ctx.drawImage(bannerImg, x, y, bannerW, bannerH);
    }

    // --- 2. DATENSCHUTZ-STEMPEL UNTEN RECHTS ---
    const footerText = product ? `Kd.-Nr.: ${clientNumber} - ${product}` : `Kd.-Nr.: ${clientNumber}`;
    const footerFontSize = Math.floor(canvas.width / 48);
    ctx.font = `bold ${footerFontSize}px sans-serif`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 8;
    ctx.fillText(footerText, canvas.width - margin, canvas.height - margin);
    ctx.shadowBlur = 0;

    // Dateiname für den internen Export
    const rawName = document.getElementById('client-name').value;
    const safeName = rawName.replace(/[^a-z0-9]/gi, '_').substring(0, 15);

    canvas.toBlob((blob) => {
        const file = new File([blob], `Doku_${clientNumber}_${safeName}_${photos.length + 1}.jpg`, { type: "image/jpeg" });
        photos.push(file);
        updateGallery();
    }, "image/jpeg", 0.90);
}

function updateGallery() {
    document.getElementById('photo-count').innerText = `${photos.length} / ${maxPhotos}`;
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = "";
    photos.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = "thumb-container";
        div.innerHTML = `<img src="${URL.createObjectURL(p)}" class="w-full h-full object-cover rounded-lg border border-blue-500 shadow-md">
                         <div onclick="photos.splice(${i},1);updateGallery()" class="absolute -top-1 -right-1 bg-red-600 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg">✕</div>`;
        gallery.prepend(div);
    });
    document.getElementById('share-btn').classList.toggle('hidden', photos.length === 0);
}

async function sharePhotos() {
    const name = document.getElementById('client-name').value.trim();
    const clientNumber = document.getElementById('client-number').value.trim();
    const dob = document.getElementById('project-dob').value.trim();
    const product = document.getElementById('product-info').value.trim();

    const details = [
        `Kd-Nr: ${clientNumber}`,
        name,
        dob ? `Geb: ${dob}` : null,
        product ? `Versorgung: ${product}` : null
    ].filter(Boolean).join(', ');

    const emailSubject = `Für Kostenvoranschlag/Doku, ${details}`;

    if (navigator.share) {
        try {
            await navigator.share({
                files: photos,
                title: emailSubject,
                text: emailSubject
            });
        } catch (e) {
            console.log("Teilen abgebrochen");
        }
    } else {
        alert("Teilen wird von diesem Browser nicht unterstützt.");
    }
}
