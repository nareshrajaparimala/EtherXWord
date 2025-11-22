import React, { useEffect, useState } from "react";

export default function IPFSDocuments() {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("ipfsDocuments") || "[]");
    setDocs(saved);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📂 IPFS Stored Documents</h2>

      {docs.length === 0 ? (
        <p>No documents uploaded to IPFS yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {docs.map((doc, index) => (
            <li
              key={index}
              style={{
                marginBottom: "15px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <strong>{doc.title}</strong> <br />
              CID: <code>{doc.cid}</code> <br />
              <button
                onClick={() =>
                  window.open(
                    `http://localhost:4000/ipfs/${doc.cid}`,
                    "_blank"
                  )
                }
                style={{
                  marginTop: "8px",
                  padding: "5px 10px",
                  background: "#4e9af1",
                  color: "white",
                  borderRadius: "5px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Open Document
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
