const { Resend } = require('resend');

const resend = new Resend('re_QRYpW9zn_KNxMPAFL11UmEEc3QchE19hA'); // Votre clé API

async function testFullAPI() {
    const url = 'http://localhost:3000/api/auth/send-verification';
    const email = 'support@study-track.site'; // Remplacez par votre email si besoin

    console.log('--- Test API complète avec Firebase + Resend ---');
    console.log('Cible :', url);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        console.log('Status HTTP :', response.status);
        console.log('Réponse :', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('✅ Succès ! Vérifiez le dashboard Resend pour l\'ID :', data.data.id);
        } else {
            console.error('❌ Échec de l\'API :', data.error || 'Erreur inconnue');
        }
    } catch (error) {
        console.error('❌ Impossible de contacter le serveur :', error.message);
    }
}

testFullAPI();
