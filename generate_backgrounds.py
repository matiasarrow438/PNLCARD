from PIL import Image, ImageDraw, ImageFont
import numpy as np
import os

def create_background(width, height, colors, pattern_type):
    # Create a new image with a white background
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)
    
    if pattern_type == 'grid':
        # Draw a grid pattern
        for x in range(0, width, 50):
            draw.line([(x, 0), (x, height)], fill=colors[0], width=1)
        for y in range(0, height, 50):
            draw.line([(0, y), (width, y)], fill=colors[0], width=1)
            
    elif pattern_type == 'waves':
        # Draw wave patterns
        for y in range(0, height, 20):
            points = [(x, y + 20 * np.sin(x/50)) for x in range(0, width, 5)]
            draw.line(points, fill=colors[0], width=2)
            
    elif pattern_type == 'dots':
        # Draw dot pattern
        for x in range(0, width, 30):
            for y in range(0, height, 30):
                draw.ellipse([(x-2, y-2), (x+2, y+2)], fill=colors[0])
                
    elif pattern_type == 'lines':
        # Draw diagonal lines
        for i in range(-height, width + height, 30):
            draw.line([(i, 0), (i - height, height)], fill=colors[0], width=2)
            
    elif pattern_type == 'circuit':
        # Draw circuit-like pattern
        for x in range(0, width, 100):
            for y in range(0, height, 100):
                draw.rectangle([(x, y), (x+80, y+80)], outline=colors[0], width=2)
                draw.line([(x+40, y), (x+40, y+80)], fill=colors[0], width=2)
                draw.line([(x, y+40), (x+80, y+40)], fill=colors[0], width=2)
    
    return img

# Create assets directory if it doesn't exist
if not os.path.exists('assets'):
    os.makedirs('assets')

# Define colors and patterns for each background
backgrounds = [
    {'colors': ['#2563eb'], 'pattern': 'grid'},
    {'colors': ['#1e40af'], 'pattern': 'waves'},
    {'colors': ['#1e293b'], 'pattern': 'dots'},
    {'colors': ['#0f172a'], 'pattern': 'lines'},
    {'colors': ['#334155'], 'pattern': 'circuit'}
]

# Generate backgrounds
for i, bg in enumerate(backgrounds, 1):
    img = create_background(800, 600, bg['colors'], bg['pattern'])
    img.save(f'assets/bg{i}.jpg', quality=95) 