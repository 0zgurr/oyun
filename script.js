const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Başlat Butonu
const startButton = document.getElementById('startButton');

// Oyun Nesneleri
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height / 2 - 25,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0,
    dy: 0,
    image: new Image()
};

player.image.src = 'images/character.png'; // Karakter görselinizin yolu

const hamburgers = [];
const hamburgerImage = new Image();
hamburgerImage.src = 'images/hamburger.png'; // Hamburger görselinizin yolu

const enemies = []; // Düşman karakterlerini depolamak için dizi
const maxEnemies = 3; // Aynı anda maksimum düşman sayısı

let maxHamburgers = 5;

// Skor ve Boyut
let score = 0;
let playerSizeMultiplier = 1;

// Klavye Kontrolleri
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Ses Efektleri
const collectSound = new Audio('sounds/collect.mp3');
const gameOverSound = new Audio('sounds/gameover.mp3');
const backgroundMusic = new Audio('sounds/background.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

// Ses Dosyalarının Yüklendiğini Kontrol Etme
backgroundMusic.addEventListener('canplaythrough', () => {
    console.log('Arka plan müziği hazır.');
}, false);

backgroundMusic.addEventListener('error', (e) => {
    console.error('Arka plan müziği yüklenemedi:', e);
}, false);

collectSound.addEventListener('canplaythrough', () => {
    console.log('Toplama sesi hazır.');
}, false);

collectSound.addEventListener('error', (e) => {
    console.error('Toplama sesi yüklenemedi:', e);
}, false);

gameOverSound.addEventListener('canplaythrough', () => {
    console.log('Oyun sonu sesi hazır.');
}, false);

gameOverSound.addEventListener('error', (e) => {
    console.error('Oyun sonu sesi yüklenemedi:', e);
}, false);

// Hamburger Sınıfı
class Hamburger {
    constructor() {
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = Math.random() * (canvas.height - this.height);
        this.speed = 2 + score * 0.05; // Skora bağlı olarak hız artar
    }

    draw() {
        ctx.drawImage(hamburgerImage, this.x, this.y, this.width, this.height);
    }

    update() {
        // Hamburgerin karakterden kaçması
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) { // Karaktere yakınsa kaçsın
            // Hesaplanan hareket miktarı
            const moveX = (dx / distance) * this.speed;
            const moveY = (dy / distance) * this.speed;

            // Yeni pozisyonları hesapla
            let newX = this.x + moveX;
            let newY = this.y + moveY;

            // Canvas sınırlarını kontrol et ve pozisyonu sınırlandır
            // Sol sınır
            if (newX < 0) {
                newX = 0;
            }
            // Sağ sınır
            if (newX + this.width > canvas.width) {
                newX = canvas.width - this.width;
            }
            // Üst sınır
            if (newY < 0) {
                newY = 0;
            }
            // Alt sınır
            if (newY + this.height > canvas.height) {
                newY = canvas.height - this.height;
            }

            // Güncellenmiş pozisyonları ata
            this.x = newX;
            this.y = newY;
        }
    }
}

// Enemy (Düşman) Sınıfı
class Enemy {
    constructor() {
        this.width = 50;
        this.height = 50;
        // Düşmanı rastgele bir kenardan başlat (üst, alt, sol, sağ)
        const edge = Math.floor(Math.random() * 4);
        switch(edge) {
            case 0: // Üst
                this.x = Math.random() * (canvas.width - this.width);
                this.y = -this.height;
                break;
            case 1: // Alt
                this.x = Math.random() * (canvas.width - this.width);
                this.y = canvas.height;
                break;
            case 2: // Sol
                this.x = -this.width;
                this.y = Math.random() * (canvas.height - this.height);
                break;
            case 3: // Sağ
                this.x = canvas.width;
                this.y = Math.random() * (canvas.height - this.height);
                break;
        }
        this.speed = 3; // Düşmanın hızı
        this.image = new Image();
        this.image.src = 'images/enemy.png'; // Düşman görselinizin yolu
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        // Düşmanın oyuncuyu kovalaması
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) { // Bölme hatasını önlemek için
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }

        // Canvas sınırlarını kontrol et ve sınırlamalar yap
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
    }
}

// Hamburger Ekleme
function spawnHamburger() {
    if (hamburgers.length < maxHamburgers) {
        hamburgers.push(new Hamburger());
    }
}

// Düşman Ekleme Fonksiyonu
function spawnEnemy() {
    if (enemies.length < maxEnemies) {
        enemies.push(new Enemy());
    }
}

// Oyun Döngüsü Kontrolü
let gameRunning = false;
let updateId;
let movePlayerId;

