/* --- KAMERA & FOTO LOGIK --- */
let photos = [];
let currentStaff = "";
const bannerImg = new Image(); bannerImg.src = "banner.png"; 

async function initCamera() {
    const staffSelect = document.getElementById('staff-name');
    currentStaff = staffSelect.value;
    const name = document.getElementById('client-name').value;
    
    if(!currentStaff || !name) return alert("Mitarbeiter und Kunde fehlen!");
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } } });
        document.getElementById('video-preview').srcObject = stream;
        document.getElementById('setup-form').classList.add('hidden');
        document.getElementById('camera-section').classList.remove('hidden');
        document.getElementById('display-info').innerText = `${name} | ${currentStaff}`;
    } catch (err) { alert("Kamera-Fehler: " + err); }
}

function takePhoto() {
    if(photos.length >= 10) return;
    const video = document.getElementById('video-preview');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    if(bannerImg.complete) {
        ctx.save(); ctx.globalCompositeOperation = "multiply"; 
        const bW = canvas.width * 0.20; const bH = (bannerImg.naturalHeight / bannerImg.naturalWidth) * bW;
        ctx.drawImage(bannerImg, canvas.width - bW - 40, 40, bW, bH); ctx.restore();
    }

    const name = document.getElementById('client-name').value;
    const dob = document.getElementById('project-dob').value;
    const product = document.getElementById('product-info').value;
    const footer = `${name} (${dob}) - ${product} - ${currentStaff}`;
    
    ctx.font = `bold ${Math.floor(canvas.width/60)}px sans-serif`;
    ctx.fillStyle = "white"; ctx.textAlign = "right";
    ctx.shadowColor = "black"; ctx.shadowBlur = 4;
    ctx.fillText(footer, canvas.width - 40, canvas.height - 40);

    canvas.toBlob((blob) => {
        const safeName = name.replace(/[^a-z0-9]/gi, '_').substring(0,15);
        const file = new File([blob], `Doku_${safeName}_${photos.length+1}.jpg`, { type: "image/jpeg" });
        photos.push(file); updateUI();
    }, "image/jpeg", 0.9);
}

function updateUI() {
    document.getElementById('photo-count').innerText = `${photos.length} / 10`;
    const gallery = document.getElementById('gallery'); gallery.innerHTML = "";
    photos.forEach((p) => {
        const div = document.createElement('div');
        div.className = "thumb-container";
        div.innerHTML = `<img src="${URL.createObjectURL(p)}" class="w-full h-full object-cover rounded-lg border border-blue-500">`;
        gallery.prepend(div);
    });
    document.getElementById('share-btn').classList.toggle('hidden', photos.length === 0);
}

async function sharePhotos() {
    const name = document.getElementById('client-name').value;
    const dob = document.getElementById('project-dob').value;
    const product = document.getElementById('product-info').value;
    const emailSubject = `Für Kostenvoranschlag/Doku, ${name}, ${dob}, ${product}`;

    if (navigator.share) {
        try { await navigator.share({ files: photos, title: emailSubject, text: emailSubject }); }
        catch (e) { console.log("Abgebrochen"); }
    }
}