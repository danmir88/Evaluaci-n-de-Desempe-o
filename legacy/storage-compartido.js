// Almacenamiento compartido para el Constructor de Objetivos SMART 2026 (versión original).
// Reemplaza window.storage, que en claude.ai guardaba los datos del artefacto, por el
// servidor de FRIGOR. Las claves compartidas viven en el servidor; las personales
// (nombre del usuario, desbloqueo GTH) quedan en el navegador.
//
// Para que dos gerentes no se pisen, cada guardado combina en tres vías: parte de lo
// que hay hoy en el servidor y aplica solo lo que este navegador agregó, cambió o
// borró desde la última lectura.
(function(){
  'use strict';
  const base = {};          // último valor leído del servidor, por clave
  let saving = 0;

  const keyOf = item => (item && typeof item === 'object')
    ? (item.id !== undefined ? 'id:' + item.id : item.nombre !== undefined ? 'n:' + item.nombre : 'j:' + JSON.stringify(item))
    : 'j:' + JSON.stringify(item);

  function merge3(baseArr, localArr, serverArr){
    if(!Array.isArray(localArr) || !Array.isArray(serverArr)) return localArr;
    const b = new Map((Array.isArray(baseArr) ? baseArr : []).map(x => [keyOf(x), JSON.stringify(x)]));
    const l = new Map(localArr.map(x => [keyOf(x), x]));
    const out = new Map(serverArr.map(x => [keyOf(x), x]));
    b.forEach((_, k) => { if(!l.has(k)) out.delete(k); });                 // borrado aquí
    l.forEach((x, k) => {
      if(!b.has(k) || b.get(k) !== JSON.stringify(x)) out.set(k, x);       // nuevo o editado aquí
    });
    return [...out.values()];
  }

  async function fetchKey(key){
    const r = await fetch('api/kv/' + encodeURIComponent(key), {cache: 'no-store'});
    if(!r.ok) throw new Error('No se pudo leer ' + key);
    const d = await r.json();
    return d.value === null || d.value === undefined ? null : d.value;
  }

  window.storage = {
    async get(key, shared){
      if(!shared){
        const v = localStorage.getItem('frigor-v3:' + key);
        return v === null ? null : {key, value: v};
      }
      const v = await fetchKey(key);
      if(v === null) return null;
      base[key] = JSON.parse(v);
      return {key, value: v};
    },
    async set(key, value, shared){
      if(!shared){ localStorage.setItem('frigor-v3:' + key, value); return {key, value}; }
      saving++;
      try{
        const local = JSON.parse(value);
        const serverRaw = await fetchKey(key);
        let merged = serverRaw === null ? local : merge3(base[key], local, JSON.parse(serverRaw));
        if(key === 'audit-log-v1' && Array.isArray(merged)){
          merged.sort((a, c) => String(a.fecha).localeCompare(String(c.fecha)));
          merged = merged.slice(-500);
        }
        const body = JSON.stringify(merged);
        const r = await fetch('api/kv/' + encodeURIComponent(key), {
          method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: body})});
        if(!r.ok) throw new Error('No se pudo guardar ' + key);
        base[key] = merged;
        if(body !== JSON.stringify(local)) queueRefresh(0);   // otro gerente cambió algo
        return {key, value: body};
      } finally { saving--; }
    },
  };

  // Trae los cambios de los demás sin interrumpir a quien está trabajando
  let timer = null;
  function busy(){
    const modal = document.querySelector('#objModalBg.active');
    const a = document.activeElement;
    return saving > 0 || document.hidden || !!modal || (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName));
  }
  async function refresh(){
    if(busy()){ queueRefresh(5000); return; }
    try{
      if(typeof loadPeriodos === 'function') await loadPeriodos();
      if(typeof loadAuditLog === 'function') await loadAuditLog();
      if(typeof renderLogTable === 'function') renderLogTable();
      if(typeof loadGerencias === 'function'){
        await loadGerencias();
        if(typeof renderGerenciasList === 'function') renderGerenciasList();
        if(typeof renderDependeDeSelect === 'function') renderDependeDeSelect();
        if(typeof renderAreaWizardSelect === 'function') renderAreaWizardSelect();
      }
      if(typeof loadData === 'function') await loadData();
    }catch(e){ /* sin conexión: se reintenta en el próximo ciclo */ }
    queueRefresh(30000);
  }
  function queueRefresh(ms){ clearTimeout(timer); timer = setTimeout(refresh, ms); }
  window.addEventListener('load', () => queueRefresh(30000));
  window.addEventListener('load', () => {
  // Aviso si el servidor no guarda de forma permanente
  fetch('api/health', {cache: 'no-store'}).then(r => r.json()).then(h => {
    if(h.persistente !== false) return;
    const d = document.createElement('div');
    d.textContent = 'Atención: el servidor no tiene base de datos conectada. Todo lo que guardes se borrará en la próxima actualización. Avisa a quien administra Railway.';
    d.setAttribute('role', 'alert');
    d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#B23A30;color:#fff;padding:10px 16px;font:600 13px system-ui,sans-serif;text-align:center';
    document.body.appendChild(d);
  }).catch(() => {});
  });
})();
