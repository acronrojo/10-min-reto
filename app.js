document.addEventListener('DOMContentLoaded', () => {
  const inputTitle = document.getElementById('note-title');
  const inputText = document.getElementById('note-text');
  const inputImage = document.getElementById('note-image');
  const fileNameDisplay = document.getElementById('file-name');
  const btnSave = document.getElementById('btn-save');
  const list = document.getElementById('notes-list');

  let notes = JSON.parse(localStorage.getItem('registro_notas_v2')) || [];
  let currentImageBase64 = null; // Aquí guardaremos la imagen procesada

  // ─── PROCESAR IMAGEN (Redimensionar para no saturar memoria) ───
  inputImage.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
      currentImageBase64 = null;
      fileNameDisplay.textContent = 'Ningún archivo seleccionado';
      return;
    }

    fileNameDisplay.textContent = file.name;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Usamos un canvas para redimensionar la imagen a un máximo de 800px de ancho
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convertimos a JPEG comprimido (calidad 0.7) para ahorrar espacio
        currentImageBase64 = canvas.toDataURL('image/jpeg', 0.7);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  // ─── RENDERIZAR NOTAS ───
  function renderNotes() {
    list.innerHTML = '';
    
    if (notes.length === 0) {
      list.innerHTML = '<p style="color: #64748b; font-size: 14px;">No hay notas registradas aún.</p>';
      return;
    }

    notes.forEach((note, index) => {
      const card = document.createElement('div');
      card.className = 'note-card';
      
      // Si la nota tiene imagen, creamos la etiqueta img
      const imgHTML = note.imagen ? `<img src="${note.imagen}" class="note-image">` : '';

      card.innerHTML = `
        <div class="note-header">
          <span>📅 ${note.fecha}</span>
          <button class="btn-delete" data-index="${index}">Eliminar</button>
        </div>
        <div class="note-title">${note.titulo}</div>
        <div class="note-text">${note.texto}</div>
        ${imgHTML}
      `;
      
      list.appendChild(card);
    });

    // Botones de eliminar
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.getAttribute('data-index');
        notes.splice(idx, 1);
        saveToStorage();
        renderNotes();
      });
    });
  }

  function saveToStorage() {
    try {
      localStorage.setItem('registro_notas_v2', JSON.stringify(notes));
    } catch(e) {
      alert("El almacenamiento está lleno. Intenta con imágenes más pequeñas.");
    }
  }

  // ─── GUARDAR NOTA ───
  btnSave.addEventListener('click', () => {
    const titulo = inputTitle.value.trim();
    const texto = inputText.value.trim();
    
    if (!titulo || !texto) {
      alert("El título y la descripción son obligatorios.");
      return;
    }

    const ahora = new Date();
    const opciones = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const fechaStr = ahora.toLocaleDateString('es-CO', opciones);

    notes.unshift({
      titulo: titulo,
      texto: texto,
      fecha: fechaStr,
      imagen: currentImageBase64 // Puede ser null o el string Base64
    });

    // Limpiar formulario
    inputTitle.value = '';
    inputText.value = '';
    inputImage.value = '';
    fileNameDisplay.textContent = 'Ningún archivo seleccionado';
    currentImageBase64 = null;

    saveToStorage();
    renderNotes();
  });

  renderNotes();
});