use quinn::{ClientConfig, Endpoint, Connection};
use std::ffi::CStr;
use std::net::SocketAddr;
use std::os::raw::c_char;
use std::sync::Arc;
use tokio::runtime::Runtime;
use tokio::io::AsyncWriteExt;

// Optional: Only used if you need to skip TLS verification for self-signed certs
use rustls::client::danger::{ServerCertVerifier, ServerCertVerified, HandshakeSignatureValid};
use rustls::{DigitallySignedStruct, SignatureScheme, Error};
use rustls::pki_types::{CertificateDer, ServerName, UnixTime};

pub struct MarkConnection {
    rt: Runtime,
    conn: Connection,
}

// --- OPTIONAL: INSECURE VERIFIER (Use this if roots still fail) ---
#[derive(Debug)]
struct SkipVarification;
impl ServerCertVerifier for SkipVarification {
    fn verify_server_cert(&self, _r: &CertificateDer, _s: &[CertificateDer], _n: &ServerName, _o: &[u8], _t: UnixTime) -> Result<ServerCertVerified, Error> {
        Ok(ServerCertVerified::assertion())
    }
    fn verify_tls12_signature(&self, _m: &[u8], _c: &CertificateDer, _s: &DigitallySignedStruct) -> Result<HandshakeSignatureValid, Error> {
        Ok(HandshakeSignatureValid::assertion())
    }
    fn verify_tls13_signature(&self, _m: &[u8], _c: &CertificateDer, _s: &DigitallySignedStruct) -> Result<HandshakeSignatureValid, Error> {
        Ok(HandshakeSignatureValid::assertion())
    }
    fn supported_verify_schemes(&self) -> Vec<SignatureScheme> {
        rustls::crypto::ring::default_provider().signature_verification_algorithms.supported_schemes()
    }
}
// ------------------------------------------------------------------

#[unsafe(no_mangle)]
pub extern "C" fn mark_quic_test() -> i32 {
    200
}

#[unsafe(no_mangle)]
pub extern "C" fn connect_mark_server(target_addr: *const c_char) -> *mut MarkConnection {
    let addr_str = unsafe { CStr::from_ptr(target_addr) }.to_str().unwrap_or("");

    let rt = Runtime::new().unwrap();

    // 1. Resolve DNS
    let server_addr: SocketAddr = match rt.block_on(async { tokio::net::lookup_host(addr_str).await }) {
        Ok(mut addrs) => match addrs.next() {
            Some(addr) => addr,
            None => {
                eprintln!("DNS Error: No addresses found for {}", addr_str);
                return std::ptr::null_mut();
            }
        },
        Err(e) => {
            eprintln!("DNS Error: Failed to resolve {}: {:?}", addr_str, e);
            return std::ptr::null_mut();
        }
    };

    let server_name = addr_str.split(':').next().unwrap_or("localhost").to_string();

    let conn_result: Result<Connection, Box<dyn std::error::Error>> = rt.block_on(async {
        let mut root_store = rustls::RootCertStore::empty();
        root_store.extend(webpki_roots::TLS_SERVER_ROOTS.iter().cloned());

        let crypto = rustls::ClientConfig::builder()
            .with_root_certificates(root_store)
            .with_no_client_auth();

        /* NOTE: If you still get TLS errors, swap the 'crypto' block above with this:
           let crypto = rustls::ClientConfig::builder()
               .dangerous()
               .with_custom_certificate_verifier(Arc::new(SkipVarification))
               .with_no_client_auth();
        */

        let mut quic_crypto = crypto;
        quic_crypto.alpn_protocols = vec![b"mark".to_vec()];

        let quic_config = quinn::crypto::rustls::QuicClientConfig::try_from(quic_crypto)?;
        let mut endpoint = Endpoint::client("0.0.0.0:0".parse().unwrap())?;
        endpoint.set_default_client_config(ClientConfig::new(Arc::new(quic_config)));

        let connecting = endpoint.connect(server_addr, &server_name)?;
        let connection = connecting.await?;

        Ok(connection)
    });

    let conn = match conn_result {
        Ok(c) => c,
        Err(e) => {
            eprintln!("QUIC Connection Error: {:?}", e);
            return std::ptr::null_mut();
        }
    };

    Box::into_raw(Box::new(MarkConnection { rt, conn }))
}

#[unsafe(no_mangle)]
pub extern "C" fn send_mark_request(
    state_ptr: *mut MarkConnection,
    payload_ptr: *const u8,
    payload_len: usize,
    out_buf_ptr: *mut u8,    // JS-allocated buffer
    out_buf_len: usize,      // JS-allocated buffer size
    actual_len: *mut u64,    // To tell JS how many bytes we actually wrote
) -> i32 {
    if state_ptr.is_null() { return -1; }
    let state = unsafe { &mut *state_ptr };
    let payload = unsafe { std::slice::from_raw_parts(payload_ptr, payload_len) };

    let result: Result<Vec<u8>, Box<dyn std::error::Error>> = state.rt.block_on(async {
        let (mut send, mut recv) = state.conn.open_bi().await?;
        send.write_all(payload).await?;
        send.finish()?;
        let resp = recv.read_to_end(64 * 1024 * 1024).await?;
        Ok(resp)
    });

    match result {
        Ok(resp_buf) => {
            let len = resp_buf.len();
            unsafe { *actual_len = len as u64; }

            if len > out_buf_len {
                return -3; // Buffer too small!
            }

            // Copy the data into the JS-owned buffer
            unsafe {
                std::ptr::copy_nonoverlapping(resp_buf.as_ptr(), out_buf_ptr, len);
            }
            0
        }
        Err(_) => -2,
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn free_response_buffer(ptr: *mut u8, len: usize) {
    if !ptr.is_null() {
        unsafe {
            let _ = Vec::from_raw_parts(ptr, len, len);
        }
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn close_mark_connection(state_ptr: *mut MarkConnection) {
    if !state_ptr.is_null() {
        unsafe {
            let _ = Box::from_raw(state_ptr);
        }
    }
}