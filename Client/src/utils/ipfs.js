export async function saveNoteToIPFS(text) {
  try {
    const blob = new Blob([text], { type: "application/json" });
    const form = new FormData();
    form.append("file", blob, "document.json");

    const res = await fetch("http://localhost:4000/upload", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      throw new Error(`IPFS upload failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.cid;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('Load failed')) {
      throw new Error('IPFS server is not running. Please start the IPFS server at http://localhost:4000');
    }
    throw error;
  }
}

export async function getDocumentFromIPFS(cid) {
  try {
    const res = await fetch(`http://localhost:4000/ipfs/${cid}`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch document: ${res.status} ${res.statusText}`);
    }
    
    const text = await res.text();
    
    try {
      return JSON.parse(text);
    } catch {
      return { content: text, title: 'Untitled Document' };
    }
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('Load failed')) {
      throw new Error('IPFS server is not running. Please start the IPFS server at http://localhost:4000');
    }
    throw error;
  }
}
