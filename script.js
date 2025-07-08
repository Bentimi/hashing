document.addEventListener('DOMContentLoaded', () => {
    // Hashing functionality
    document.getElementById('hash-md5').addEventListener('click', () => hashAndUpdate('md5'));
    document.getElementById('hash-sha256').addEventListener('click', () => hashAndUpdate('sha256'));
    document.getElementById('hash-hybrid').addEventListener('click', () => hashAndUpdate('hybrid'));

    // Modal functionality
    const modal = document.getElementById('brute-force-modal');
    const openModalBtn = document.getElementById('open-modal-button');
    const closeModalBtn = document.querySelector('.close-button');

    openModalBtn.onclick = () => modal.style.display = 'block';
    closeModalBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // Brute-force attack functionality
    document.getElementById('brute-force-button').addEventListener('click', startBruteForceAttack);
    document.getElementById('paste-button').addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            document.getElementById('hash-to-crack').value = text;
        } catch (err) {
            showToast('Failed to read clipboard contents.');
        }
    });

    // Copy functionality
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const resultElement = document.getElementById(targetId);
            const hash = resultElement.getAttribute('data-hash');
            if (hash) {
                navigator.clipboard.writeText(hash).then(() => {
                    showToast('Hash copied to clipboard!');
                }, () => {
                    showToast('Failed to copy hash.');
                });
            } else {
                showToast('No hash to copy yet.');
            }
        });
    });
});

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

function hashAndUpdate(algorithm) {
    const password = document.getElementById('password').value;
    if (!password) {
        showToast('Please enter a password.');
        return;
    }

    const loader = document.getElementById('hashing-loader');
    const resultsDiv = document.getElementById('results');
    const analysisDiv = document.getElementById('analysis-result');

    // Clear previous analysis and show loader
    analysisDiv.innerText = '';
    loader.style.display = 'block';

    // Hide the specific result item that is about to be updated
    let resultElementId = `${algorithm}-result`;
    const resultElementContainer = document.getElementById(resultElementId).parentElement;
    resultElementContainer.style.visibility = 'hidden';


    setTimeout(() => {
        let hash = '';
        let analysis = '';
        let resultText = '';

        if (algorithm === 'md5') {
            hash = CryptoJS.MD5(password).toString();
            resultText = `MD5 Hash: ${hash} (Length: ${hash.length})`;
            analysis = 'MD5 is a fast but outdated hashing algorithm. It is highly vulnerable to collision attacks, where two different inputs produce the same hash. This makes it unsuitable for security-sensitive applications like password storage. Modern hardware can crack MD5 hashes in seconds.';
        } else if (algorithm === 'sha256') {
            hash = CryptoJS.SHA256(password).toString();
            resultText = `SHA-256 Hash: ${hash} (Length: ${hash.length})`;
            analysis = 'SHA-256 is a widely used and much more secure hashing algorithm than MD5. However, when used without a "salt" (a random value added to the password before hashing), it is vulnerable to rainbow table attacks. A rainbow table is a precomputed table for reversing cryptographic hash functions.';
        } else if (algorithm === 'hybrid') {
            const md5Hash = CryptoJS.MD5(password).toString();
            hash = CryptoJS.SHA256(md5Hash).toString();
            resultText = `Hybrid Hash (SHA-256(MD5)): ${hash} (Length: ${hash.length})`;
            analysis = 'This hybrid approach, while seemingly more complex, does not offer significant security benefits. The initial MD5 hash is still the weak link. An attacker can still use pre-computed MD5 hashes to find a collision and then hash that result with SHA-256. The best practice is to use a modern, slow, and salted hashing algorithm like Argon2, scrypt, or bcrypt.';
        }

        const resultElement = document.getElementById(resultElementId);
        resultElement.innerText = resultText;
        resultElement.setAttribute('data-hash', hash);

        analysisDiv.innerText = analysis;
        loader.style.display = 'none';
        resultsDiv.style.display = 'block'; // Ensure the main results container is visible
        resultElementContainer.style.visibility = 'visible'; // Show the updated result item

    }, 1000); // 1 second delay for loading simulation
}

function startBruteForceAttack() {
    const hashToCrack = document.getElementById('hash-to-crack').value;
    const resultElement = document.getElementById('brute-force-result');
    const statsElement = document.getElementById('brute-force-stats');
    const spinner = document.getElementById('loading-spinner');

    if (!hashToCrack) {
        showToast('Please enter a hash to crack.');
        return;
    }

    resultElement.innerText = '';
    statsElement.innerText = '';
    spinner.style.display = 'block';

    const commonPasswords = [
        'password', '123456', '123456789', 'qwerty', '12345', '12345678', '111111', '1234567', 'sunshine', 'iloveyou',
        'princess', 'admin', 'welcome', '123123', '666666', 'master', 'test', 'dragon', 'monkey', 'shadow',
        'football', 'baseball', 'hockey', 'soccer', 'basketball', 'secret', 'superman', 'batman', 'spiderman',
        'chocolate', 'cookie', 'summer', 'winter', 'spring', 'autumn', 'google', 'yahoo', 'hotmail', 'email',
        'computer', 'internet', 'windows', 'apple', 'samsung', 'android', 'iphone', 'galaxy', 'mustang', 'ferrari'
    ];
    let found = false;
    const startTime = new Date().getTime();

    setTimeout(() => {
        let foundPassword = null;
        let foundAlgo = null;
        for (let i = 0; i < commonPasswords.length; i++) {
            const password = commonPasswords[i];
            if (CryptoJS.MD5(password).toString() === hashToCrack) {
                foundPassword = password;
                foundAlgo = "MD5";
                break;
            }
            if (CryptoJS.SHA256(password).toString() === hashToCrack) {
                foundPassword = password;
                foundAlgo = "SHA-256";
                break;
            }
            if (CryptoJS.SHA256(CryptoJS.MD5(password).toString()).toString() === hashToCrack) {
                foundPassword = password;
                foundAlgo = "Hybrid MD5+SHA-256";
                break;
            }
        }

        const endTime = new Date().getTime();
        const timeTaken = (endTime - startTime) / 1000; // in seconds
        const attempts = commonPasswords.length * 3; // Each password tried against 3 algos
        const throughput = attempts / timeTaken;

        if (foundPassword) {
            resultElement.innerText = `Password found: "${foundPassword}" (using ${foundAlgo})`;
        } else {
            resultElement.innerText = `Password not found in the common password list.`;
        }
        statsElement.innerText = `Time taken: ${timeTaken.toFixed(2)} seconds\nThroughput: ${throughput.toFixed(2)} hashes per second`;
        spinner.style.display = 'none';
    }, 2000); // 2 second delay for loading simulation
}
