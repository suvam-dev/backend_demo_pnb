
// Load history from localStorage
let scanHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]');

// Display history on page load
window.addEventListener('DOMContentLoaded', renderHistory);

function scan(event) {
    event.preventDefault();
    
    const site = document.getElementById("site").value.trim();
    const resultDiv = document.getElementById("result");
    const scanBtn = document.getElementById("scanBtn");
    
    // Show loading state
    scanBtn.disabled = true;
    scanBtn.textContent = 'Scanning...';
    resultDiv.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Analyzing ${site}...</p>
        </div>
    `;

    fetch("http://127.0.0.1:9000/api/scan/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            target: site
        })
    })
    .then(res => res.json())
    .then(data => {
        let r = data[0];
        
        // Add to history
        addToHistory(r);
        
        // Display result
        displayResult(r);
        
        // Reset button
        scanBtn.disabled = false;
        scanBtn.textContent = 'Scan Now';
    })
    .catch(err => {
        resultDiv.innerHTML = `
            <div class="error">
                <strong>❌ Error:</strong> ${err.message || 'Failed to connect to scanner API. Make sure the backend is running on port 9000.'}
            </div>
        `;
        scanBtn.disabled = false;
        scanBtn.textContent = 'Scan Now';
    });
}

function displayResult(r) {
    const isSafe = r.quantum_safe === 'Yes' || r.quantum_safe === true;
    const certClass = isSafe ? 'cert-safe' : 'cert-risk';
    const sealClass = isSafe ? 'seal-safe' : getRiskSealClass(r.t2qb_risk_level);
    const sealText = isSafe ? 'Verified<br>Safe' : 'Action<br>Required';
    const textColorClass = isSafe ? 'cert-safe-text' : getRiskTextClass(r.t2qb_risk_level);
    
    const reasonText = r.reason ? r.reason : 'No additional reasons provided.';
    const remediationText = r.actionable_remediation ? r.actionable_remediation : 'No immediate action required.';
    
    let jwtSection = '';
    if (r.w3c_credential_jwt) {
        jwtSection = `
            <div class="cert-section jwt-section">
                <h4>W3C Verifiable Credential</h4>
                <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 8px;">Quantum-Ready Digital Label (JWT)</p>
                <pre>${r.w3c_credential_jwt}</pre>
            </div>
        `;
    }

    let certificateHTML = `
        <div class="certificate ${certClass}">
            <div class="cert-header">
                <h2 class="cert-title">Security Certificate</h2>
                <div class="cert-subtitle">Quantum TLS Readiness Assessment</div>
            </div>
            
            <div class="cert-body">
                <div class="cert-main-subject">
                    <span class="cert-label">Subject Entity</span>
                    <div class="cert-domain">${r.host}</div>
                </div>

                <div class="cert-info-grid">
                    <div class="cert-item">
                        <span class="cert-label">Quantum Safe</span>
                        <span class="cert-value ${textColorClass}">${r.quantum_safe}</span>
                    </div>
                    <div class="cert-item">
                        <span class="cert-label">Risk Level</span>
                        <span class="cert-value ${textColorClass}">${r.t2qb_risk_level}</span>
                    </div>
                    <div class="cert-item">
                        <span class="cert-label">TLS Version</span>
                        <span class="cert-value">${r.tls_version}</span>
                    </div>
                    <div class="cert-item">
                        <span class="cert-label">Cipher Suite</span>
                        <span class="cert-value">${r.cipher_suite}</span>
                    </div>
                    <div class="cert-item">
                        <span class="cert-label">Algorithm</span>
                        <span class="cert-value">${r.public_key_algorithm}</span>
                    </div>
                    <div class="cert-item">
                        <span class="cert-label">Key Size</span>
                        <span class="cert-value">${r.key_size} bits</span>
                    </div>
                </div>
                
                <div class="cert-section">
                    <h4>Diagnosis</h4>
                    <pre style="background: transparent; color: #334155; padding: 0; font-family: inherit; font-size: 1rem;">${reasonText}</pre>
                </div>

                <div class="cert-section remediation-section">
                    <h4>Remediation Advice</h4>
                    <pre>${remediationText}</pre>
                </div>

                ${jwtSection}

                <div class="cert-footer">
                    <div class="cert-signature">
                        <div class="cert-signature-line"></div>
                        <span style="font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Authorized Scanner Signature</span>
                    </div>
                    <div class="cert-seal ${sealClass}">
                        ${sealText}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById("result").innerHTML = certificateHTML;
}

function addToHistory(result) {
    const historyItem = {
        ...result,
        timestamp: new Date().toISOString(),
        id: Date.now()
    };
    
    scanHistory.unshift(historyItem);
    
    // Keep only last 50 scans
    if (scanHistory.length > 50) {
        scanHistory = scanHistory.slice(0, 50);
    }
    
    localStorage.setItem('scanHistory', JSON.stringify(scanHistory));
    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('historyList');
    
    if (scanHistory.length === 0) {
        historyList.innerHTML = '<div class="empty-history">No scans yet. Start by scanning a website!</div>';
        return;
    }
    
    historyList.innerHTML = scanHistory.map(item => {
        const date = new Date(item.timestamp);
        const timeStr = date.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const isSafe = item.quantum_safe === 'Yes' || item.quantum_safe === true;
        const badgeClass = isSafe ? 'badge-safe' : 'badge-risk';
        const badgeText = isSafe ? '✓ Safe' : '⚠ At Risk';
        
        return `
            <div class="history-item" onclick='loadHistoryItem(${JSON.stringify(item).replace(/'/g, "&apos;")})'>
                <div class="history-item-header">
                    <span class="history-item-host">${item.host}</span>
                    <span class="history-item-time">${timeStr}</span>
                </div>
                <div class="history-item-status">
                    <span class="status-badge ${badgeClass}">${badgeText}</span>
                    <span style="color: #64748b; font-size: 0.8rem;">${item.t2qb_risk_level}</span>
                </div>
            </div>
        `;
    }).join('');
}

function loadHistoryItem(item) {
    displayResult(item);
    // Scroll to result
    document.querySelector('.scanner-section').scrollIntoView({ behavior: 'smooth' });
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all scan history?')) {
        scanHistory = [];
        localStorage.removeItem('scanHistory');
        renderHistory();
    }
}

function getRiskSealClass(riskLevel) {
    if (!riskLevel) return 'seal-warning';
    const level = riskLevel.toLowerCase();
    if (level.includes('low') || level.includes('minimal') || level.includes('safe')) return 'seal-safe';
    if (level.includes('high') || level.includes('critical')) return 'seal-risk';
    return 'seal-warning';
}

function getRiskTextClass(riskLevel) {
    if (!riskLevel) return 'cert-warning-text';
    const level = riskLevel.toLowerCase();
    if (level.includes('low') || level.includes('minimal') || level.includes('safe')) return 'cert-safe-text';
    if (level.includes('high') || level.includes('critical')) return 'cert-risk-text';
    return 'cert-warning-text';
}