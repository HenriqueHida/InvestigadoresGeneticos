// editor.js
<<<<<<< Updated upstream
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
=======
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
>>>>>>> Stashed changes

const auth = getAuth();
const db = getFirestore();

<<<<<<< Updated upstream
// Your firebase related code

// Ensure this script is loaded after firebase.js
document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth(); // Use global firebase object
    const db = firebase.firestore(); // Use global firebase object

    const toggleEditorBtn = document.createElement('button');
    toggleEditorBtn.id = 'toggle-editor-btn';
    toggleEditorBtn.className = 'editor-button';
    toggleEditorBtn.innerHTML = '<i class="fas fa-edit"></i>';
    document.body.appendChild(toggleEditorBtn);

    const editorContainer = document.createElement('div');
    editorContainer.id = 'editor-container';
    editorContainer.style.display = 'none';
    editorContainer.innerHTML = '<textarea id="editor" placeholder="Start typing..."></textarea>';
    document.body.appendChild(editorContainer);

    let editorInitialized = false;
    let autoSaveInterval;
    let lastSavedContent = '';
    let currentUser = null;

    // Listen for authentication state changes
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        if (!user && editorInitialized) {
            tinymce.remove('#editor');
            editorContainer.style.display = 'none';
            editorInitialized = false;
            alert('You have been signed out. Please log in to continue editing.');
        }
    });

    // Toggle editor visibility and initialize TinyMCE
    toggleEditorBtn.addEventListener('click', async () => {
        if (!currentUser) {
            alert('Please log in to use the editor.');
            return;
        }

        if (editorInitialized) {
            const content = tinymce.get('editor').getContent();
            await saveContent(currentUser.uid, content);
            clearInterval(autoSaveInterval);
            tinymce.remove('#editor');
            editorContainer.style.display = 'none';
            editorInitialized = false;
        } else {
            editorContainer.style.display = 'block';
            await initializeEditor(currentUser.uid);
            editorInitialized = true;
=======
// Função para pegar o conteúdo do textarea
function getEditorContent() {
    const editorInstance = document.getElementById('editor');
    if (editorInstance) {
        const content = editorInstance.value;
        console.log("Conteúdo atual do textarea:", content); // Log de depuração
        return content;
    } else {
        console.log("Textarea não foi inicializado corretamente."); // Log de erro
        return ''; // Retorna vazio se o textarea não estiver pronto
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Criar o botão do editor
    const button = document.createElement('button');
    button.id = 'toggle-editor-btn';
    button.className = 'editor-button';
    button.innerHTML = '<i class="fas fa-edit"></i>'; // Ícone de edição (Font Awesome)
    document.body.appendChild(button);

    // Criar o container do editor
    const editorContainer = document.createElement('div');
    editorContainer.id = 'editor-container';
    editorContainer.innerHTML = '<textarea id="editor" placeholder="Start typing..."></textarea>';
    document.body.appendChild(editorContainer);

    let editorActive = false;

    // Alterna entre abrir e fechar o editor
    button.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) {
            alert('Por favor, faça login para usar o editor.');
            return;
        }

        const docRef = doc(db, "users", user.uid);

        if (editorActive) {
            // Obter o conteúdo do textarea e salvar no Firestore
            const editorContent = getEditorContent();
            if (!editorContent) {
                alert("O conteúdo do textarea está vazio.");
                return;
            }

            console.log("Salvando conteúdo:", editorContent); // Log do conteúdo salvo

            try {
                await setDoc(docRef, { content: editorContent }, { merge: true }); // Salva no Firestore
                editorContainer.style.display = 'none'; // Esconder o container do editor
                button.textContent = 'Open Editor'; // Alterar o texto do botão
                console.log("Conteúdo salvo com sucesso.");
            } catch (error) {
                alert(`Erro ao salvar conteúdo: ${error.message}`);
            }
        } else {
            // Carregar conteúdo salvo do Firestore
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const savedContent = docSnap.data().content;
                    document.getElementById('editor').value = savedContent; // Carregar o conteúdo salvo
                    console.log("Conteúdo carregado do Firestore:", savedContent);
                }
            } catch (error) {
                alert(`Erro ao carregar conteúdo: ${error.message}`);
            }

            editorContainer.style.display = 'block'; // Mostrar o container do editor
            button.textContent = 'Save & Minimize Editor'; // Alterar o texto do botão
>>>>>>> Stashed changes
        }
    });

    // Initialize TinyMCE editor and load existing content
    async function initializeEditor(userId) {
        tinymce.init({
            selector: '#editor',
            plugins: 'autosave save lists link',
            toolbar: 'save | undo redo | bold italic underline | bullist numlist | link',
            setup: (editor) => {
                editor.on('change', () => {
                    const content = editor.getContent();
                    if (content !== lastSavedContent) {
                        resetAutoSave(userId, content);
                    }
                });
            },
            init_instance_callback: async (editor) => {
                const content = await loadContent(userId);
                if (content) {
                    editor.setContent(content);
                    lastSavedContent = content;
                }
                startAutoSave(userId);
            },
        });
    }

    // Save editor content to Firestore
    async function saveContent(userId, content) {
        try {
            await db.collection('users').doc(userId).set({ editorContent: content }, { merge: true });
            lastSavedContent = content;
            console.log('Content saved successfully.');
        } catch (error) {
            console.error('Error saving content:', error);
        }
    }

    // Load editor content from Firestore
    async function loadContent(userId) {
        try {
            const docSnap = await db.collection('users').doc(userId).get();
            if (docSnap.exists()) {
                return docSnap.data().editorContent || '';
            }
        } catch (error) {
            console.error('Error loading content:', error);
        }
        return '';
    }

    // Start auto-save functionality
    function startAutoSave(userId) {
        autoSaveInterval = setInterval(async () => {
            const content = tinymce.get('editor').getContent();
            if (content !== lastSavedContent) {
                await saveContent(userId, content);
            }
        }, 10000); // Auto-save every 10 seconds
    }

    // Reset auto-save interval
    function resetAutoSave(userId, content) {
        clearInterval(autoSaveInterval);
        startAutoSave(userId);
    }
});
