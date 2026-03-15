
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
            const riskClass = r.quantum_safe === 'Yes' || r.quantum_safe === true ? 'safe' : 'risk';
            const riskIcon = r.quantum_safe === 'Yes' || r.quantum_safe === true ? '✅' : '⚠️';
            
            document.getElementById("result").innerHTML = `
                <h3>${riskIcon} Scan Results</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">Host</span>
                        <span class="value">${r.host}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">TLS Version</span>
                        <span class="value">${r.tls_version}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Cipher Suite</span>
                        <span class="value">${r.cipher_suite}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Certificate Expiry</span>
                        <span class="value">${r.certificate_expiry}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Public Key Algorithm</span>
                        <span class="value">${r.public_key_algorithm}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Key Size</span>
                        <span class="value">${r.key_size} bits</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Quantum Safe</span>
                        <span class="value ${riskClass}">${r.quantum_safe}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Risk Level</span>
                        <span class="value ${getRiskClass(r.t2qb_risk_level)}">${r.t2qb_risk_level}</span>
                    </div>
                </div>
                <div class="remediation-box">
                    <span class="label">💡 Remediation Advice</span>
                    <pre>${r.actionable_remediation}</pre>
                </div>
            `;
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

        function getRiskClass(riskLevel) {
            if (!riskLevel) return '';
            const level = riskLevel.toLowerCase();
            if (level.includes('low') || level.includes('minimal')) return 'safe';
            if (level.includes('high') || level.includes('critical')) return 'risk';
            return 'warning';
        }   