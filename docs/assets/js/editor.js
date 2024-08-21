// editor.js
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

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
