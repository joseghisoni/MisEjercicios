/*
tp3.js — Funciones auxiliares:
- Datos geométricos
- Utilidades de interfaz
- Utils de pipeline de renderizado
- Funciones de visualización
*/

// ------------------------------- Modelo: Cubo ------------------------------ //
const CUBE_VERTS = [
  [-0.5,-0.5,-0.5],[ 0.5,-0.5,-0.5],[ 0.5, 0.5,-0.5],[-0.5, 0.5,-0.5],
  [-0.5,-0.5, 0.5],[ 0.5,-0.5, 0.5],[ 0.5, 0.5, 0.5],[-0.5, 0.5, 0.5],
]; // Cubo unitario centrado en el origen
const CUBE_FACES = [
  [0,2,1],[0,3,2],
  [4,5,6],[4,6,7],
  [0,5,4],[0,1,5],
  [3,6,2],[3,7,6],
  [1,6,5],[1,2,6],
  [0,7,3],[0,4,7],
]; // 12 caras pues hay 2 triángulos por cara
const FACE_COLORS = [
  [220,60,60],[220,120,60],[60,180,80],[60,120,200],
  [200,60,180],[240,220,80],[80,200,220],[120,80,200],
  [180,180,180],[80,80,80],[160,100,40],[40,160,100],
];

// -------------------------- Render loop ------------------------------- //
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
let mode='fill'; // 'fill' | 'depth'
let projectionType='perspective'; // 'perspective' | 'orthographic'

// ---------------------- UI Helpers ------------------------------------- //
function readUI() {
  // defino una función $ que simplifica la obtención de elementos del DOM
  const $ = id => document.getElementById(id);
  return {
    az: +$('azimuth').value * Math.PI/180, // convierto a radianes
    el: +$('elevation').value * Math.PI/180,
    fov: +$('fov').value,
    near: +$('near').value / 100, // divido por 100 porque el slider ahora va de -500 a -1
    far: +$('far').value / 100,
    orthoLeft: +$('orthoLeft')?.value || 2.0,
    orthoBottom: +$('orthoBottom')?.value || 2.0,
  };
}

// -----------  Render Functions Helpers ------------------------------- //

// 5. Post-processing Module
function postProcess(imgData, depth) {
  if(mode === 'depth') {
    let zmin = Infinity, zmax = -Infinity;
    for(let i = 0; i < depth.length; i++) {
      const z = depth[i];
      if(z !== Infinity) {
        if(z < zmin) zmin = z;
        if(z > zmax) zmax = z;
      }
    }
    const rng = (zmax - zmin) || 1;
    for(let i = 0; i < depth.length; i++) {
      const idx = i * 4;
      const z = depth[i];
      if(z === Infinity) {
        imgData.data[idx + 3] = 255;
        continue;
      }
      const t = (z - zmin) / rng;
      const g = Math.round(255 * (1 - t));
      imgData.data[idx + 0] = g;
      imgData.data[idx + 1] = g;
      imgData.data[idx + 2] = g;
      imgData.data[idx + 3] = 255;
    }
  }
}

// ------------------------------- UI Functions ------------------------------- //
function updateProjectionUI() {
  const perspectiveControls = document.getElementById('perspectiveControls');
  const orthographicControls = document.getElementById('orthographicControls');
  
  if (projectionType === 'perspective') {
    perspectiveControls.style.display = 'block';
    orthographicControls.style.display = 'none';
  } else {
    perspectiveControls.style.display = 'none';
    orthographicControls.style.display = 'block';
  }
}


// Formatea una matriz 4x4 para su visualización
function formatMatrix(matrix) {
  let result = '';
  for (let i = 0; i < 4; i++) {
    const row = [];
    for (let j = 0; j < 4; j++) {
      const val = matrix[j * 4 + i];
      row.push(val.toFixed(3).padStart(7));
    }
    result += '[' + row.join(' ') + ']\n';
  }
  return result;
}


// Formatea un vector para su visualización
function formatVector(vec, label) {
  return `${label}: [${vec.map(v => v.toFixed(3)).join(', ')}]`;
}


// Actualiza los valores mostrados de los sliders
function updateSliderValues() {
  // FOV in degrees
  const fovValue = document.getElementById('fovValue');
  if (fovValue) {
    fovValue.textContent = document.getElementById('fov').value + '°';
  }
  
  // Orthographic parameters
  const orthoLeftValue = document.getElementById('orthoLeftValue');
  if (orthoLeftValue) {
    orthoLeftValue.textContent = (+document.getElementById('orthoLeft').value).toFixed(1);
  }
  
  const orthoBottomValue = document.getElementById('orthoBottomValue');
  if (orthoBottomValue) {
    orthoBottomValue.textContent = (+document.getElementById('orthoBottom').value).toFixed(1);
  }
  
  // Near/Far (converted from slider values)
  const nearValue = document.getElementById('nearValue');
  if (nearValue) {
    nearValue.textContent = (+document.getElementById('near').value / 100).toFixed(2);
  }
  
  const farValue = document.getElementById('farValue');
  if (farValue) {
    farValue.textContent = (+document.getElementById('far').value / 100).toFixed(2);
  }
  
  // Camera angles in degrees
  const azimuthValue = document.getElementById('azimuthValue');
  if (azimuthValue) {
    azimuthValue.textContent = document.getElementById('azimuth').value + '°';
  }
  
  const elevationValue = document.getElementById('elevationValue');
  if (elevationValue) {
    elevationValue.textContent = document.getElementById('elevation').value + '°';
  }
}


// Actualiza la visualización de las matrices
function updateMatrixDisplay(eye, center, up, V, P) {
  updateSliderValues();
  
  // Camera parameters
  const cameraParams = document.getElementById('cameraParams');
  if (cameraParams) {
    cameraParams.innerHTML = 
      formatVector(eye, 'eye   ') + '<br>' +
      formatVector(center, 'center') + '<br>' +
      formatVector(up, 'up    ');
  }
  
  // View matrix
  const viewMatrix = document.getElementById('viewMatrix');
  if (viewMatrix) {
    viewMatrix.innerHTML = '<pre>' + formatMatrix(V) + '</pre>';
  }
  
  // Projection matrix
  const projectionMatrix = document.getElementById('projectionMatrix');
  if (projectionMatrix) {
    projectionMatrix.innerHTML = '<pre>' + formatMatrix(P) + '</pre>';
  }
}

function initializeTP3() {
  ['fov','near','far','azimuth','elevation','orthoLeft','orthoBottom'].forEach(id=>{
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', render);
    }
  });

  document.getElementById('fillBtn').onclick=()=>{ mode='fill'; render(); };
  document.getElementById('depthBtn').onclick=()=>{ mode='depth'; render(); };

  document.getElementById('perspectiveBtn').onclick=()=>{ 
    projectionType='perspective'; 
    updateProjectionUI(); 
    render(); 
  };
  document.getElementById('orthographicBtn').onclick=()=>{ 
    projectionType='orthographic'; 
    updateProjectionUI(); 
    render(); 
  };

  updateProjectionUI();
  updateSliderValues();
  render();
}

document.addEventListener('DOMContentLoaded', initializeTP3);