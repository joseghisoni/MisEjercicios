// Viewport de espacio mundo
let worldCanvas, worldCtx;
let worldViewport = { x: 0, y: 0, width: 250, height: 250 };

function initWorldView() {
  console.log('Initializing world view...');
  const mainCanvas = document.getElementById('cv');
  if (!mainCanvas) {
    console.error('Main canvas not found');
    return;
  }
  
  worldCanvas = document.createElement('canvas');
  worldCanvas.style.position = 'fixed';
  worldCanvas.style.border = '2px solid #333';
  worldCanvas.style.backgroundColor = '#f8f8f8';
  worldCanvas.style.zIndex = '10';
  worldCanvas.style.borderRadius = '4px';
  
  worldCanvas.width = worldViewport.width;
  worldCanvas.height = worldViewport.height;
  worldCanvas.style.left = '20px';
  worldCanvas.style.bottom = '20px';
  worldCanvas.style.width = worldViewport.width + 'px';
  worldCanvas.style.height = worldViewport.height + 'px';
  
  worldCtx = worldCanvas.getContext('2d');
  document.body.appendChild(worldCanvas);
  
  console.log('World view canvas created and added to DOM');
  
  if (typeof render === 'function') {
    render();
  }
}


// Proyección 3D en perspectiva para la vista del mundo
function drawWorldView(eye, center, up, fov, aspect, zn, zf, azimuth, elevation, projectionType) {
  if (!worldCtx) {
    console.error('worldCtx not available');
    return;
  }
  
  
  const width = worldViewport.width;
  const height = worldViewport.height;
  
  // Limpiar canvas
  worldCtx.fillStyle = '#f8f8f8';
  worldCtx.fillRect(0, 0, width, height);
  
  // Configurar cámara para vista de dios (side view)
  const godEye = [15, 0, 0];
  
  const godCenter = [0, 0, 0];
  const godUp = [0, 1, 0];
  
  // Matrices para la vista de dios
  if (typeof lookAt !== 'function' || typeof orthographic !== 'function' || typeof mat4Mul !== 'function') {
    console.error('Required functions not available:', { lookAt: typeof lookAt, orthographic: typeof orthographic, mat4Mul: typeof mat4Mul });
    return;
  }  
  const godV = lookAt(godEye, godCenter, godUp);
  // Perspective projection for more natural depth
  const godP = perspective(60, 1.0, 1, 25); // 60 degree FOV, square aspect ratio
  const godMVP = mat4Mul(godP, godV);
  
  // Check for additional dependencies
  if (typeof mat4Vec4 !== 'function' || typeof Vec === 'undefined') {
    console.error('Additional required objects not available:', { 
      mat4Vec4: typeof mat4Vec4, 
      Vec: typeof Vec 
    });
    return;
  }
  
  // Función auxiliar para transformar puntos 3D a la vista de dios
  function worldTo2D(point3d) {
    const clip = mat4Vec4(godMVP, [point3d[0], point3d[1], point3d[2], 1]);
    const ndc = [clip[0]/clip[3], clip[1]/clip[3], clip[2]/clip[3]];
    return [
      (ndc[0] + 1) * width * 0.5,
      height - (ndc[1] + 1) * height * 0.5
    ];
  }
  
  // Helper function to draw 3D lines
  function drawLine3D(point1, point2, color, lineWidth) {
    const p1 = worldTo2D(point1);
    const p2 = worldTo2D(point2);
    
    worldCtx.strokeStyle = color;
    worldCtx.lineWidth = lineWidth;
    worldCtx.beginPath();
    worldCtx.moveTo(p1[0], p1[1]);
    worldCtx.lineTo(p2[0], p2[1]);
    worldCtx.stroke();
  }
  
  
  // Dibujar ground plane grid
  drawGroundGrid(drawLine3D);
  
  // Dibujar cubo
  drawCube(drawLine3D);
  
  // Dibujar cámara principal
  drawMainCamera(worldTo2D, eye, center, up);
  
  // Dibujar frustum de visualización
  drawViewingFrustum(worldTo2D, eye, center, up, fov, aspect, zn, zf, projectionType);
  
}

function drawGrid(drawLine3D, canvasWidth, canvasHeight) {
  // Extended ground plane for perspective stretching effect
  // Much larger grid to show perspective foreshortening
  const size = 20; // Extended range
  const worldLeft = -size;
  const worldRight = size;  
  const worldNear = -size;
  const worldFar = size;
  
  // Grid spacing
  const gridSpacing = 1;
  
  // Light ground grid plane (XZ plane at y=0)
  // Vertical lines (parallel to Z-axis) - these will show perspective convergence
  for (let x = worldLeft; x <= worldRight; x += gridSpacing) {
    drawLine3D([x, 0, worldNear], [x, 0, worldFar], '#ddd', 0.6);
  }
  
  // Horizontal lines (parallel to X-axis) - these will show depth spacing
  for (let z = worldNear; z <= worldFar; z += gridSpacing) {
    drawLine3D([worldLeft, 0, z], [worldRight, 0, z], '#ddd', 0.6);
  }
}

