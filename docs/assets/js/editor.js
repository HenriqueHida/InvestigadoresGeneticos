document.addEventListener('DOMContentLoaded', () => {
    const toggleEditorBtn = document.getElementById('toggle-editor-btn');
    const editorContainer = document.getElementById('editor-container');
    let editorActive = false;

    toggleEditorBtn.addEventListener('click', () => {
        if (editorActive) {
            const editorContent = tinymce.get('editor').getContent();
            localStorage.setItem('editorContent', editorContent);
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
                    editor.on('SaveContent', function (e) {
                        localStorage.setItem('editorContent', e.content);
                    });
                },
                init_instance_callback: function (editor) {
                    const savedContent = localStorage.getItem('editorContent');
                    if (savedContent) {
                        editor.setContent(savedContent);
                    }
                }
            });
            toggleEditorBtn.textContent = 'Save & Minimize Editor';
            editorContainer.style.display = 'block';
        }
        editorActive = !editorActive;
    });
});
