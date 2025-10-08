// Jtac_app/js/app.js - Poprawiona synchronizacja i kompletny kod z obsługą await
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  let currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const viewedUser = JSON.parse(localStorage.getItem('viewedUser') || '{}');
  const displayedUser = viewedUser.login ? viewedUser : currentUser;
  console.log('Token:', token); // Debug
  console.log('Current User:', currentUser); // Debug

  // Logowanie (/login.html)
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('login').value;
      const password = document.getElementById('password').value;
      if (!username || !password) {
        alert('Proszę podać login i hasło!');
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        console.log('Odpowiedź serwera (login):', { status: response.status, data }); // Debug
        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user)); // Zapisz dane
          currentUser = data.user; // Aktualizuj currentUser
          alert('Logowanie OK! Odśwież stronę (F5) po przekierowaniu.');
          window.location.href = '/profile.html';
        } else {
          alert('Błąd logowania: ' + (data.message || 'Nieznany błąd'));
        }
      } catch (error) {
        console.error('Błąd sieciowy (login):', error);
        alert('Błąd połączenia z serwerem: ' + error.message);
      }
    });
  }

  // Rejestracja (register.html)
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usernameSelect = document.getElementById('username');
      const customUsernameInput = document.getElementById('custom-username');
      const numberInput = document.getElementById('number');
      const passwordInput = document.getElementById('password');
      const confirmPasswordInput = document.getElementById('confirm-password');
      const roleInput = document.getElementById('role');
      const registrationCodeInput = document.getElementById('registration-code');
      const registerButton = document.getElementById('register-button');

      const username = usernameSelect.value === 'Other' ? customUsernameInput.value.trim() : usernameSelect.value;
      const number = numberInput.value;
      const fullUsername = `${username}${number}`;
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      const role = roleInput.value;
      const activationCode = registrationCodeInput.value.trim().toLowerCase();

      console.log('Dane rejestracji:', { username, number, fullUsername, password, role, activationCode }); // Debug

      if (!username) {
        alert('Wybierz lub wpisz call-sign!');
        return;
      }
      if (number < 1 || number > 99) {
        alert('Numer musi być w zakresie 1-99!');
        return;
      }
      if (password !== confirmPassword) {
        alert('Hasła nie są identyczne!');
        return;
      }
      if (activationCode !== '#formoza_pany') {
        alert('Niepoprawny kod aktywacyjny!');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: fullUsername, password, role, activationCode })
        });
        const data = await response.json();
        console.log('Odpowiedź serwera (register):', { status: response.status, data }); // Debug
        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user)); // Zapisz dane
          currentUser = data.user; // Aktualizuj currentUser
          alert('Rejestracja OK! Zaloguj się teraz.');
          window.location.href = '/login.html';
        } else {
          alert('Błąd rejestracji: ' + (data.message || 'Nieznany błąd'));
        }
      } catch (error) {
        console.error('Błąd sieciowy (register):', error);
        alert('Błąd połączenia z serwerem: ' + error.message);
      }
    });

    // Włącz/wyłącz pole custom-username
    const usernameSelect = document.getElementById('username');
    const customUsernameContainer = document.getElementById('custom-username-container');
    const customUsernameInput = document.getElementById('custom-username');
    if (usernameSelect && customUsernameContainer && customUsernameInput) {
      usernameSelect.addEventListener('change', function() {
        if (this.value === 'Other') {
          customUsernameContainer.style.display = 'block';
          customUsernameInput.required = true;
        } else {
          customUsernameContainer.style.display = 'none';
          customUsernameInput.required = false;
          customUsernameInput.value = '';
        }
      });
    }

    // Włącz/wyłącz przycisk na podstawie kodu
    const registrationCodeInput = document.getElementById('registration-code');
    const registerButton = document.getElementById('register-button');
    if (registrationCodeInput && registerButton) {
      registrationCodeInput.addEventListener('input', function() {
        registerButton.disabled = this.value.trim().toLowerCase() !== '#formoza_pany';
      });
    }
  }

  // Profil (profile.html)
  if (window.location.pathname.includes('profile.html')) {
    console.log('Profil - Token:', token); // Debug
    console.log('Profil - Current User:', currentUser); // Debug
    // Ponowne wczytanie danych z localStorage
    const reloadedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || !reloadedUser || !reloadedUser.login) {
      document.getElementById('call-sign').textContent = 'Nie zalogowano';
      document.getElementById('role').textContent = 'Brak roli';
      document.getElementById('buttons-section').innerHTML = ''; // Wyczyść guziki
    } else {
      document.getElementById('call-sign').textContent = reloadedUser.login || 'Nieznany';
      document.getElementById('role').textContent = reloadedUser.role || 'Brak roli';
      const buttonsSection = document.getElementById('buttons-section');
      if (buttonsSection) {
        buttonsSection.innerHTML = `
          <a href="Part_1.html">Part I.</a>
          <a href="Part_2.html">Part II.</a>
          <a href="cas-log.html">Part III/ Add Control</a>
          <a href="Part_4.html">Part IV</a>
          <a href="Part_5.html">Part V.</a>
          <a href="Part_6.html">Part VI.</a>
          <a href="Part_7.html">Part VII.</a>
          <a href="Eval_form.html">EVAL FORM</a>
          <a href="Grade_sheet.html">GRADE SHEET</a>
          <a href="jtac_list.html">JTACs List</a>
          <a href="battle_chat.html" class="battle-chat-button">Battle Chat</a>
          <button onclick="logout()">Logout</button>
        `;
      }
    }
  }

  // Notatki (profile.html) - Przeniesione do backendu
  window.addNote = async () => {
    if (!token) return alert('Zaloguj się!');
    const noteInput = document.getElementById('noteInput');
    const content = noteInput.value.trim();
    if (!content) return alert('Notatka nie może być pusta!');
    if (content.length > 200) return alert('Max 200 znaków!');
    try {
      const response = await fetch('http://localhost:5000/api/auth/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: 'note', content: { text: content, author: currentUser.login } })
      });
      if (response.ok) {
        noteInput.value = '';
        alert('Notatka zapisana!');
        renderNotes();
      } else {
        const data = await response.json();
        alert('Błąd: ' + data.message);
      }
    } catch (error) {
      alert('Błąd: ' + error);
    }
  };

  window.deleteNote = async (id) => {
    if (!token) return alert('Zaloguj się!');
    try {
      const response = await fetch(`http://localhost:5000/api/auth/data/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Notatka usunięta!');
        renderNotes();
      } else {
        alert('Błąd: Brak uprawnień');
      }
    } catch (error) {
      alert('Błąd: ' + error);
    }
  };

  async function renderNotes() {
    if (!token) return;
    const notesList = document.getElementById('notesList');
    if (!notesList) return;
    notesList.innerHTML = '';
    try {
      const response = await fetch('http://localhost:5000/api/auth/mydata', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const notes = (await response.json()).filter(item => item.type === 'note');
      notes.sort((a, b) => new Date(b.date) - new Date(a.date));
      notes.forEach(note => {
        const isAuthor = note.content.author === currentUser.login;
        const canDelete = isAuthor || ['admin', 'moderator', 'JTAC I', 'JTAC I/E'].includes(currentUser.role);
        const noteItem = document.createElement('div');
        noteItem.classList.add('note-item');
        noteItem.innerHTML = `
          <div class="note-content">
            <p>${note.content.text}</p>
            <div class="note-meta">Dodane przez: ${note.content.author} - ${new Date(note.date).toLocaleDateString()}</div>
          </div>
          ${canDelete ? `<button class="note-delete" onclick="deleteNote('${note._id}')">Usuń</button>` : ''}
        `;
        notesList.appendChild(noteItem);
      });
    } catch (error) {
      console.error('Błąd pobierania notatek:', error);
    }
  }

  // Wylogowanie
  window.logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('viewedUser');
    window.location.href = '/index.html';
  };

  // Avatar
  const avatarUpload = document.getElementById('avatar-upload');
  if (avatarUpload) {
    avatarUpload.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          document.querySelector('.avatar-img').src = e.target.result;
          localStorage.setItem('avatarSrc', e.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
    if (localStorage.getItem('avatarSrc')) {
      document.querySelector('.avatar-img').src = localStorage.getItem('avatarSrc');
    }
  }

  // Funkcje z profile.html (dostosowane do backendu)
  function updateValidityDates() {
    const airspaceStart = new Date(document.getElementById('airspaceStart').value || '2025-01-23');
    const iolRlStart = new Date(document.getElementById('iolRlStart').value || '2023-01-01');
    const phraseologyStart = new Date(document.getElementById('phraseologyStart').value || '2023-01-01');
    const currentDate = new Date();
    const validityPeriods = {
      airspace: 12,
      iolRl: 24,
      phraseology: 12,
      '6mthreview': 6,
      academics: 12,
      jtac: 18,
      'jtac-i classroom': 18,
      'jtac-i': 18,
      'jtac e': 18
    };
    function calculateEndDate(startDate, months) {
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + months);
      return endDate;
    }
    function getValidityClass(endDate) {
      const diffDays = (endDate - currentDate) / (1000 * 60 * 60 * 24);
      if (diffDays > 60) return 'valid-green';
      if (diffDays > 0) return 'valid-yellow';
      return 'valid-red';
    }
    const airspaceEnd = calculateEndDate(airspaceStart, validityPeriods.airspace);
    const iolRlEnd = calculateEndDate(iolRlStart, validityPeriods.iolRl);
    const phraseologyEnd = calculateEndDate(phraseologyStart, validityPeriods.phraseology);
    document.getElementById('airspaceEnd').textContent = airspaceEnd.toISOString().split('T')[0];
    document.getElementById('airspaceEnd').className = `validity-cell ${getValidityClass(airspaceEnd)}`;
    document.getElementById('iolRlEnd').textContent = iolRlEnd.toISOString().split('T')[0];
    document.getElementById('iolRlEnd').className = `validity-cell ${getValidityClass(iolRlEnd)}`;
    document.getElementById('phraseologyEnd').textContent = phraseologyEnd.toISOString().split('T')[0];
    document.getElementById('phraseologyEnd').className = `validity-cell ${getValidityClass(phraseologyEnd)}`;
    // Placeholder dla innych danych
    ['6mthReview', 'academics', 'jtac', 'jtacIClass', 'jtacI', 'jtacE'].forEach(type => {
      document.getElementById(`${type}Start`).textContent = '-';
      document.getElementById(`${type}End`).textContent = '-';
      document.getElementById(`${type}End`).className = 'validity-cell';
    });
  }

  // Inicjalizacja trackerów
  function initializeTracker(tableId, trackerTypes) {
    const tbody = document.getElementById(`${tableId.replace('Table', 'Tbody')}`);
    if (!tbody) {
      console.error('Tbody dla', tableId, 'nie znaleziono');
      return;
    }
    tbody.innerHTML = '';
    trackerTypes.forEach(type => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${type}</td><td>-</td><td>-</td>`;
      tbody.appendChild(row);
    });
  }

  function initializeMetlTracker(tableId, trackerTypes) {
    const tbody = document.getElementById(`${tableId.replace('Table', 'Tbody')}`);
    if (!tbody) {
      console.error('Tbody dla', tableId, 'nie znaleziono');
      return;
    }
    tbody.innerHTML = '';
    trackerTypes.forEach(type => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${type}</td><td>-</td><td>-</td>`;
      tbody.appendChild(row);
    });
  }

  // Funkcje z PDF i drukowaniem (z obsługą await)
  window.downloadTable = async (tableId, fileNamePrefix) => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth() - 20;
    const pageHeight = pdf.internal.pageSize.getHeight() - 40;
    const tableWidthPx = 1000;
    const tableWidthMm = Math.min(tableWidthPx * 0.264583, pageWidth);

    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tbody tr');
    let currentPageRows = [];
    let pageNumber = 1;

    const createContainer = () => {
        const pdfContainer = document.createElement('div');
        pdfContainer.style.padding = '10px';
        pdfContainer.style.backgroundColor = '#ffffff';
        pdfContainer.style.position = 'absolute';
        pdfContainer.style.left = '-9999px';

        const userInfo = document.createElement('div');
        userInfo.textContent = `Logged in as: ${displayedUser.login}`;
        userInfo.style.fontFamily = "'Roboto Condensed', sans-serif";
        userInfo.style.color = '#8b6114';
        userInfo.style.textAlign = 'center';
        userInfo.style.fontSize = '14px';
        userInfo.style.marginBottom = '5px';
        pdfContainer.appendChild(userInfo);

        const title = document.createElement('h2');
        title.textContent = tableId === 'trackerTable' ? 'Tracker' : 'Validity';
        title.style.fontFamily = "'Roboto Condensed', sans-serif";
        title.style.color = '#8b6114';
        title.style.textAlign = 'center';
        title.style.fontSize = '14px';
        title.style.marginBottom = '10px';
        pdfContainer.appendChild(title);

        return pdfContainer;
    };

    const renderTableFragment = async (rowsToRender) => {
        const pdfContainer = createContainer();
        const tableClone = document.createElement('table');
        tableClone.style.width = `${tableWidthPx}px`;
        tableClone.style.maxWidth = `${tableWidthPx}px`;
        tableClone.style.borderCollapse = 'collapse';
        tableClone.style.fontFamily = '"Roboto Condensed", sans-serif';
        tableClone.style.boxSizing = 'border-box';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.style.border = '1px solid #8b6114';
            th.style.padding = '6px';
            th.style.textAlign = 'center';
            th.style.backgroundColor = '#8b6114';
            th.style.color = '#000';
            th.style.wordBreak = 'break-word';
            th.style.boxSizing = 'border-box';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        tableClone.appendChild(thead);

        const tbody = document.createElement('tbody');
        rowsToRender.forEach(row => {
            const rowClone = document.createElement('tr');
            const cells = Array.from(row.cells);
            cells.forEach((cell, index) => {
                const td = document.createElement('td');
                if (tableId === 'validityTable' && row.rowIndex === 0 && index < 3) {
                    const dateInput = cell.querySelector('.custom-date-input');
                    const remarksInput = cell.querySelector('.remarks-input');
                    td.textContent = dateInput ? dateInput.value : cell.textContent;
                    td.setAttribute('data-remarks', remarksInput && remarksInput.value ? remarksInput.value : '');
                } else {
                    td.textContent = cell.textContent;
                }
                td.style.border = '1px solid #8b6114';
                td.style.padding = '6px';
                td.style.textAlign = 'center';
                td.style.color = '#000';
                td.style.wordBreak = 'break-word';
                td.style.boxSizing = 'border-box';
                if (cell.classList.contains('metl-header')) {
                    td.style.backgroundColor = '#555';
                    td.style.color = '#fff';
                    td.style.fontWeight = 'bold';
                } else {
                    td.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }
                if (cell.classList.contains('tracker-cell') || cell.classList.contains('validity-cell')) {
                    if (cell.classList.contains('green') || cell.classList.contains('valid-green')) {
                        td.style.backgroundColor = '#00ff00';
                        td.style.color = '#000';
                    } else if (cell.classList.contains('yellow') || cell.classList.contains('valid-yellow')) {
                        td.style.backgroundColor = '#ffff00';
                        td.style.color = '#000';
                    } else if (cell.classList.contains('orange')) {
                        td.style.backgroundColor = '#ff8c00';
                        td.style.color = '#000';
                    } else if (cell.classList.contains('red') || cell.classList.contains('valid-red')) {
                        td.style.backgroundColor = '#ff0000';
                        td.style.color = '#000';
                    }
                }
                rowClone.appendChild(td);
            });
            tbody.appendChild(rowClone);
        });
        tableClone.appendChild(tbody);
        pdfContainer.appendChild(tableClone);

        return { pdfContainer, tableClone };
    };

    const calculateHeight = async (rowsToRender) => {
        const { pdfContainer } = await renderTableFragment(rowsToRender);
        document.body.appendChild(pdfContainer);
        try {
            const canvas = await html2canvas(pdfContainer, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: true
            });
            const imgHeight = canvas.height;
            const imgWidth = canvas.width;
            const heightInMm = (imgHeight * tableWidthMm) / imgWidth;
            return heightInMm;
        } finally {
            document.body.removeChild(pdfContainer);
        }
    };

    let currentHeight = 0;
    for (let i = 0; i < rows.length; i++) {
        const testRows = [...currentPageRows, rows[i]];
        const fragmentHeight = await calculateHeight(testRows);

        if (fragmentHeight <= pageHeight || currentPageRows.length === 0) {
            currentPageRows.push(rows[i]);
            currentHeight = fragmentHeight;
        } else {
            const { pdfContainer } = await renderTableFragment(currentPageRows);
            document.body.appendChild(pdfContainer);
            try {
                const canvas = await html2canvas(pdfContainer, {
                    scale: 2,
                    backgroundColor: '#ffffff',
                    logging: true
                });
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const width = tableWidthMm;
                const height = (imgHeight * width) / imgWidth;

                const leftMargin = (pdf.internal.pageSize.getWidth() - width) / 2;
                const topMargin = 10;
                pdf.addImage(imgData, 'JPEG', leftMargin, topMargin, width, height);

                pdf.setFontSize(10);
                pdf.setTextColor(0, 0, 0);
                pdf.text(`Page ${pageNumber}`, pdf.internal.pageSize.getWidth() - 30, pdf.internal.pageSize.getHeight() - 10);
            } finally {
                document.body.removeChild(pdfContainer);
            }

            if (i < rows.length) {
                pdf.addPage();
                pageNumber++;
                currentPageRows = [rows[i]];
                currentHeight = await calculateHeight(currentPageRows);
            }
        }
    }

    if (currentPageRows.length > 0) {
        const { pdfContainer } = await renderTableFragment(currentPageRows);
        document.body.appendChild(pdfContainer);
        try {
            const canvas = await html2canvas(pdfContainer, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: true
            });
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const width = tableWidthMm;
            const height = (imgHeight * width) / imgWidth;

            const leftMargin = (pdf.internal.pageSize.getWidth() - width) / 2;
            const topMargin = 10;
            pdf.addImage(imgData, 'JPEG', leftMargin, topMargin, width, height);

            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`Page ${pageNumber}`, pdf.internal.pageSize.getWidth() - 30, pdf.internal.pageSize.getHeight() - 10);
        } finally {
            document.body.removeChild(pdfContainer);
        }
    }

    pdf.save(`${fileNamePrefix}_${displayedUser.login}.pdf`);
  };

  window.printTable = async (tableId) => {
    const table = document.getElementById(tableId);
    const title = tableId === 'trackerTable' ? 'Tracker' : 'Validity';
    const printWindow = window.open('', '_blank');
    let tableHTML = table.outerHTML;

    if (tableId === 'validityTable') {
        const tableClone = table.cloneNode(true);
        const firstRowCells = tableClone.querySelectorAll('tbody tr:first-child td');
        firstRowCells.forEach((cell, index) => {
            if (index < 3) {
                const dateInput = cell.querySelector('.custom-date-input');
                const remarksInput = cell.querySelector('.remarks-input');
                cell.textContent = dateInput ? dateInput.value : cell.textContent;
                if (remarksInput && remarksInput.value) {
                    cell.setAttribute('data-tooltip', remarksInput.value);
                }
            }
        });
        tableHTML = tableClone.outerHTML;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print ${title}</title>
            <style>
                body {
                    font-family: 'Roboto Condensed', sans-serif;
                    margin: 0;
                    padding: 10px;
                    background-color: #fff;
                    color: #000;
                }
                .user-info {
                    text-align: center;
                    margin: 10px 0;
                    color: #8b6114;
                    font-size: 1em;
                }
                h2 {
                    text-align: center;
                    margin: 10px 0;
                    color: #8b6114;
                    font-size: 1.2em;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 8px;
                    font-size: 0.8em;
                }
                table, th, td {
                    border: 1px solid #8b6114;
                }
                th {
                    background-color: #8b6114;
                    color: #000;
                    padding: 6px;
                    text-align: center;
                }
                td {
                    background-color: rgba(255, 255, 255, 0.1);
                    color: #000;
                    padding: 6px;
                    text-align: center;
                }
                tr.metl-header td {
                    background-color: #555;
                    color: #fff;
                    font-weight: bold;
                }
                .tracker-cell.green, .valid-green { background-color: #00ff00 !important; color: #000 !important; }
                .tracker-cell.yellow, .valid-yellow { background-color: #ffff00 !important; color: #000 !important; }
                .tracker-cell.orange { background-color: #ff8c00 !important; color: #000 !important; }
                .tracker-cell.red, .valid-red { background-color: #ff0000 !important; color: #000 !important; }
            </style>
        </head>
        <body onload="window.print(); window.close();">
            <div class="user-info">Logged in as: ${displayedUser.login}</div>
            <h2>${title}</h2>
            ${tableHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
  };

  // Wywołania inicjalizacyjne
  if (window.location.pathname.includes('profile.html')) {
    updateValidityDates();
    initializeTracker('trackerTable', [
      'FW 1', 'FW 2', 'RW', 'TYPE 1', 'TYPE 2', 'TYPE 3', 'BOT', 'BOC', 'ORDNANCE',
      'TO', 'VDL', 'ETD', '9L LL', 'MH', 'LASER', 'DAY', 'NIGHT', 'IR', 'RO',
      'SEAD', 'URBAN',
    ]);
    initializeMetlTracker('metlTrackerTable', [
      '01.-CAS Planning', '01.1.', '01.2.,', '01.3.,', '01.4.,', '01.5.,', '01.6.,', '01.7.,', '01.8.,', '01.9.,',
      '01.10.,', '01.11.,', '01.12.,', '01.13.,', '01.14.,', '01.15.,', '01.16.,', '01.17.,', '01.18.,', '01.19.,', '01.20.,',
      '02.-CAS Preparation',
      '02.1. Operate organic JTAC equipment.',
      '02.1.1.,', '02.1.2.,', '02.1.3.,', '02.1.5.,',
      '02.2. Apply the products of operational planning in support of CAS execution.',
      '02.2.1.,', '02.2.2.,', '02.2.3.,', '02.2.4.,', '02.2.5.,',
      '03.-CAS Execution',
      '03.1. Targeting.',
      '03.1.1. Target Acquisition.',
      '03.1.1.1.,', '03.1.1.2.,', '03.1.1.3.,', '03.1.1.4.,',
      '03.1.2. Target Location.',
      '03.1.2.1.,', '03.1.2.2.,', '03.1.2.3.,',
      '03.2.,',
      '03.3. Coordinate CAS missions.',
      '03.3.1.,', '03.3.2.,', '03.3.3.,',
      '03.4. Execute deconfliction of aviation assets.',
      '03.4.1.,', '03.4.2.,',
      '03.5. Coordinate CAS Target engagement.',
      '03.5.1.,', '03.5.2.,', '03.5.3.,',
      '03.6. Execute target marking for CAS assets.',
      '03.6.1.,', '03.6.2.,', '03.6.3.,', '03.6.4.,',
      '03.7.,',
      '03.8. Execute appropriate terminal attack control procedures and method of attack.',
      '03.8.1.,', '03.8.2.,', '03.8.3.,', '03.8.4.,', '03.8.5.,',
      '03.9. Control day and night CAS missions, in support of the ground scheme of maneuver.',
      '03.9.1.,', '03.9.2.,', '03.9.3.,', '03.9.4.,', '03.9.5.,', '03.9.6.,',
      '03.10.,', '03.11.,', '03.12.'
    ]);
  }
});