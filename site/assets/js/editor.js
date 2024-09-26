import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

document.addEventListener('DOMContentLoaded', () => {
    const toggleEditorBtn = document.getElementById('toggle-editor-btn');
    const editorContainer = document.getElementById('editor-container');
    let editorActive = false;

    toggleEditorBtn.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) {
            alert('Por favor, faça login para usar o editor.');
            return;
        }

        const docRef = doc(db, "users", user.uid);
        if (editorActive) {
            const editorContent = tinymce.get('editor').getContent();
            await setDoc(docRef, { content: editorContent }, { merge: true });
            tinymce.remove('#editor');
            toggleEditorBtn.textContent = 'Open Editor';
            editorContainer.style.display = 'none';
        } else {
            tinymce.init({
                selector: '#editor',
                plugins: 'autosave save',
                toolbar: 'save | undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | outdent indent | bullist numlist',
                autosave_ask_before_unload: true,
                setup: function (editor) {
                    editor.on('SaveContent', async function (e) {
                        await setDoc(docRef, { content: e.content }, { merge: true });
                    });
                },
                init_instance_callback: async function (editor) {
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        editor.setContent(docSnap.data().content);
                    }
                }
            });
            toggleEditorBtn.textContent = 'Save & Minimize Editor';
            editorContainer.style.display = 'block';
        }
        editorActive = !editorActive;
    });
});
