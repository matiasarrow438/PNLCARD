document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('preview-download-btn');
    const previewShareBtn = document.getElementById('preview-share-btn');
    const characterImage = document.getElementById('character-image');
    const imagePreview = document.getElementById('image-preview');
    const characterPreview = document.getElementById('character-preview');
    const previewBackground = document.getElementById('preview-background');
    const backgroundOptions = document.querySelectorAll('.background-option');
    const characterOptions = document.querySelectorAll('.character-option');
    const previewCard = document.getElementById('preview-card');
    const notificationContainer = document.getElementById('notification-container');
    const typeSelect = document.getElementById('type');
    const customTitlePopup = document.getElementById('customTitlePopup');
    const customTitleInput = document.getElementById('customTitleInput');
    const saveCustomTitleBtn = document.getElementById('saveCustomTitle');
    const cancelCustomTitleBtn = document.getElementById('cancelCustomTitle');
    const editCustomTitleBtn = document.getElementById('editCustomTitle');
    const holderType = document.querySelector('.holder-type');

    let lastCustomTitle = '';

    // Function to show notifications
    function showNotification(message, type = 'error') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Add icon based on type
        let icon = '';
        switch(type) {
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
        }
        
        notification.innerHTML = `${icon}<span>${message}</span>`;
        notificationContainer.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Function to validate form
    function validateForm() {
        const name = document.getElementById('name').value.trim();
        const type = document.getElementById('type').value;
        const hasCharacter = characterPreview.style.display !== 'none';
        const hasBackground = document.querySelector('.background-option.selected') !== null;

        let errors = [];

        if (!name) errors.push('Please enter your name');
        if (!type) errors.push('Please select your title');
        if (!hasCharacter) errors.push('Please select or upload a character image');
        if (!hasBackground) errors.push('Please select a background');

        return errors;
    }

    // Function to update preview and card
    function updateCard() {
        const name = document.getElementById('name').value;
        const type = document.getElementById('type').value;

        // Update the card content
        document.querySelector('.holder-name').textContent = name || 'NAME';
        if (type !== 'custom') {
            document.querySelector('.holder-type').textContent = type.replace(/-/g, ' ').toUpperCase();
            editCustomTitleBtn.style.display = 'none';
        } else if (lastCustomTitle) {
            document.querySelector('.holder-type').textContent = lastCustomTitle.toUpperCase();
        }
    }

    // Add input event listeners for live updates
    ['name', 'type'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateCard);
            element.addEventListener('change', updateCard);
        }
    });

    // Handle character image upload
    characterImage.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Log file information
            console.log('File selected:', {
                name: file.name,
                type: file.type,
                size: file.size
            });

            // Remove selection from character options
            characterOptions.forEach(opt => opt.classList.remove('selected'));
            
            const reader = new FileReader();
            
            reader.onload = (event) => {
                // Simply set the image source and display it
                characterPreview.src = event.target.result;
                characterPreview.style.display = 'block';
                characterPreview.alt = '';
                imagePreview.innerHTML = '<i class="fas fa-check"></i><span>Image uploaded</span>';
                showNotification('Image uploaded successfully', 'success');
            };

            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                showNotification('Error reading file. Please try again.');
            };

            // Read the file as a data URL
            reader.readAsDataURL(file);
        }
    });

    // Handle character selection
    characterOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            characterOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            option.classList.add('selected');
            
            // Get the character image
            const charImg = option.querySelector('img');
            
            // Update preview
            characterPreview.src = charImg.src;
            characterPreview.style.display = 'block';
            characterPreview.alt = '';
            imagePreview.innerHTML = '<i class="fas fa-check"></i><span>Character selected</span>';
            showNotification('Character selected', 'success');
            
            // Clear file input
            characterImage.value = '';
        });
    });

    // Set initial background
    const firstBackground = backgroundOptions[0].querySelector('img').src;
    if (previewBackground) {
        previewBackground.style.backgroundImage = `url('${firstBackground}')`;
    }

    // Handle background selection
    backgroundOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            backgroundOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            option.classList.add('selected');
            
            // Get the background image path
            const bgImage = option.querySelector('img').src;
            
            // Update preview background
            if (previewBackground) {
                previewBackground.style.backgroundImage = `url('${bgImage}')`;
                showNotification('Background updated', 'success');
            }
        });
    });

    // Simple download function using html2canvas
    function downloadCard() {
        const previewCard = document.getElementById('preview-card');
        
        // Wait for the Racing Sans One font to load
        document.fonts.ready.then(() => {
            html2canvas(previewCard, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                onclone: function(clonedDoc) {
                    // Ensure font is applied to cloned elements
                    const elements = clonedDoc.getElementsByClassName('preview-card')[0].getElementsByTagName('*');
                    for(let el of elements) {
                        if(['bubble-title', 'holder-name', 'holder-type', 'certified-text', 'social-info'].some(className => el.classList.contains(className))) {
                            el.style.fontFamily = "'Racing Sans One', cursive";
                        }
                    }
                }
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'pnl-card.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        });
    }

    // Add click handler for download button
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadCard);
    }

    // Handle share button
    if (previewShareBtn) {
        previewShareBtn.addEventListener('click', () => {
            const shareUrl = "https://x.com/intent/post?text=I%E2%80%99m%20certified%20degen%20with%20my%20PNL%20card%2C%20are%20you%3F%0A%24PNL%20%23millycoded%0AMake%20yours%20here%3A%20pnlcardsol.org";
            window.open(shareUrl, '_blank');
        });
    }

    // Copy CA button functionality
    const copyCaBtn = document.getElementById('copy-ca-btn');
    if (copyCaBtn) {
        copyCaBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('COMING SOON').then(() => {
                showNotification('CA copied to clipboard!', 'success');
            });
        });
    }

    // Close (X) button functionality
    const closeBtn = document.getElementById('close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.location.href = 'https://example.com'; // Replace with your redirect URL
        });
    }

    // Handle custom title option
    typeSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            editCustomTitleBtn.style.display = 'inline-flex';
            // Optionally, open the popup if no custom title is set yet
            if (!lastCustomTitle) {
                customTitlePopup.style.display = 'flex';
                customTitleInput.value = '';
                customTitleInput.focus();
            }
        } else {
            editCustomTitleBtn.style.display = 'none';
            updateCard();
        }
    });

    editCustomTitleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        customTitlePopup.style.display = 'flex';
        customTitleInput.value = holderType.textContent.trim();
        customTitleInput.focus();
    });

    saveCustomTitleBtn.addEventListener('click', function() {
        const customTitle = customTitleInput.value.trim();
        if (customTitle) {
            holderType.textContent = customTitle.toUpperCase();
            lastCustomTitle = customTitle;
            customTitlePopup.style.display = 'none';
            customTitleInput.value = '';
        }
    });

    cancelCustomTitleBtn.addEventListener('click', function() {
        customTitlePopup.style.display = 'none';
        customTitleInput.value = '';
        typeSelect.value = '11000x-degen-king';
        editCustomTitleBtn.style.display = 'none';
        lastCustomTitle = '';
        updateCard();
    });

    customTitlePopup.addEventListener('click', function(e) {
        if (e.target === customTitlePopup) {
            customTitlePopup.style.display = 'none';
            customTitleInput.value = '';
            typeSelect.value = '11000x-degen-king';
            editCustomTitleBtn.style.display = 'none';
            lastCustomTitle = '';
            updateCard();
        }
    });

    // Initial update
    updateCard();
}); 
