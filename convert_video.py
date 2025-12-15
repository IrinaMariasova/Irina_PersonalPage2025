import cv2
import numpy as np

# Read the video
cap = cv2.VideoCapture('irina-jump.mp4')
fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

# Output video with white background
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter('irina-jump-white.mp4', fourcc, fps, (width, height))

frame_count = 0
while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    # The checkered pattern has specific colors - usually alternating #808080 (128,128,128) and white (255,255,255)
    # or similar gray shades. We need to detect only those specific patterns.
    
    # Create masks for the two checkerboard colors
    # Light gray (around 204-206)
    light_gray_mask = (
        (frame[:,:,0] > 200) & (frame[:,:,0] < 210) &
        (frame[:,:,1] > 200) & (frame[:,:,1] < 210) &
        (frame[:,:,2] > 200) & (frame[:,:,2] < 210)
    )
    
    # Darker gray (around 153-155) 
    dark_gray_mask = (
        (frame[:,:,0] > 150) & (frame[:,:,0] < 160) &
        (frame[:,:,1] > 150) & (frame[:,:,1] < 160) &
        (frame[:,:,2] > 150) & (frame[:,:,2] < 160)
    )
    
    # Pure white or near white that's part of checkered (255,255,255)
    white_mask = (
        (frame[:,:,0] > 250) &
        (frame[:,:,1] > 250) &
        (frame[:,:,2] > 250)
    )
    
    # Combine checkerboard masks
    checker_mask = light_gray_mask | dark_gray_mask
    
    # Only replace checker pattern areas (not the character)
    frame[checker_mask] = [255, 255, 255]
    
    out.write(frame)
    frame_count += 1

cap.release()
out.release()
print(f"Processed {frame_count} frames with more precise detection. Saved to irina-jump-white.mp4")
