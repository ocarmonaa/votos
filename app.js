// Configura Parse (Back4App)
Parse.initialize(
    "lGPgtcHk0i5ynzGmVwVe8rCE4YQcLHz9wl0x5hmn", // Reemplaza con tu Application ID
    "dBtgB1S6YzYytDrr5p13cS65sYYyfwMv0p77ezZL"  // Reemplaza con tu JavaScript Key
);
Parse.serverURL = 'https://parseapi.back4app.com/';

// Datos de los logos
const logos = [
    { id: 'logo1', name: 'Logo 1', imageUrl: 'https://i.ibb.co/fGqCGTff/logo1.jpg' },
    { id: 'logo2', name: 'Logo 2', imageUrl: 'https://i.ibb.co/YFRDRjLf/logo2.jpg' },
    { id: 'logo3', name: 'Logo 3', imageUrl: 'https://i.ibb.co/gbL0sxCh/logo3.jpg' },
    { id: 'logo4', name: 'Logo 4', imageUrl: 'https://i.ibb.co/4nZ1Xbnx/logo4.jpg' },
    { id: 'logo5', name: 'Logo 5', imageUrl: 'https://i.ibb.co/pNVvgh9/logo5.jpg' }
];

let selectedLogo = null;
let votesData = {};

// Cargar la interfaz
document.addEventListener('DOMContentLoaded', () => {
    renderLogos();
    fetchVotes();
    
    // Actualizar resultados cada 5 segundos
    setInterval(fetchVotes, 5000);
});

// Renderizar los logos para votación
function renderLogos() {
    const container = document.getElementById('logosContainer');
    container.innerHTML = '';
    
    logos.forEach(logo => {
        const logoCard = document.createElement('div');
        logoCard.className = 'logo-card';
        logoCard.id = `card-${logo.id}`;
        logoCard.innerHTML = `
            <img src="${logo.imageUrl}" alt="${logo.name}">
            <h3>${logo.name}</h3>
            <div class="vote-count" id="count-${logo.id}">0 votos</div>
        `;
        
        logoCard.addEventListener('click', () => voteForLogo(logo.id));
        container.appendChild(logoCard);
    });
}

// Renderizar los resultados
function renderResults() {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    
    // Calcular total de votos para porcentajes
    const totalVotes = Object.values(votesData).reduce((sum, votes) => sum + votes, 0);
    
    logos.forEach(logo => {
        const votes = votesData[logo.id] || 0;
        const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
        
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <div class="result-label">${logo.name}</div>
            <div class="result-bar-container">
                <div class="result-bar" id="bar-${logo.id}" style="width: ${percentage}%"></div>
            </div>
            <div class="result-votes" id="votes-${logo.id}">${votes}</div>
        `;
        container.appendChild(resultItem);
    });
    
    // Actualizar contadores en las tarjetas
    logos.forEach(logo => {
        const votes = votesData[logo.id] || 0;
        const countElement = document.getElementById(`count-${logo.id}`);
        if (countElement) {
            countElement.textContent = `${votes} voto${votes !== 1 ? 's' : ''}`;
        }
    });
}

// Votar por un logo
async function voteForLogo(logoId) {
    try {
        // Mostrar selección visual
        if (selectedLogo) {
            document.getElementById(`card-${selectedLogo}`).classList.remove('selected');
        }
        selectedLogo = logoId;
        document.getElementById(`card-${logoId}`).classList.add('selected');
        
        // Enviar voto a Back4App
        const Votes = Parse.Object.extend("Votes");
        const query = new Parse.Query(Votes);
        query.equalTo("logo", logoId);
        const result = await query.first();
        
        if (result) {
            result.increment("votes", 1);
            await result.save();
        } else {
            const newVote = new Votes();
            newVote.set("logo", logoId);
            newVote.set("votes", 1);
            await newVote.save();
        }
        
        // Mostrar mensaje de confirmación
        showConfirmationMessage();
        
        // Actualizar resultados
        fetchVotes();
    } catch (error) {
        console.error('Error al votar:', error);
        showConfirmationMessage('Error al registrar el voto', true);
    }
}

// Obtener votos de Back4App
async function fetchVotes() {
    try {
        const Votes = Parse.Object.extend("Votes");
        const query = new Parse.Query(Votes);
        const results = await query.find();
        
        const votes = {};
        results.forEach(item => {
            votes[item.get("logo")] = item.get("votes");
        });
        
        // Asegurar que todos los logos estén en los datos
        logos.forEach(logo => {
            if (!votes[logo.id]) votes[logo.id] = 0;
        });
        
        votesData = votes;
        renderResults();
    } catch (error) {
        console.error('Error al obtener votos:', error);
    }
}

// Mostrar mensaje de confirmación
function showConfirmationMessage(message = null, isError = false) {
    const confirmationMessage = document.getElementById('confirmationMessage');
    
    if (message) {
        confirmationMessage.textContent = message;
    }
    
    if (isError) {
        confirmationMessage.style.backgroundColor = '#ff4444';
    } else {
        confirmationMessage.style.backgroundColor = 'var(--success-bg)';
    }
    
    confirmationMessage.classList.add('show');
    
    setTimeout(() => {
        confirmationMessage.classList.remove('show');
    }, 3000);
}