const input = document.getElementById("name");
const container = document.getElementById('div-links');
const downloadBtn = document.querySelector('#download');

function random() {
    return Math.floor(10000 + Math.random() * 90000);
}


async function loadLinks() {
 try {
  const response = await fetch('/libros/links');
  if (!response.ok) throw new Error('Error al cargar los libros');
  const data = await response.json();
  renderLinks(data.links);
 } catch (error) {
  console.error('Error:', error);
  container.innerHTML = '<p class="text-red-500">Error al cargar los libros. Intenta recargar la página.</p>';
 }
}

function renderLinks(links) {
 container.innerHTML = '';

 for (let n = 0; n <= links.length - 1; n++) {
  const divWrapper = document.createElement('div');
  divWrapper.id = 'link';
  divWrapper.className = 'w-full sm:w-[30%] border border-gray-700 rounded-lg p-3 hover:bg-gray-900 transition-colors';
  divWrapper.style.position = 'relative';

  const linkElement = document.createElement('a');
  linkElement.className = 'link-0 block truncate';
  linkElement.target = '_blank';
  let link = links[n];
  const fixedUrl = link.replace(/\/[^\/:]+:(?=[^\/]+$)/, '/');
  linkElement.href = fixedUrl;
  const parts = link.split('/');
  const name = parts.pop().replaceAll('%20', ' ').replaceAll('-', ' ').replaceAll(':', '\n');  
  let filename = decodeURIComponent(name);
  linkElement.textContent = filename.length > 50 ? filename.substring(0, 47) + '...' : filename;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.style.position = 'absolute';
  checkbox.style.top = '0';
  checkbox.style.right = '0';
  checkbox.style.width = '16px';
  checkbox.style.height = '16px';
  checkbox.style.cursor = 'pointer';
  checkbox.style.appearance = 'none';
  checkbox.style.WebkitAppearance = 'none';
  checkbox.style.border = '2px solid #3b82f6';
  checkbox.style.borderRadius = '50%';
  checkbox.style.outline = 'none';
  checkbox.style.transition = 'background 0.2s';

  checkbox.addEventListener('change', function() {
   if (this.checked) {
    this.style.backgroundColor = '#3b82f6';
   } else {
    this.style.backgroundColor = '';
   }
  });

  divWrapper.appendChild(linkElement);
  divWrapper.appendChild(checkbox);
  container.appendChild(divWrapper);
 }
}

downloadBtn.addEventListener('click', async () => {
 const checkedLinks = Array.from(document.querySelectorAll('#link input[type="checkbox"]:checked'))
  .map(checkbox => checkbox.parentElement.querySelector('a').href);

 if (checkedLinks.length === 0) {
  alert("Selecciona almenos 1 libro");
  return;
 }

 try {
  const spanText = downloadBtn.querySelector('span');
  const originalText = spanText.textContent;
  spanText.textContent = 'Descargando...';
  downloadBtn.disabled = true;

  const response = await fetch('/libros/download', {
   method: 'POST',
   headers: {
    'Content-Type': 'application/json',
   },
   body: JSON.stringify({ selectedLinks: checkedLinks })
  });

  if (!response.ok) throw new Error('Error en la descarga');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pack-books_${random()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

 } catch (error) {
  console.error('Error:', error);
  alert('Error al descargar los archivos');
 } finally {
  const spanText = downloadBtn.querySelector('span');
  spanText.textContent = 'Descargar ZIP';
  downloadBtn.disabled = false;
 }
});

function search(text = "") {
 const lowerText = text.toLowerCase();
 const allLinks = document.querySelectorAll("#link .link-0");

 allLinks.forEach(link => {
  const linkText = link.textContent.toLowerCase();
  link.parentElement.style.display = linkText.includes(lowerText) ? "" : "none";
 });
}

input.addEventListener("keydown", (event) => {
 if (event.key === "Enter") {
  search(input.value);
 }
});

document.addEventListener('DOMContentLoaded', loadLinks);

