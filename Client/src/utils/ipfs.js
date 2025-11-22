export async function saveNoteToIPFS(text) {
  const blob = new Blob([text], { type: "text/plain" });
  const form = new FormData();
  form.append("file", blob, "note.txt");

  const res = await fetch("http://localhost:4000/upload", {
    method: "POST",
    body: form,
  });

  const data = await res.json();
  return data.cid;
}
