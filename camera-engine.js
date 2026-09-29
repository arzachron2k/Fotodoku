/* --- KAMERA & FOTO ENGINE (AUTOMATISCHER WEISS-FILTER FÜR LOGO) --- */
let photos = [];
const maxPhotos = 10;
let currentStaff = "";

// Temporäres Canvas für den automatischen Weiß-Abzug
let processedLogoCanvas = null;
const rawLogo = new Image();
rawLogo.src = "logo.png";

rawLogo.onload = () => {
    // Weiß-Filter: Entfernt den weißen Hintergrund direkt im Speicher
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = rawLogo.naturalWidth;
    tempCanvas.height = rawLogo.naturalHeight;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(rawLogo, 0, 0);

    const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const d = imgData.data;

    for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        // Wenn der Pixel weiß oder fast weiß ist (Schwellenwert 225), Alpha auf 0
        if (r > 225 && g > 225 && b > 225) {
            d[i + 3] = 0;
        }
    }
    tempCtx.putImageData(imgData, 0, 0);
    processedLogoCanvas = tempCanvas;
};

async function initCamera() {
    const staffSelect = document.getElementById('staff-name');
    currentStaff = staffSelect.value;
    const name = document.getElementById('client-name').value.trim();
    const clientNumber = document.getElementById('client-number').value.trim();

    if(!currentStaff || !name) {
        return alert("Bitte Mitarbeiter und Kundenname eingeben!");
    }
    if(!clientNumber) {
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
    if(photos.length >= maxPhotos) return;
    const video = document.getElementById('video-preview');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth; 
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const clientNumber = document.getElementById('client-number').value.trim();
    const product = document.getElementById('product-info').value.trim();
    const margin = 40;

    // FREIGESTELLTES LOGO STEMPELN
    const logoSource = processedLogoCanvas || (rawLogo.complete && rawLogo.naturalWidth ? rawLogo : null);
    if(logoSource) {
        const logoW = canvas.width * 0.16;
        const logoH = (logoSource.height / logoSource.width) * logoW;
        const x = canvas.width - logoW - margin;
        const y = margin;

        ctx.drawImage(logoSource, x, y, logoW, logoH);
    }

    // DATENSCHUTZ-STEMPEL: Nur Kd.-Nr. und Versorgung
    const footerText = product ? `Kd.-Nr.: ${clientNumber} - ${product}` : `Kd.-Nr.: ${clientNumber}`;

    const fontSize = Math.floor(canvas.width / 45);
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 8;
    ctx.fillText(footerText, canvas.width - margin, canvas.height - margin);
    ctx.shadowBlur = 0;

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
