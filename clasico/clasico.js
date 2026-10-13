/* Lo Sabe, No Lo Sabe · App clásica (recreación 2D de la app oficial de 2012). ES5 puro para WebViews antiguos (Android 4.4). */
(function () {
'use strict';
var D = window.LSN_DATOS, A = 'a/', app = document.getElementById('app'), lat = document.getElementById('lateral');
function $(t) { var d = document.createElement('div'); d.innerHTML = t; return d.firstChild; }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function img(n) { return A + n + '.png'; }
function avatar(n) { return n ? '../gfx/avatar_' + n + '.png' : img('img_avatar_def_thumb'); }
function carga(k, def) { try { var v = localStorage.getItem('lsnc_' + k); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
function guarda(k, v) { try { localStorage.setItem('lsnc_' + k, JSON.stringify(v)); } catch (e) {} }
var yo = carga('perfil', null), puntos = carga('puntos', 0), poderes = carga('poderes', 10), aj = carga('ajustes', { sonido: true, vibra: true, resul: true, activa: true });
var pend = carga('pend', []), usadas = carga('usadas', []);
// ---------- sonidos de la app (res/raw: arpa, win, lose) ----------
var SND = {}; function snd(n) { if (!aj.sonido) return; try { var a = SND[n] || (SND[n] = new Audio(A + n + '.mp3')); a.currentTime = 0; var p = a.play(); if (p && p['catch']) p['catch'](function () {}); } catch (e) {} }
function vibra(ms) { if (aj.vibra && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {} }
var desbloq = false; function unlock() { if (desbloq) return; desbloq = true; ['arpa', 'win', 'lose'].forEach(function (n) { try { var a = SND[n] = new Audio(A + n + '.mp3'); a.muted = true; var p = a.play(); var f = function () { a.pause(); a.currentTime = 0; a.muted = false; }; if (p && p.then) p.then(f, f); else f(); } catch (e) {} }); }
document.addEventListener('touchstart', unlock, true); document.addEventListener('mousedown', unlock, true);
function aviso(t, ms) { var a = document.getElementById('aviso'); a.innerHTML = t; a.style.display = 'block'; clearTimeout(aviso.t); aviso.t = setTimeout(function () { a.style.display = 'none'; }, ms || 2200); }
// ---------- cabeceras ----------
function cabMain() { return '<div class="cab"><div class="ib" data-a="menu"><img src="' + img('ic_header_show_slidemenu') + '"></div><div class="ib" data-a="notif"><img src="' + img('ic_notification_menu') + '" style="max-width:40px;max-height:40px"></div><div class="mid"><div class="pts">' + puntos + '</div><div class="ptl">PUNTOS</div></div><div class="ib d" data-a="perfil"><img src="' + img('ic_avatar') + '"></div><div class="ib d" data-a="compartir"><img src="' + img('ic_header_share') + '"></div></div>'; }
function cabVolver(tit, icono) { return '<div class="cab"><div class="ib" data-a="volver"><img src="' + img('abs__ic_ab_back_holo_dark') + '"></div><div class="mid tit">' + (icono ? '<img src="' + img(icono) + '">' : '') + esc(tit) + '</div><div style="width:56px"></div></div>'; }
function cabJuego() { return '<div class="cab"><div class="ib" data-a="volver"><img src="' + img('abs__ic_ab_back_holo_dark') + '"></div><div class="mid"><div class="pts">' + puntos + '</div><div class="ptl">PUNTOS</div></div><div class="ib d" data-a="perfil"><img src="' + img('ic_avatar') + '"></div><div class="ib d" data-a="compartir"><img src="' + img('ic_header_share') + '"></div></div>'; }
var pila = [], actual = null;
function ir(nombre, arg, sinPila) { if (actual && !sinPila) pila.push(actual); actual = { n: nombre, a: arg }; cierraLat(); PANT[nombre](arg); app.scrollTop = 0; }
function volver() { var p = pila.pop(); if (!p) { if (window.parent !== window) try { window.parent.postMessage('lsn-salir', '*'); } catch (e) {} return; } actual = p; PANT[p.n](p.a); }
function pinta(html, onClick) {
  app.innerHTML = html; var els = app.querySelectorAll('[data-a]');
  for (var i = 0; i < els.length; i++) (function (el) { el.onclick = function (ev) { ev.stopPropagation(); var a = el.getAttribute('data-a'), v = el.getAttribute('data-v'); if (COMUN[a]) COMUN[a](v); else if (onClick) onClick(a, v, el); }; })(els[i]);
}
var COMUN = { menu: abreLat, volver: volver, perfil: function () { ir(yo ? 'perfil' : 'crear'); }, notif: function () { ir('notif'); }, compartir: function () { aviso('Compartir no está disponible en esta versión sin conexión 🙂'); }, tienda: function () { ir('tienda'); } };
// ---------- menú lateral (sliding menu) ----------
var MEN = [['jugar', 'JUGAR', 'ic_thumbs_up_white'], ['ranking', 'Ranking', 'ic_ranking'], ['programas', 'Programas', 'ic_programs'], ['notif', 'Notificaciones', 'ic_notification_menu'], ['tienda', 'Super Poderes', 'ic_power_sliding'], ['molona', 'Pregunta Molona', 'ic_cool_question'], ['ajustes', 'Ajustes', 'ic_settings'], ['guia', 'Guía del juego', 'ic_game_guide'], ['about', 'About', 'ic_about']];
function abreLat() {
  var h = '<div style="text-align:center;padding:10px 0 4px;background:#1b1b1b"><img src="' + img('logo_lsnls_side') + '" style="max-width:70%"></div><div class="yo"><img src="' + avatar(yo && yo.av) + '"><div><b>' + esc(yo ? yo.nick : 'Invitado') + '</b><br><small style="color:#a09e9e">' + puntos + ' PUNTOS · ' + poderes + ' SUPERPODERES</small></div></div>';
  for (var i = 0; i < MEN.length; i++) h += '<div class="it" data-m="' + MEN[i][0] + '"><img src="' + img(MEN[i][2]) + '">' + MEN[i][1] + '</div>';
  lat.innerHTML = h; lat.className = 'on'; var its = lat.querySelectorAll('[data-m]');
  for (var j = 0; j < its.length; j++) its[j].onclick = function () { snd('arpa'); var m = this.getAttribute('data-m'); cierraLat(); pila = []; ir(m === 'jugar' ? 'pregunta' : m, null, true); actual.raiz = true; pila = [{ n: 'main' }]; };
}
function cierraLat() { lat.className = ''; }
document.getElementById('tel').addEventListener('click', function (e) { if (lat.className && !lat.contains(e.target)) cierraLat(); }, false);
// ---------- pantallas ----------
var PANT = {};
PANT.splash = function () {
  app.innerHTML = '<div class="splash" id="spl"><img src="' + img('img_mediaset_splash') + '"><img src="' + img('img_mandarina_splash') + '"><img src="' + img('img_quadram_splash') + '"></div>';
  var hecho = false, fin = function () { if (hecho) return; hecho = true; ir('main', null, true); }; document.getElementById('spl').onclick = fin; setTimeout(fin, 2200);
};
PANT.main = function () {
  pinta(cabMain() + '<div class="cuerpo fondo"><div class="mainc"><div><div class="btnr" data-a="guia"><img src="' + img('ic_game_guide') + '"><span>GUÍA DEL JUEGO</span></div>' +
    (yo ? '<div class="btnr" data-a="perfil"><img src="' + img('ic_avatar') + '"><span>' + esc(yo.nick.toUpperCase()) + '</span></div>' : '<div class="btnr" data-a="crear"><img src="' + img('ic_avatar') + '"><span>CREAR PERFIL</span></div>') +
    '</div><img class="logo" src="' + img('logo_lsnls') + '"><div class="btnr" data-a="pregunta"><img src="' + img('ic_thumbs_up_white') + '"><span>¡NUEVA PREGUNTA!</span></div></div></div>',
    function (a) { snd('arpa'); ir(a); });
};
function formPerfil(p, guardar) {
  var f = p ? JSON.parse(JSON.stringify(p)) : { nick: '', av: 0, edad: '', sexo: '', prof: '', hobby: '' };
  function fila(k, vals) { var h = '<div class="fila">'; for (var i = 0; i < vals.length; i++) h += '<div data-a="set" data-v="' + k + '|' + vals[i] + '" class="' + (f[k] === vals[i] ? 'on' : '') + '">' + vals[i] + '</div>'; return h + '</div>'; }
  function lista(k, vals) { var h = '<div class="lista">'; for (var i = 0; i < vals.length; i++) h += '<div data-a="set" data-v="' + k + '|' + vals[i] + '" class="' + (f[k] === vals[i] ? 'on' : '') + '">' + vals[i] + '</div>'; return h + '</div>'; }
  function dibuja() {
    pinta(cabVolver('Perfil', 'ic_avatar_garnet') + '<div class="cuerpo"><div class="txtg">Crea tu perfil para acumular puntos y ganar fantásticos premios.</div>' +
      '<div class="lab"><img src="' + img('ic_dot') + '">Nick</div><input class="nick" id="nick" placeholder="Escribe tu NICK" maxlength="16" value="' + esc(f.nick) + '">' +
      '<div class="lab"><img src="' + img('ic_dot') + '">Avatar</div><div class="selav"><img src="' + avatar(f.av) + '"><div class="btnr c" data-a="avatar"><span>SELECCIONAR AVATAR</span></div></div>' +
      '<div class="lab"><img src="' + img('ic_dot') + '">Edad</div>' + fila('edad', D.edades) + '<div class="lab"><img src="' + img('ic_dot') + '">Sexo</div>' + fila('sexo', ['Hombre', 'Mujer']) +
      '<div class="lab"><img src="' + img('ic_dot') + '">Profesión</div>' + lista('prof', D.profesiones) + '<div class="lab"><img src="' + img('ic_dot') + '">Hobby</div>' + lista('hobby', D.hobbies) +
      '<div class="btnr c" data-a="guardar"><span>GUARDAR PERFIL</span></div>' + (p ? '' : '<div class="txtg" data-a="sinpuntos" style="text-decoration:underline;cursor:pointer">JUGAR SIN PUNTOS</div>') + '<div style="height:20px"></div></div>',
      function (a, v) {
        f.nick = document.getElementById('nick').value;
        if (a === 'set') { var k = v.split('|'); f[k[0]] = k[1]; snd('arpa'); var y = app.querySelector('.cuerpo').scrollTop; dibuja(); app.querySelector('.cuerpo').scrollTop = y; }
        else if (a === 'avatar') { ir('avatares', { f: f, fin: dibuja }); }
        else if (a === 'sinpuntos') { ir('pregunta', null, true); pila = [{ n: 'main' }]; }
        else if (a === 'guardar') { if (!f.nick || !f.edad || !f.sexo || !f.prof || !f.hobby) return aviso('Debes rellenar todos los campos.'); if (!f.av) f.av = 1; guardar(f); }
      });
  }
  dibuja();
}
PANT.crear = function () { formPerfil(null, function (f) { yo = f; guarda('perfil', yo); snd('win'); pila = [{ n: 'main' }]; ir('perfil', null, true); }); };
PANT.editar = function () { formPerfil(yo, function (f) { yo = f; guarda('perfil', yo); volver(); }); };
PANT.avatares = function (o) {
  var h = cabVolver('Avatares', 'ic_avatar_garnet') + '<div class="cuerpo"><div class="txtg">Selecciona tu propio avatar.</div><div class="avs">';
  for (var i = 1; i <= 30; i++) h += '<img data-a="av" data-v="' + i + '" src="' + avatar(i) + '" class="' + (o.f.av === i ? 'on' : '') + '">';
  pinta(h + '</div></div>', function (a, v) { o.f.av = +v; snd('arpa'); pila.pop(); actual = { n: 'crear' }; o.fin(); });
};
PANT.perfil = function () {
  if (!yo) return PANT.crear();
  pinta(cabVolver('Perfil', 'ic_avatar_garnet') + '<div class="cuerpo"><div class="perfav" data-a="editar"><img class="a" src="' + avatar(yo.av) + '"><img class="f" src="' + img('img_arrow_profile_avatar') + '"></div><div class="placa">' + esc(yo.nick) + '</div>' +
    '<div class="marc"><span class="n">' + puntos + '</span><span class="l">PUNTOS</span><span class="sp"><img src="' + img('ic_power_start') + '" style="width:34px;position:relative;z-index:1"><span class="pw">' + poderes + '</span><span class="l" style="margin:0 0 0 6px">SUPER<br>PODERES</span></span></div>' +
    '<div class="grid"><div>Edad<b>' + esc(yo.edad) + '</b></div><div>Sexo<b>' + esc(yo.sexo) + '</b></div><div>Hobby<b>' + esc(yo.hobby) + '</b></div><div>Profesión<b>' + esc(yo.prof) + '</b></div></div>' +
    '<div class="btnr c" data-a="editar"><span>EDITAR PERFIL</span></div></div>', function (a) { ir(a); });
};
// ---------- juego ----------
var J = null;
function nivel(p) { return p.d < 0.4 ? 15 : p.d < 0.7 ? 25 : 35; }
function nuevaPregunta() {
  var libres = []; for (var i = 0; i < D.preguntas.length; i++) if (usadas.indexOf(i) < 0) libres.push(i);
  if (!libres.length) { usadas = []; libres = D.preguntas.map(function (x, i) { return i; }); }
  var k = libres[Math.floor(Math.random() * libres.length)]; usadas.push(k); guarda('usadas', usadas);
  var p = D.preguntas[k]; return { p: p, k: k, apuesta: false, pts: nivel(p), modo: 'simple', crit: {}, red: 0 };
}
function banner() { return '<div class="sp-ban" data-a="tienda"><img class="s" src="' + img('ic_power_start') + '"><span class="pw">' + poderes + '</span><div class="t"><small>CONSIGUE</small><b>¡SUPERPODERES!</b></div><span class="shop"><img src="' + img('ic_shop') + '"></span></div>'; }
PANT.pregunta = function () {
  if (!J || J.hecha) J = nuevaPregunta();
  function dibuja() {
    pinta(cabJuego() + '<div class="cuerpo">' + banner() + '<div class="preg">' + esc(J.p.q) + '</div>' +
      '<div class="apu"><img src="' + img(J.apuesta ? 'ic_arrow_lo_sabe' : 'ic_arrow_no_lo_sabe') + '"><div class="caja ' + (J.apuesta ? 'si' : '') + '" data-a="toggle">' + (J.apuesta ? 'Si lo sabe' : 'No lo sabe') + '</div><div class="ptsb"><div>+' + J.pts + '</div><small>PUNTOS</small></div></div>' +
      '<div class="hint">Para responder a la pegunta selecciona a tu ayudante</div><div class="btnr" data-a="ayudante" style="margin-top:6px"><img src="' + img('ic_choose_helper') + '" style="width:26px;margin-left:12px"><span style="margin-right:20px;font-size:17px">SELECCIONA A TU AYUDANTE</span></div></div>',
      function (a) { if (a === 'toggle') { J.apuesta = !J.apuesta; snd('arpa'); vibra(20); dibuja(); } else if (a === 'ayudante') { snd('arpa'); ir('ayudante'); } });
  }
  dibuja();
};
PANT.ayudante = function () {
  function bloque(k, tit, vals) { var h = '<div class="lab"><img src="' + img('ic_dot') + '">' + tit + '</div><div class="fila" style="-webkit-flex-wrap:wrap;flex-wrap:wrap">'; for (var i = 0; i < vals.length; i++) h += '<div style="min-width:25%;font-size:15px;padding:14px 4px" data-a="crit" data-v="' + k + '|' + vals[i] + '" class="' + (J.crit[k] === vals[i] ? 'on' : '') + '">' + vals[i] + '</div>'; return h + '</div>'; }
  function dibuja() {
    var t = J.modo, h = cabJuego() + '<div class="cuerpo"><div class="tabs"><div data-a="tab" data-v="simple" class="' + (t === 'simple' ? 'on' : '') + '">Simple</div><div data-a="tab" data-v="multi" class="' + (t === 'multi' ? 'on' : '') + '">Multiselección</div><div data-a="tab" data-v="red" class="' + (t === 'red' ? 'on' : '') + '">Reducción</div></div>';
    if (t === 'red') {
      h += '<div class="tit2">REDUCCIÓN</div><div class="sub2">Reduce las respuestas de tu ayudante</div>' +
        '<div class="op ' + (J.red === 3 ? 'on' : '') + '" data-a="red" data-v="3"><img src="' + img('ic_reduction_three') + '" style="vertical-align:middle;margin-right:8px">REDUCIR A 3 RESPUESTAS<br><small style="color:#da9625">x 1 SUPERPODER</small></div>' +
        '<div class="op ' + (J.red === 2 ? 'on' : '') + '" data-a="red" data-v="2"><img src="' + img('ic_reduction_two') + '" style="vertical-align:middle;margin-right:8px">REDUCIR A 2 RESPUESTAS<br><small style="color:#da9625">x 2 SUPERPODERES</small></div>';
    } else {
      h += '<div class="tit2">' + (t === 'simple' ? 'SIMPLE' : 'MULTISELECCIÓN') + '</div><div class="sub2">' + (t === 'simple' ? 'Selecciona a tu ayundate para obtener la mejor respuesta' : 'Aumenta tus puntos eligiendo mejor a tu ayudante · x 1 SUPERPODER') + '</div>' +
        bloque('edad', 'Edad', D.edades) + bloque('sexo', 'Sexo', ['Hombre', 'Mujer']) + bloque('prof', 'Profesión', D.profesiones) + bloque('hobby', 'Hobby', D.hobbies);
    }
    pinta(h + '<div class="btnr c" data-a="enviar"><span>ENVIAR PREGUNTA</span></div><div style="height:16px"></div></div>', function (a, v) {
      var y = app.querySelector('.cuerpo').scrollTop;
      if (a === 'tab') { J.modo = v; J.crit = {}; J.red = 0; snd('arpa'); dibuja(); return; }
      if (a === 'crit') { var k = v.split('|'); if (J.modo === 'simple') { var o = J.crit[k[0]] === k[1]; J.crit = {}; if (!o) J.crit[k[0]] = k[1]; } else { if (J.crit[k[0]] === k[1]) delete J.crit[k[0]]; else J.crit[k[0]] = k[1]; } snd('arpa'); dibuja(); app.querySelector('.cuerpo').scrollTop = y; return; }
      if (a === 'red') { J.red = +v; snd('arpa'); dibuja(); return; }
      if (a === 'enviar') {
        var n = 0; for (var x in J.crit) n++; var coste = J.modo === 'multi' ? 1 : J.modo === 'red' ? (J.red === 2 ? 2 : 1) : 0;
        if (J.modo === 'red' && !J.red) return aviso('Selecciona algún criterio de búsqueda.'); if (J.modo !== 'red' && !n) return aviso('Selecciona algún criterio de búsqueda.');
        if (coste > poderes) return aviso('No tienes créditos suficientes, puedes pasar por la tienda y comprar. :)');
        poderes -= coste; guarda('poderes', poderes); J.coste = coste; ir('espera');
      }
    });
  }
  dibuja();
};
function textoCrit() { if (J.modo === 'red') return 'reduzca a ' + J.red + ' respuestas'; var t = []; for (var k in J.crit) t.push(k === 'edad' ? 'tenga ' + J.crit[k] + ' años' : k === 'sexo' ? 'sea ' + J.crit[k].toLowerCase() : k === 'prof' ? 'sea ' + J.crit[k].toLowerCase() : 'le guste ' + J.crit[k].toLowerCase()); return t.join(', '); }
function buscaAyudante() {
  var c = [], i; for (i = 0; i < D.ayudantes.length; i++) { var a = D.ayudantes[i], ok = true; for (var k in J.crit) if (a[k] !== J.crit[k]) ok = false; if (ok) c.push(a); }
  if (!c.length) { c = D.ayudantes.slice(); }
  var h = c[Math.floor(Math.random() * c.length)];
  // probabilidad de que lo sepa: su saber, la dificultad y si su hobby/profesión encaja con el tema; los superpoderes ayudan
  var pr = h.saber * (1.15 - J.p.d * .6); var afin = { cine: 'Cine', musica: 'Música', deporte: 'Deporte', historia: 'Historia', ciencia: 'Ciencia', cocina: 'Cocina', geografia: 'Viajes', moda: 'Moda', tele: 'Cine', literatura: 'Lectura' }[J.p.c];
  if (afin && h.hobby === afin) pr += .3; if (J.modo === 'multi') pr += .08; if (J.modo === 'red') pr += J.red === 2 ? .25 : .15;
  var sabe = Math.random() < Math.max(.08, Math.min(.95, pr));
  return { h: h, sabe: sabe };
}
PANT.espera = function () {
  pinta(cabJuego() + '<div class="cuerpo"><div class="espera"><img src="' + img('ic_timer_grey') + '"><p>Buscamos un ayudante que<br><b>' + esc(textoCrit()) + '</b><br>y tu respuesta es<br><b>' + (J.apuesta ? 'Si lo sabe' : 'No lo sabe') + '</b>.</p><small style="color:#808080">Es cuestión de tiempo que tus ayudantes te contesten.</small></div></div>');
  var mio = J; setTimeout(function () { if (J !== mio || actual.n !== 'espera') return; var r = buscaAyudante(); J.h = r.h; J.sabe = r.sabe; J.gana = (J.apuesta === r.sabe); J.hecha = true; puntos = Math.max(0, puntos + (J.gana ? J.pts : -J.pts)); guarda('puntos', puntos); ir('respondido', null, true); }, 2600);
};
PANT.respondido = function () {
  var h = J.h, respuesta = J.sabe ? J.p.a : J.p.m;
  if (J.gana) snd('win'); else snd('lose'); vibra(J.gana ? 60 : 200);
  pinta(cabJuego() + '<div class="cuerpo"><div class="txtg" style="padding-bottom:0">Te han respondido</div><div class="resp"><img src="' + avatar(h.av) + '"><div><b>' + esc(h.nick) + '</b><div class="q">' + esc(h.edad) + ' · ' + esc(h.sexo) + ' · ' + esc(h.prof) + ' · ' + esc(h.hobby) + '</div><div class="r"><img src="' + img('img_green_response_arrow') + '" style="width:20px;margin-right:6px">' + esc(respuesta) + '</div></div></div>' +
    '<div class="resul"><img class="t" src="' + img(J.gana ? 'ic_thumbs_up_win' : 'ic_thumbs_down_lose') + '"><div class="ac">Acabas de</div><div class="gp ' + (J.gana ? 'g">GANAR' : 'p">PERDER') + '</div><div class="gp ' + (J.gana ? 'g' : 'p') + '" style="font-size:34px">' + (J.gana ? '+' : '-') + J.pts + ' PUNTOS</div>' +
    '<div class="cr">' + (J.sabe ? 'Si lo sabe' : 'No lo sabe') + ' · tú dijiste <b style="display:inline;color:' + (J.gana ? '#2cd058' : '#d21301') + '">' + (J.apuesta ? 'Si lo sabe' : 'No lo sabe') + '</b><br>RESPUESTA CORRECTA:<b>' + esc(J.p.a) + '</b></div>' +
    '<div class="fb"><img data-a="fb" data-v="good" src="' + img('ic_feedback_good_normal') + '"><img data-a="fb" data-v="regular" src="' + img('ic_feedback_regular_normal') + '"><img data-a="fb" data-v="bad" src="' + img('ic_feedback_bad_normal') + '"></div>' +
    '<div class="btnr c" data-a="otra"><span>CONTINUAR JUGANDO</span></div></div></div>', function (a, v, el) {
      if (a === 'fb') { var fs = app.querySelectorAll('[data-a=fb]'); for (var i = 0; i < fs.length; i++) fs[i].src = img('ic_feedback_' + fs[i].getAttribute('data-v') + '_normal'); el.src = img('ic_feedback_' + v + '_checked'); snd('arpa'); }
      if (a === 'otra') { snd('arpa'); J = null; pila = [{ n: 'main' }]; ir('pregunta', null, true); }
    });
  // de vez en cuando entra una solicitud: alguien te pide que respondas tú (Tu respondes)
  if (Math.random() < .5 && pend.length < 5) { var k = Math.floor(Math.random() * D.preguntas.length), a = D.ayudantes[Math.floor(Math.random() * D.ayudantes.length)]; pend.push({ k: k, de: a.nick, av: a.av }); guarda('pend', pend); }
};
// ---------- notificaciones: solicitudes para que respondas tú ----------
PANT.notif = function () {
  var h = cabVolver('Notificaciones') + '<div class="cuerpo"><div class="tabs"><div class="on">Tu respondes</div></div><div class="txtg">' + pend.length + ' Preguntas Pendientes</div>';
  for (var i = 0; i < pend.length; i++) h += '<div class="pend"><img src="' + avatar(pend[i].av) + '"><div class="t"><b>' + esc(pend[i].de) + '</b><br>' + esc(D.preguntas[pend[i].k].q) + '</div><div class="b" data-a="resp" data-v="' + i + '">RESPONDER</div></div>';
  if (!pend.length) h += '<div class="txtg">No tienes solicitudes. Juega para que otros jugadores te pregunten.</div>';
  pinta(h + '</div>', function (a, v) { ir('responder', +v); });
};
PANT.responder = function (i) {
  var s = pend[i], p = D.preguntas[s.k], ops = Math.random() < .5 ? [p.a, p.m] : [p.m, p.a], sel = -1;
  function dibuja() {
    var h = cabVolver('Responder') + '<div class="cuerpo"><div class="resp"><img src="' + avatar(s.av) + '"><div><b>' + esc(s.de) + '</b><div class="q">te ha elegido como ayudante</div></div></div><div class="preg">' + esc(p.q) + '</div>';
    for (var j = 0; j < 2; j++) h += '<div class="op ' + (sel === j ? 'on' : '') + '" data-a="op" data-v="' + j + '">' + esc(ops[j]) + '</div>';
    pinta(h + '<div class="btnr c" data-a="ok"><span>RESPONDER</span></div></div>', function (a, v) {
      if (a === 'op') { sel = +v; snd('arpa'); dibuja(); return; }
      if (sel < 0) return aviso('Para contestar debes seleccionar una respuesta.');
      var bien = ops[sel] === p.a; pend.splice(i, 1); guarda('pend', pend); if (bien) { puntos += 5; guarda('puntos', puntos); snd('win'); aviso('¡CORRECTA! +5 PUNTOS'); } else { snd('lose'); aviso('INCORRECTA. La respuesta es ' + esc(p.a)); } volver();
    });
  }
  dibuja();
};
// ---------- tienda (gratis en esta versión) ----------
PANT.tienda = function () {
  pinta('<div class="cuerpo" style="background:#3b677b"><div class="shopv"><div style="text-align:right"><img src="' + img('ic_power_start') + '" style="width:30px;vertical-align:middle"><span class="pw" style="font-size:18px">' + poderes + '</span> <span data-a="volver" style="display:inline-block;margin-left:10px;color:#fff;font-size:24px;cursor:pointer">✕</span></div>' +
    '<img class="sp" src="' + img('img_super_power') + '"><div>CONSIGUE</div><h3>¡SUPERPODERES!</h3><p><b>Acumula más puntos</b> seleccionando mejor a tu ayudante o disminuyendo las respuestas.</p>' +
    '<div class="prods"><div class="prod" data-a="c" data-v="2"><small>SUPERPODERES</small><div class="x">x 2</div><span class="pr">GRATIS</span></div><div class="prod" data-a="c" data-v="99" style="min-height:120px"><span class="of">oferta</span><div style="color:#da9625">★ ★ ★</div><div class="x" style="font-size:22px">SUPER PODERES INFINITOS</div><small>*Válido durante un mes</small><br><span class="pr">GRATIS</span></div>' +
    '<div class="prod" data-a="c" data-v="8"><small>SUPERPODERES</small><div class="x">x 6 <small style="background:#da9625;color:#112933;font:bold 12px sans-serif;padding:2px 6px">2 gratis</small></div><span class="pr">GRATIS</span></div></div>' +
    '<p style="color:#112933;font-size:12px">Copia privada sin conexión: aquí los superpoderes no cuestan dinero.</p></div></div>', function (a, v) { poderes = +v === 99 ? 999 : poderes + (+v); guarda('poderes', poderes); snd('win'); aviso('Superpoderes Actuales: ' + poderes); PANT.tienda(); });
};
// ---------- guía del juego (tour) ----------
var TOUR = [['img_tour_winner', '¡EMPIEZA A JUGAR!', 'Desde la pantalla principal o desde el menú lateral (JUGAR), recibirás una pregunta y tendrás que seleccionar a un ayudante. Con cada pregunta que tus ayudantes respondan, podrás sumar o restar puntos <b>(15, 25 ó 35) puntos</b>, dependiendo del nivel de la pregunta.'],
  ['img_tour_profile', 'CREA TU PERFIL', 'Si quieres acumular puntos y ganar premios <b>crea tu perfil</b>.'], ['img_tour_helper', 'SELECCIONA AYUDANTE', 'Elige si tu ayudante <b>lo sabe o no lo sabe</b> y búscalo por edad, sexo, profesión u hobby.'],
  ['img_tour_powers', 'SUPERPODERES', 'Utiliza los <b>superpoderes</b> para escoger mejor a tu ayudante.'], ['img_tour_notifications', 'NOTIFICACIONES', 'Es cuestión de tiempo que tus ayudantes te contesten. En el panel de notificaciones podrás consultar el estado de tus preguntas enviadas y si tienes algunas pendientes por contestar.'],
  ['img_tour_winner', '¡ENHORABUENA!', '<b>Suma puntos</b> con cada pregunta acertada. <b>Consulta el ranking</b> para ver tu posición y puntos acumulados ¿estás en Top 5?.']];
PANT.guia = function (n) {
  n = n || 0; var t = TOUR[n], d = ''; for (var i = 0; i < TOUR.length; i++) d += '<i class="' + (i === n ? 'on' : '') + '"></i>';
  pinta(cabVolver('Guía del Juego', 'ic_game_guide_garnet'.replace('_garnet', '')) + '<div class="cuerpo"><div class="tour"><h3>' + t[1] + '</h3><img src="' + img(t[0]) + '"><p>' + t[2] + '</p></div><div class="dots">' + d + '</div>' +
    '<div class="btnr c" data-a="sig"><span>' + (n < TOUR.length - 1 ? 'SIGUIENTE' : '¡NUEVA PREGUNTA!') + '</span></div></div>', function () { snd('arpa'); if (n < TOUR.length - 1) { actual.a = n + 1; PANT.guia(n + 1); } else { pila = [{ n: 'main' }]; ir('pregunta', null, true); } });
};
// ---------- ranking (local) ----------
PANT.ranking = function () {
  var l = []; for (var i = 0; i < 12; i++) { var a = D.ayudantes[(i * 7) % D.ayudantes.length]; l.push({ n: a.nick, av: a.av, s: 1450 - i * 97 - (i * i * 3) }); }
  l.push({ n: yo ? yo.nick : 'Tú', av: yo ? yo.av : 0, s: puntos, yo: true }); l.sort(function (a, b) { return b.s - a.s; });
  var h = cabVolver('Ranking', 'ic_ranking') + '<div class="cuerpo"><div class="tabs"><div class="on">RANKING TOP 5</div><div>TU POSICIÓN</div></div>';
  for (var j = 0; j < l.length; j++) h += '<div class="rk ' + (l[j].yo ? 'yo' : '') + '"><span class="p">' + (j + 1) + 'º</span><img src="' + avatar(l[j].av) + '"><span class="n">' + esc(l[j].n) + '</span><span class="s">' + l[j].s + '</span></div>';
  pinta(h + '</div>');
};
PANT.programas = function () {
  var h = cabVolver('Programas', 'ic_programs') + '<div class="cuerpo">'; for (var i = 0; i < D.historia.length; i++) h += '<div class="pend"><div class="t"><b style="color:#d21301">' + esc(D.historia[i][0]) + ' · ' + esc(D.historia[i][1]) + '</b><br>' + esc(D.historia[i][2]) + '</div></div>';
  pinta(h + '</div>');
};
PANT.molona = function () {
  pinta(cabVolver('Pregunta Molona', 'ic_cool_question') + '<div class="cuerpo"><div class="txtg">Envíanos una <b style="color:#d21301">PREGUNTA MOLONA</b> con su<br>correspondiente respuesta y podrá formar parte del juego</div><div class="lab">PREGUNTA</div><textarea class="mol" id="mq"></textarea><div class="lab">RESPUESTA</div><textarea class="mol" id="mr" style="height:50px"></textarea><div class="btnr c" data-a="env"><span>ENVIAR MI PREGUNTA</span></div></div>',
    function () { var q = document.getElementById('mq').value, r = document.getElementById('mr').value; if (!q || !r) return aviso('Debes rellenar todos los campos.'); var m = carga('molonas', []); m.push([q, r]); guarda('molonas', m); aviso('Tu pregunta se ha enviado correctamente.'); volver(); });
};
PANT.ajustes = function () {
  function sw(k, t) { return '<div class="r"><span>' + t + '</span><span class="sw ' + (aj[k] ? 'on' : '') + '" data-a="sw" data-v="' + k + '">' + (aj[k] ? 'ON' : 'OFF') + '</span></div>'; }
  pinta(cabVolver('Ajustes', 'ic_settings') + '<div class="cuerpo ajs"><h4>SONIDOS</h4>' + sw('sonido', 'Activiar sonido') + sw('vibra', 'Activar vibración') + sw('resul', 'Sonidos en los resultados') + '<h4>JUEGO</h4>' + sw('activa', 'PANTALLA ACTIVA') +
    '<div class="r"><span>Superpoderes Actuales: ' + poderes + '</span></div><div class="r"><span>Max. preguntas pendientes: 5</span></div><h4>TIENDA</h4><div class="r" data-a="tienda"><span>COMPRAR SUPERPODERES</span><img src="' + img('ic_list_next') + '"></div>' +
    '<div class="r" data-a="borra"><span>RECUPERAR PERFIL · empezar de cero</span><img src="' + img('ic_list_next') + '"></div><div class="r" data-a="guia"><span>Guía del juego</span><img src="' + img('ic_list_next') + '"></div></div>', function (a, v) {
      if (a === 'sw') { aj[v] = !aj[v]; guarda('ajustes', aj); PANT.ajustes(); } else if (a === 'borra') { if (confirm('¿Borrar perfil y puntos?')) { yo = null; puntos = 0; poderes = 10; pend = []; guarda('perfil', null); guarda('puntos', 0); guarda('poderes', 10); guarda('pend', []); pila = []; ir('main', null, true); } } else ir(a);
    });
};
PANT.about = function () {
  function b(a, t, k) { return '<div class="r" data-a="' + a + '" style="background:#2e2e2e;margin:' + (k ? '0' : '0') + ';border-bottom:1px solid #1b1b1b"><span>' + t + '</span><img src="' + img('btn_about_arrow') + '"></div>'; }
  pinta(cabVolver('About', 'ic_about') + '<div class="cuerpo ajs" style="text-align:center"><img src="' + img('logo_lsnls') + '" style="width:55%;max-width:240px;margin:14px auto 6px;display:block"><img src="' + img('logo_quadram') + '" style="max-width:60%;margin:6px auto;display:block"><div style="color:#a09e9e;font-size:13px;margin:8px 0">Aplicación desarrollada y diseñada<br>por QUADRAM</div><div style="color:#a09e9e;font-size:13px;margin-bottom:14px">www.quadramqs.com</div>' +
    b('valora', 'Valorar Aplicación') + b('molona', 'Enviar Feedback') + b('guia', 'Soporte') + '<div style="color:#a09e9e;font-size:12px;margin-top:14px">Version 1.1 · copia privada de Iker</div></div>', function (a) {
      if (a === 'valora') aviso('¡Gracias! Esta copia es solo tuya, así que tu valoración ya cuenta: ⭐⭐⭐⭐⭐'); else ir(a);
    });
};
window.__lsnClasico = { ir: ir, estado: function () { return { yo: yo, puntos: puntos, J: J }; } };
var q = /[?&]p=(\w+)/.exec(location.search); ir(q && PANT[q[1]] ? q[1] : 'splash', null, true);
})();