function drawGroundGrid(drawLine3D) {
  // Simple ground reference line (Z-axis through origin)
  drawLine3D([0, 0, -10], [0, 0, 10], '#ccc', 1);
}

function drawCube(drawLine3D) {
  // Draw world cube (fixed in space)
  const cubeVerts = [
    [-0.5,-0.5,-0.5],[ 0.5,-0.5,-0.5],[ 0.5, 0.5,-0.5],[-0.5, 0.5,-0.5],
    [-0.5,-0.5, 0.5],[ 0.5,-0.5, 0.5],[ 0.5, 0.5, 0.5],[-0.5, 0.5, 0.5],
  ];
  
  const edges = [
    [0,1],[1,2],[2,3],[3,0], // bottom face
    [4,5],[5,6],[6,7],[7,4], // top face
    [0,4],[1,5],[2,6],[3,7]  // vertical edges
  ];
  
  edges.forEach(([i, j]) => {
    drawLine3D(cubeVerts[i], cubeVerts[j], '#333', 2);
  });
}

function drawMainCamera(worldTo2D, eye, center, up) {
  const cameraPos = worldTo2D(eye);
  const targetPos = worldTo2D(center);
  
  // Dibujar posición de la cámara
  worldCtx.fillStyle = '#ff4444';
  worldCtx.beginPath();
  worldCtx.arc(cameraPos[0], cameraPos[1], 4, 0, Math.PI * 2);
  worldCtx.fill();
  
  // Dibujar línea hacia el target
  worldCtx.strokeStyle = '#ff4444';
  worldCtx.lineWidth = 2;
  worldCtx.setLineDash([5, 3]);
  worldCtx.beginPath();
  worldCtx.moveTo(cameraPos[0], cameraPos[1]);
  worldCtx.lineTo(targetPos[0], targetPos[1]);
  worldCtx.stroke();
  worldCtx.setLineDash([]);
  
  // Etiqueta de la cámara
  worldCtx.fillStyle = '#333';
  worldCtx.font = '12px monospace';
  worldCtx.fillText('CAM', cameraPos[0] + 6, cameraPos[1] - 6);
}