// Oyun Döngüsü
function update() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Karakteri Çizme
    ctx.drawImage(player.image, player.x, player.y, player.width * playerSizeMultiplier, player.height * playerSizeMultiplier);
    
    // Hamburgerleri Çizme ve Güncelleme
    hamburgers.forEach((hamburger, index) => {
        hamburger.update();
        hamburger.draw();

        // Çarpışma Kontrolü
        if (isColliding(player, hamburger)) {
            hamburgers.splice(index, 1);
            score += 10;
            playerSizeMultiplier += 0.05; // Karakteri büyütme
            collectSound.play(); // Ses efekti çal
        }
    });

    // Düşmanları Çizme ve Güncelleme
    enemies.forEach((enemy, index) => {
        enemy.update();
        enemy.draw();

        // Çarpışma Kontrolü (Düşman ile oyuncu)
        if (isColliding(player, enemy)) {
            endGame(); // Oyun biter
        }
    });

    // Skoru Sağ Üst Köşeye Gösterme
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Skor: ${score}`, canvas.width - 10, 30);

    // Kalan Süreyi Sol Üst Köşeye Gösterme
    ctx.fillStyle = '#FF0000'; // Kırmızı renk
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Kalan Süre: ${timeLeft} saniye`, 10, 30);

    // Zaman Çubuğu
    const barWidth = 200;
    const barHeight = 20;
    const barX = canvas.width / 2 - barWidth / 2;
    const barY = 50;

    ctx.save(); // Mevcut çizim durumunu kaydet

    // Çerçeve için yarı şeffaf siyah
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 2; // Çerçeve kalınlığı
    ctx.strokeRect(barX, barY, barWidth, barHeight); // Çerçeveyi çiz

    // Dolu kısmı için yarı şeffaf kırmızı
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    const timeRatio = timeLeft / gameDuration;
    ctx.fillRect(barX, barY, barWidth * timeRatio, barHeight); // Dolu kısmı çiz

    ctx.restore(); // Önceki çizim durumuna geri dön

    // Karakterin Hareketi
    player.x += player.dx;
    player.y += player.dy;

    // Sınır Kontrolleri
    if (player.x < 0) player.x = 0;
    if (player.x + player.width * playerSizeMultiplier > canvas.width) player.x = canvas.width - player.width * playerSizeMultiplier;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height * playerSizeMultiplier > canvas.height) player.y = canvas.height - player.height * playerSizeMultiplier;

    updateId = requestAnimationFrame(update);
}

// Hareket Fonksiyonu
function movePlayer() {
    if (!gameRunning) return;

    // Klavye kontrolleri ile karakterin hareketini belirleme
    if (keys.ArrowUp) {
        player.dy = -player.speed;
    } else if (keys.ArrowDown) {
        player.dy = player.speed;
    } else {
        player.dy = 0;
    }

    if (keys.ArrowLeft) {
        player.dx = -player.speed;
    } else if (keys.ArrowRight) {
        player.dx = player.speed;
    } else {
        player.dx = 0;
    }

    movePlayerId = requestAnimationFrame(movePlayer);
}

// Oyun süresi (örneğin, 60 saniye)
const gameDuration = 60; // saniye
let timeLeft = gameDuration;

// Oyun zamanlayıcıları
let hamburgerInterval = setInterval(() => {
    spawnHamburger();
}, 3000); // 3 saniye aralıklarla hamburger ekler

let enemyInterval = setInterval(() => {
    spawnEnemy();
}, 5000); // 5 saniye aralıklarla düşman ekler

let timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endGame();
    }
}, 1000);

// Çarpışma Algılama Fonksiyonu
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width * playerSizeMultiplier > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height * playerSizeMultiplier > rect2.y;
}

// Oyun Sonu Fonksiyonu
function endGame() {
    // Oyun döngüsünü durdur
    gameRunning = false;
    cancelAnimationFrame(updateId);
    cancelAnimationFrame(movePlayerId);
    clearInterval(hamburgerInterval);
    clearInterval(timerInterval);
    clearInterval(enemyInterval); // Düşman zamanlayıcısını durdur
    backgroundMusic.pause();

    // Oyun alanını temizle
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Oyun Bitti!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText(`Skorunuz: ${score}`, canvas.width / 2, canvas.height / 2 + 30);

    gameOverSound.play(); // Oyun sonu sesi çal

    // Yeniden Başlatma Butonu
    const restartButton = document.createElement('button');
    restartButton.innerText = 'Yeniden Başlat';
    restartButton.style.position = 'absolute';
    restartButton.style.top = `${canvas.offsetTop + canvas.height + 20}px`;
    restartButton.style.left = `${canvas.offsetLeft + canvas.width / 2 - 50}px`;
    restartButton.style.padding = '10px 20px';
    restartButton.style.fontSize = '16px';
    document.body.appendChild(restartButton);

    restartButton.addEventListener('click', () => {
        // Başlangıç değerlerini sıfırla
        score = 0;
        playerSizeMultiplier = 1;
        player.x = canvas.width / 2 - 25;
        player.y = canvas.height / 2 - 25;
        hamburgers.length = 0;
        enemies.length = 0; // Düşmanları temizle
        timeLeft = gameDuration;

        // Butonu kaldır
        restartButton.remove();

        // Oyunu yeniden başlat
        backgroundMusic.currentTime = 0; // Müziği başa sar
        backgroundMusic.play().catch((error) => {
            console.error('Arka plan müziği çalınamadı:', error);
        });
        gameRunning = true;
        update();
        movePlayer();

        // Zamanlayıcıları yeniden başlat
        hamburgerInterval = setInterval(() => {
            spawnHamburger();
        }, 3000);

        enemyInterval = setInterval(() => {
            spawnEnemy();
        }, 5000);

        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endGame();
            }
        }, 1000);
    });
}

// Klavye Event Listener'ları
document.addEventListener('keydown', (e) => {
    if (e.key in keys) {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key in keys) {
        keys[e.key] = false;
    }
});

// Başlat Butonu Etkileşimi
startButton.addEventListener('click', () => {
    startButton.style.display = 'none'; // Butonu gizle
    backgroundMusic.play().catch((error) => {
        console.error('Arka plan müziği çalınamadı:', error);
    }); // Arka plan müziğini başlat
    gameRunning = true; // Oyun döngüsünü başlat
    update();
    movePlayer();
});

// Görseller Yüklendiğinde
player.image.onload = () => {
    hamburgerImage.onload = () => {
        // Oyun başlamadan önce herhangi bir şey yapmıyoruz
    };
};
