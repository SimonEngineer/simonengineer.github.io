const clientId = 'Ov23lieHUGJofdhVvn94'; //Local
// const clientId = 'Ov23liyzz1YTD4vxz4NH';
const redirectUri = 'http://localhost:3000'; //Local
// const redirectUri = 'https://simonengineer.github.io';
const scope = 'repo'; // You need "repo" scope to create PRs

// Step 1: Generate code_verifier and code_challenge
function generateRandomString(length:number) {
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
}

async function generateCodeChallenge(codeVerifier:string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function loginToGithub() {
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store the verifier for later
    localStorage.setItem('code_verifier', codeVerifier);

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope,
        state: 'random_state_string',
        allow_signup: 'true',
        response_type: 'code',
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
    });

    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
}

export async function getGithubAccessToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const codeVerifier = localStorage.getItem('code_verifier');

    if (!code) {
        console.log('No code found in URL.');
        return;
    }

    const data = {
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
    };

    const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log('Access Token:', result.access_token);

    return result.access_token as string;
}
