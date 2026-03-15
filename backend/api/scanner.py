import socket
import ssl
import sys
from cryptography import x509
from cryptography.hazmat.backends import default_backend
import json
import jwt
import datetime

SCANNER_PRIVATE_KEY = "super_secret_hackathon_key"

def calculate_t2qb_risk(algorithm, key_size, cipher_suite):
    if "KYBER" in cipher_suite.upper() or "ML-KEM" in cipher_suite.upper():
        return "SAFE", "Quantum-Safe Key Exchange detected."
    if "RSA" in algorithm:
        if isinstance(key_size, int) and key_size < 2048:
            return "CRITICAL", "Immediate HNDL Risk. RSA < 2048 is highly vulnerable."
        return "HIGH", "RSA detected. Plan migration to ML-DSA."
    if "EllipticCurve" in algorithm or "ECDHE" in cipher_suite:
        return "HIGH", "ECC detected. Highly vulnerable. Migrate to ML-KEM."
    return "MEDIUM", "Legacy crypto detected."

def generate_remediation(target, risk_level):
    if risk_level == "SAFE":
        return "No remediation required."
    return f"Update config for {target}:\nssl_protocols TLSv1.3;\nssl_ecdh_curve X25519Kyber768Draft00;\nssl_ciphers TLS_AES_256_GCM_SHA384;"

def mint_w3c_credential(target, cipher_suite):
    vc_payload = {
        "iss": "did:web:pnb-hackathon.com",
        "sub": target,
        "nbf": datetime.datetime.utcnow().timestamp(),
        "exp": (datetime.datetime.utcnow() + datetime.timedelta(days=90)).timestamp(),
        "vc": {
            "type": ["VerifiableCredential", "QuantumReadyCertificate"],
            "credentialSubject": {
                "id": target,
                "auditStatus": "Verified Quantum Safe",
                "cipherSuite": cipher_suite
            }
        }
    }
    return jwt.encode(vc_payload, SCANNER_PRIVATE_KEY, algorithm="HS256")


def scan_target(targets):

    all_results = []
    sanitized_targets = [t.strip() for t in targets if isinstance(t, str) and t.strip()]

    if not sanitized_targets:
        print("No valid targets provided; skipping scan.")
        return all_results

    for target in sanitized_targets:
        print("\n==============================")
        print("Scanning Target:", target)
        print("==============================")

        context = ssl.create_default_context()

        try:
            with socket.create_connection((target, 443)) as sock:
                with context.wrap_socket(sock, server_hostname=target) as ssock:

                    print("\nSecure connection established!")

                    tls_version = ssock.version()
                    cipher_suite = ssock.cipher()

                    print("\nTLS Version:", tls_version)
                    print("Cipher Suite:", cipher_suite[0])

                    cert = ssock.getpeercert()

                    print("\nCertificate Information")
                    print("Issuer:", cert.get("issuer"))
                    print("Expiry Date:", cert.get("notAfter"))

                    der_cert = ssock.getpeercert(True)
                    cert_obj = x509.load_der_x509_certificate(der_cert, default_backend())
                    public_key = cert_obj.public_key()

                    print("\nPublic Key Information")
                    print("Algorithm:", public_key.__class__.__name__)

                    try:
                        print("Key Size:", public_key.key_size, "bits")
                    except:
                        print("Key size not available")

                    print("\nQuantum Security Analysis")

                    algorithm = public_key.__class__.__name__
                    cipher_name = cipher_suite[0]

                    quantum_safe = True
                    reasons = []

                    if "RSA" in algorithm:
                        quantum_safe = False
                        reasons.append("RSA algorithm vulnerable to quantum attacks")

                    if "EllipticCurve" in algorithm:
                        quantum_safe = False
                        reasons.append("Elliptic Curve cryptography vulnerable to quantum attacks")

                    if "ECDHE" in cipher_name:
                        quantum_safe = False
                        reasons.append("ECDHE key exchange vulnerable to quantum attacks")

                    if quantum_safe:
                        print("Quantum Safety Status: SAFE")
                    else:
                        print("Quantum Safety Status: NOT SAFE")
                        print("\nReasons:")
                        for r in reasons:
                            print("-", r)

                    print("\n--- Advanced T2QB Risk & Certification ---")

                    key_size_val = getattr(public_key, "key_size", "unknown")
                    risk_level, risk_reason = calculate_t2qb_risk(algorithm, key_size_val, cipher_name)

                    print("Risk Level:", risk_level)
                    print("Diagnosis:", risk_reason)

                    actionable_steps = ""
                    vc_token = None
                    reason="reason: "+risk_reason
                    if quantum_safe:
                        print("\nMinting W3C Verifiable Credential...")
                        vc_token = mint_w3c_credential(target, cipher_name)
                        print("Digital Label JWT:", vc_token)
                    else:
                        print("\nGenerating Actionable Remediation...")
                        actionable_steps = generate_remediation(target, risk_level)
                        print(actionable_steps)

                    print("\nGenerating Cryptographic Bill of Materials (CBOM)")

                    cbom = {
                        "host": target,
                        "tls_version": tls_version,
                        "cipher_suite": cipher_suite[0],
                        "certificate_issuer": str(cert.get("issuer")),
                        "certificate_expiry": cert.get("notAfter"),
                        "public_key_algorithm": algorithm,
                        "key_size": getattr(public_key, "key_size", "unknown"),
                        "quantum_safe": quantum_safe,
                        "t2qb_risk_level": risk_level,
                        "actionable_remediation": actionable_steps,
                        "w3c_credential_jwt": vc_token,
                        "reason":reason
                    }

                    all_results.append(cbom)
        except Exception as exc:
            print(f"\nFailed to scan {target}: {exc}")
            all_results.append({
                "host": target,
                "error": str(exc)
            })
            continue

    with open("cbom_report.json", "w") as f:
        json.dump(all_results, f, indent=4)

    print("CBOM report saved as cbom_report.json")

    return all_results


# CLI support
if __name__ == "__main__":
    targets = sys.argv[1:]
    scan_target(targets)