function drawViewingFrustum(worldTo2D, eye, center, up, fov, aspect, zn, zf, projectionType) {
  worldCtx.strokeStyle = '#4488ff';
  worldCtx.lineWidth = 1.5;
  
  // Calcular dirección de vista
  const viewDir = Vec.normalize(Vec.sub(center, eye));
  const rightDir = Vec.normalize(Vec.cross(viewDir, up));
  const upDir = Vec.cross(rightDir, viewDir);
  
  if (projectionType === 'perspective') {
    // Frustum perspectivo
    const tanHalfFov = Math.tan((fov * Math.PI / 180) / 2);
    const nearHeight = Math.abs(zn) * tanHalfFov;
    const nearWidth = nearHeight * aspect;
    const farHeight = Math.abs(zf) * tanHalfFov;
    const farWidth = farHeight * aspect;
    
    // Puntos del plano near
    const nearCenter = Vec.add(eye, Vec.scale(viewDir, Math.abs(zn)));
    const nearTL = Vec.add(Vec.add(nearCenter, Vec.scale(upDir, nearHeight)), Vec.scale(rightDir, -nearWidth));
    const nearTR = Vec.add(Vec.add(nearCenter, Vec.scale(upDir, nearHeight)), Vec.scale(rightDir, nearWidth));
    const nearBL = Vec.add(Vec.add(nearCenter, Vec.scale(upDir, -nearHeight)), Vec.scale(rightDir, -nearWidth));
    const nearBR = Vec.add(Vec.add(nearCenter, Vec.scale(upDir, -nearHeight)), Vec.scale(rightDir, nearWidth));
    
    // Puntos del plano far
    const farCenter = Vec.add(eye, Vec.scale(viewDir, Math.abs(zf)));
    const farTL = Vec.add(Vec.add(farCenter, Vec.scale(upDir, farHeight)), Vec.scale(rightDir, -farWidth));
    const farTR = Vec.add(Vec.add(farCenter, Vec.scale(upDir, farHeight)), Vec.scale(rightDir, farWidth));
    const farBL = Vec.add(Vec.add(farCenter, Vec.scale(upDir, -farHeight)), Vec.scale(rightDir, -farWidth));
    const farBR = Vec.add(Vec.add(farCenter, Vec.scale(upDir, -farHeight)), Vec.scale(rightDir, farWidth));
    
    const godEyeX = 15; // God's eye X position (camera plane)
    
    const allFrustumPoints = [nearTL, nearTR, nearBL, nearBR, farTL, farTR, farBL, farBR];
    const anyPointBehindCamera = allFrustumPoints.some(point => point[0] >= godEyeX);
    
    const maxFrustumSize = 15; 
    const frustumTooLarge = allFrustumPoints.some(point => 
      Math.abs(point[0]) > maxFrustumSize || 
      Math.abs(point[1]) > maxFrustumSize || 
      Math.abs(point[2]) > maxFrustumSize
    );
    
    if (!anyPointBehindCamera && !frustumTooLarge) {
      // Transformar a coordenadas de pantalla
      const screenNear = [nearTL, nearTR, nearBR, nearBL].map(worldTo2D);
      const screenFar = [farTL, farTR, farBR, farBL].map(worldTo2D);
      
      // Dibujar plano near
      worldCtx.beginPath();
      worldCtx.moveTo(screenNear[0][0], screenNear[0][1]);
      for (let i = 1; i < 4; i++) {
        worldCtx.lineTo(screenNear[i][0], screenNear[i][1]);
      }
      worldCtx.closePath();
      worldCtx.stroke();
      
      // Dibujar plano far
      worldCtx.beginPath();
      worldCtx.moveTo(screenFar[0][0], screenFar[0][1]);
      for (let i = 1; i < 4; i++) {
        worldCtx.lineTo(screenFar[i][0], screenFar[i][1]);
      }
      worldCtx.closePath();
      worldCtx.stroke();
      
      // Conectar near y far
      for (let i = 0; i < 4; i++) {
        worldCtx.beginPath();
        worldCtx.moveTo(screenNear[i][0], screenNear[i][1]);
        worldCtx.lineTo(screenFar[i][0], screenFar[i][1]);
        worldCtx.stroke();
      }
    }
  } else {
    // Frustum ortográfico (prisma rectangular)
    const ui = readUI();
    const aspectRatio = aspect;
    const right = ui.orthoLeft * aspectRatio;
    const top = ui.orthoBottom;
    
    // Puntos del plano near
    const nearCenter = Vec.add(eye, Vec.scale(viewDir, Math.abs(zn)));
    const nearTL = Vec.add(Vec.add(nearCenter, Vec.scale(upDir, top)), Vec.scale(rightDir, -right));
    const nearTR = Vec.add(Vec.add(nearCenter, Vec.scale(upDir, top)), Vec.scale(rightDir, right));
    const nearBL = Vec.add(Vec.add(nearCenter, Vec.scale(upDir, -top)), Vec.scale(rightDir, -right));
    const nearBR = Vec.add(Vec.add(nearCenter, Vec.scale(upDir, -top)), Vec.scale(rightDir, right));
    
    // Puntos del plano far
    const farCenter = Vec.add(eye, Vec.scale(viewDir, Math.abs(zf)));
    const farTL = Vec.add(Vec.add(farCenter, Vec.scale(upDir, top)), Vec.scale(rightDir, -right));
    const farTR = Vec.add(Vec.add(farCenter, Vec.scale(upDir, top)), Vec.scale(rightDir, right));
    const farBL = Vec.add(Vec.add(farCenter, Vec.scale(upDir, -top)), Vec.scale(rightDir, -right));
    const farBR = Vec.add(Vec.add(farCenter, Vec.scale(upDir, -top)), Vec.scale(rightDir, right));
    
    const godEyeX = 15; // God's eye X position (camera plane)
    
    const allFrustumPoints = [nearTL, nearTR, nearBL, nearBR, farTL, farTR, farBL, farBR];
    const anyPointBehindCamera = allFrustumPoints.some(point => point[0] >= godEyeX);
    
    const maxFrustumSize = 15;
    const frustumTooLarge = allFrustumPoints.some(point => 
      Math.abs(point[0]) > maxFrustumSize || 
      Math.abs(point[1]) > maxFrustumSize || 
      Math.abs(point[2]) > maxFrustumSize
    );

    if (!anyPointBehindCamera && !frustumTooLarge) {
      // Transformar a coordenadas de pantalla
      const screenNear = [nearTL, nearTR, nearBR, nearBL].map(worldTo2D);
      const screenFar = [farTL, farTR, farBR, farBL].map(worldTo2D);
      
      // Dibujar plano near
      worldCtx.beginPath();
      worldCtx.moveTo(screenNear[0][0], screenNear[0][1]);
      for (let i = 1; i < 4; i++) {
        worldCtx.lineTo(screenNear[i][0], screenNear[i][1]);
      }
      worldCtx.closePath();
      worldCtx.stroke();
      
      // Dibujar plano far
      worldCtx.beginPath();
      worldCtx.moveTo(screenFar[0][0], screenFar[0][1]);
      for (let i = 1; i < 4; i++) {
        worldCtx.lineTo(screenFar[i][0], screenFar[i][1]);
      }
      worldCtx.closePath();
      worldCtx.stroke();
      
      // Conectar near y far
      for (let i = 0; i < 4; i++) {
        worldCtx.beginPath();
        worldCtx.moveTo(screenNear[i][0], screenNear[i][1]);
        worldCtx.lineTo(screenFar[i][0], screenFar[i][1]);
        worldCtx.stroke();
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initWorldView, 100);
});
