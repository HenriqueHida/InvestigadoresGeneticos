document.addEventListener('DOMContentLoaded', () => {
    const button = document.createElement('button');
    button.id = 'toggle-editor-btn';
    button.className = 'editor-button';
    button.innerHTML = '<i class="fas fa-edit"></i>'; // Font Awesome edit icon
    document.body.appendChild(button);

    const editorContainer = document.createElement('div');
    editorContainer.id = 'editor-container';
    editorContainer.innerHTML = '<textarea id="editor" placeholder="Start typing..."></textarea>';
    document.body.appendChild(editorContainer);

    let editorActive = false;

    // Load saved content from local storage
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
        document.getElementById('editor').value = savedContent;
    }

    button.addEventListener('click', () => {
        editorContainer.style.display = editorActive ? 'none' : 'block';
        editorActive = !editorActive;
    });

    // Save content to local storage
    document.getElementById('editor').addEventListener('input', (event) => {
        localStorage.setItem('editorContent', event.target.value);
    });
});
