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
        document.querySelector('.holder-type').textContent = type.replace(/-/g, ' ').toUpperCase();
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

    // Function to capture and download card
    function downloadCard() {
        try {
            // Validate form
            const errors = validateForm();
            if (errors.length > 0) {
                errors.forEach(error => showNotification(error));
                return;
            }

            // Show loading notification
            showNotification('Generating your card...', 'warning');
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            // Get the selected background image
            const selectedBg = document.querySelector('.background-option.selected img');
            if (!selectedBg) {
                showNotification('No background selected');
                return;
            }

            // Create a canvas with exact dimensions
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 800;  // Exact width
            canvas.height = 600; // Exact height

            // Function to draw rounded rectangle
            function roundedRect(x, y, width, height, radius) {
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + width - radius, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                ctx.lineTo(x + width, y + height - radius);
                ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                ctx.lineTo(x + radius, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
            }

            // Create background image
            const bgImg = new Image();
            bgImg.crossOrigin = 'Anonymous';
            
            // Add timestamp to prevent caching
            const timestamp = new Date().getTime();
            bgImg.src = `${selectedBg.src}?t=${timestamp}`;

            bgImg.onerror = () => {
                console.error('Failed to load background image');
                showNotification('Failed to load background image. Please try again or select a different background.');
                downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
            };

            bgImg.onload = () => {
                try {
                    // Clear canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Create clipping path for rounded corners
                    roundedRect(0, 0, canvas.width, canvas.height, 16);
                    ctx.clip();

                    // Draw background
                    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

                    // Add semi-transparent overlay
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Draw white border (liner) around the card
                    ctx.save();
                    ctx.lineWidth = 4;
                    ctx.strokeStyle = '#fff';
                    roundedRect(2, 2, canvas.width - 4, canvas.height - 4, 16);
                    ctx.stroke();
                    ctx.restore();

                    // Draw bubble title ($PNL CARD)
                    ctx.save();
                    ctx.font = 'bold 64px "Baloo 2", "Comic Sans MS", "Arial Rounded MT Bold", Arial, sans-serif';
                    ctx.textAlign = 'right';
                    
                    // Add green glow effect
                    ctx.shadowColor = 'rgba(74, 222, 128, 0.6)';
                    ctx.shadowBlur = 20;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 2;
                    
                    // First layer of glow
                    ctx.fillStyle = 'rgba(74, 222, 128, 0.4)';
                    ctx.fillText('$PNL CARD', canvas.width - 48, 112);
                    
                    // Second layer of glow
                    ctx.fillStyle = 'rgba(74, 222, 128, 0.6)';
                    ctx.fillText('$PNL CARD', canvas.width - 49, 111);
                    
                    // Main text
                    ctx.fillStyle = '#4ade80';
                    ctx.fillText('$PNL CARD', canvas.width - 50, 110);
                    
                    ctx.restore();

                    // Draw character image if exists and is loaded
                    const charImg = document.getElementById('character-preview');
                    if (charImg && charImg.style.display !== 'none' && charImg.complete && charImg.naturalHeight !== 0) {
                        try {
                            // Position character image on the left side
                            const imgX = 50;
                            const imgY = 150;
                            const imgSize = 220;
                            // Draw border
                            ctx.strokeStyle = 'white';
                            ctx.lineWidth = 3;
                            ctx.strokeRect(imgX, imgY, imgSize, imgSize);
                            // Draw image
                            ctx.drawImage(charImg, imgX, imgY, imgSize, imgSize);
                        } catch (imgError) {
                            console.error('Error drawing character image:', imgError);
                            showNotification('Warning: Could not add character image to card', 'warning');
                        }
                    }

                    // Draw certified text
                    ctx.save();
                    ctx.translate(60, 60);
                    ctx.rotate(-10 * Math.PI / 180);
                    ctx.fillStyle = '#ff3b3b';
                    ctx.font = 'bold 35px Inter, Arial, sans-serif';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    ctx.shadowColor = 'rgba(0,0,0,0.3)';
                    ctx.shadowBlur = 4;
                    ctx.fillText('CERTIFIED', 0, 0);
                    ctx.restore();

                    // Draw name and type (right side, vertically centered)
                    const name = document.querySelector('.holder-name').textContent;
                    const type = document.querySelector('.holder-type').textContent;
                    // Positioning for right side, vertically centered
                    const infoX = canvas.width - 80;
                    const nameY = 300;
                    const typeY = 370;

                    // Name
                    ctx.save();
                    ctx.font = 'bold 56px Inter, Arial, sans-serif';
                    ctx.textAlign = 'right';
                    ctx.fillStyle = '#fff';
                    ctx.shadowColor = 'rgba(0,0,0,0.25)';
                    ctx.shadowBlur = 8;
                    ctx.fillText(name, infoX, nameY);
                    ctx.restore();

                    // Type (title)
                    ctx.save();
                    ctx.font = 'bold 36px Inter, Arial, sans-serif';
                    ctx.textAlign = 'right';
                    
                    // Add green glow effect
                    ctx.shadowColor = 'rgba(74, 222, 128, 0.6)';
                    ctx.shadowBlur = 20;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 2;
                    
                    // First layer of glow
                    ctx.fillStyle = 'rgba(74, 222, 128, 0.4)';
                    ctx.fillText(type, infoX + 2, typeY + 2);
                    
                    // Second layer of glow
                    ctx.fillStyle = 'rgba(74, 222, 128, 0.6)';
                    ctx.fillText(type, infoX + 1, typeY + 1);
                    
                    // Main text
                    ctx.fillStyle = '#4ade80';
                    ctx.fillText(type, infoX, typeY);
                    
                    ctx.restore();

                    // Draw social info
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.font = '20px Inter, Arial, sans-serif';
                    ctx.textAlign = 'left';
                    ctx.shadowColor = 'rgba(0,0,0,0.25)';
                    ctx.shadowBlur = 4;
                    ctx.fillText('X: @pnlcardsol', 50, canvas.height - 80);
                    ctx.fillText('CA: Coming Soon', 50, canvas.height - 50);

                    // Download the image
                    const downloadTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const link = document.createElement('a');
                    link.download = `pnl-card-${downloadTimestamp}.png`;
                    canvas.toBlob((blob) => {
                        const url = URL.createObjectURL(blob);
                        link.href = url;
                        link.click();
                        URL.revokeObjectURL(url);
                        // Reset button and show success
                        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
                        showNotification('Card downloaded successfully!', 'success');
                        // Open X profile in a new tab after a short delay
                        setTimeout(() => {
                            window.open('https://x.com/PNLCARDSOL', '_blank');
                        }, 500);
                    }, 'image/png');

                } catch (error) {
                    console.error('Error generating card:', error);
                    showNotification('Error generating card. Please try again.');
                    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
                }
            };

        } catch (error) {
            console.error('Download error:', error);
            showNotification('Failed to generate card');
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
        }
    }

    // Add click handler for download button
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadCard);
    }

    // Handle share button
    if (previewShareBtn) {
        previewShareBtn.addEventListener('click', () => {
            const shareUrl = "https://x.com/intent/post?text=I%E2%80%99m%20certified%20degen%20with%20my%20PNL%20card%2C%20are%20you%3F%20%0A%24PNL%20%23millycoded%0AMake%20yours%20here%3A%20website%20addy";
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

    // Initial update
    updateCard();
}); 